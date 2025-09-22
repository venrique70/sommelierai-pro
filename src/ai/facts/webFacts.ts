// src/ai/facts/webFacts.ts
// RAG mínimo: buscar ficha pública y extraer uvas / barrica / país
// - No inventa: si no encuentra nada fiable, devuelve null
// - Respeta una lista blanca de dominios confiables
// - Cache simple en memoria (10 min) para reducir llamadas
// - Extrae: grapeVariety (con % si existen o lista de variedades), barrelInfo (tiempo + tipo), country

// -----------------------------
// 1) Lista blanca de dominios
// -----------------------------
const TRUSTED = [
  // ES / EU retailers fiables
  "decantalo.com", "bodeboca.com", "vinissimus.com", "vilaviniteca.es", "lavinia.es",
  "millesima.com", "tannico.it", "majestic.co.uk", "klwines.com", "wine.com",

  // Consejos reguladores / DO / Interprofesionales
  "riojawine.com", "sherry.wine", "bordeaux.com", "cava.wine",

  // Monopolios estatales
  "systembolaget.se", "saq.com", "lcbo.com", "alko.fi", "vinmonopolet.no",

  // Importadores serios
  "skurnik.com", "polanerselections.com", "kermitlynch.com", "wilsondaniels.com",
  "europeancellars.com", "jorgeordonezselections.com", "winebow.com", "vintus.com",
  "libertywines.co.uk", "enotriacoe.com", "lescaves.co.uk", "bibendum-wine.co.uk",

  // Agregadores (apoyo; no decisivos)
  "wine-searcher.com",
];

// -----------------------------
// 2) Definiciones de búsqueda
// -----------------------------
type SearchDef = { domain: string; search: (q: string) => string; product: RegExp };

/**
 * Define para cada dominio:
 * - cómo generar la URL de búsqueda (search)
 * - cómo reconocer la URL de producto (product)
 * Añade dominios gradualmente aquí.
 */
const SEARCH_DEFS: SearchDef[] = [
  // España
  {
    domain: "decantalo.com",
    search: q => `https://www.decantalo.com/es/search?q=${q}`,
    // acepta /es/<slug>.html y /es/vino/<slug>.html
    product: /https?:\/\/(?:www\.)?decantalo\.com\/es\/(?:[a-z-]+\/)?[a-z0-9-]+\.html/i,
  },
  {
    domain: "bodeboca.com",
    search: q => `https://www.bodeboca.com/buscar/${q}`,
    // acepta /vino/<slug> con o sin /es/
    product: /https?:\/\/(?:www\.)?bodeboca\.com\/(?:es\/)?vino\/[a-z0-9-]+/i,
  },
  {
    domain: "vinissimus.com",
    search: q => `https://www.vinissimus.com/es/buscar/?q=${q}`,
    product: /https?:\/\/(?:www\.)?vinissimus\.com\/es\/vino\/[a-z0-9-]+/i,
  },

  // Sitio oficial (WordPress suele usar ?s= y /vino/<slug>/)
  {
    domain: "marquesdecaceres.com",
    search: q => `https://www.marquesdecaceres.com/?s=${q}`,
    product: /https?:\/\/(?:www\.)?marquesdecaceres\.com\/(?:es\/)?vino\/[a-z0-9-]+/i,
  },

  // (opcional) deja aquí el resto de dominios que ya tenías…
  {
    domain: "vilaviniteca.es",
    search: q => `https://www.vilaviniteca.es/es/busqueda?q=${q}`,
    product: /https?:\/\/(?:www\.)?vilaviniteca\.es\/es\/[a-z0-9-]+\.html/i,
  },
  {
    domain: "lavinia.es",
    search: q => `https://www.lavinia.es/es_ES/search?q=${q}`,
    product: /https?:\/\/(?:www\.)?lavinia\.es\/es_ES\/[a-z0-9-]+/i,
  },
  {
    domain: "millesima.com",
    search: q => `https://www.millesima.com/es-es/search?q=${q}`,
    product: /https?:\/\/(?:www\.)?millesima\.com\/es-es\/[a-z0-9-]+\.html/i,
  },
  {
    domain: "tannico.it",
    search: q => `https://www.tannico.it/catalogsearch/result/?q=${q}`,
    product: /https?:\/\/(?:www\.)?tannico\.it\/[a-z0-9-]+\.html/i,
  },
  {
    domain: "majestic.co.uk",
    search: q => `https://www.majestic.co.uk/search?q=${q}`,
    product: /https?:\/\/(?:www\.)?majestic\.co\.uk\/wines\/[a-z0-9-]+/i,
  },
  {
    domain: "klwines.com",
    search: q => `https://www.klwines.com/Products?&searchText=${q}`,
    product: /https?:\/\/(?:www\.)?klwines\.com\/products\/\d+/i,
  },
  {
    domain: "wine.com",
    search: q => `https://www.wine.com/list/wine/7155?term=${q}`,
    product: /https?:\/\/(?:www\.)?wine\.com\/product\/[a-z0-9-]+\/\d+/i,
  },
  {
    domain: "systembolaget.se",
    search: q => `https://www.systembolaget.se/sok/?text=${q}`,
    product: /https?:\/\/(?:www\.)?systembolaget\.se\/produkt\/[a-z-]+\/\d{6}/i,
  },
  {
    domain: "saq.com",
    search: q => `https://www.saq.com/es/search?q=${q}`,
    product: /https?:\/\/(?:www\.)?saq\.com\/es\/p\/[a-z0-9-]+/i,
  },
  {
    domain: "lcbo.com",
    search: q => `https://www.lcbo.com/es-ES/search?q=${q}`,
    product: /https?:\/\/(?:www\.)?lcbo\.com\/[a-z-]+\/product\/[a-z0-9-]+\/\d+/i,
  },
  {
    domain: "alko.fi",
    search: q => `https://www.alko.fi/en/search?text=${q}`,
    product: /https?:\/\/(?:www\.)?alko\.fi\/en\/Products\/\d+/i,
  },
  {
    domain: "vinmonopolet.no",
    search: q => `https://www.vinmonopolet.no/search?q=${q}`,
    product: /https?:\/\/(?:www\.)?vinmonopolet\.no\/p\/\d+/i,
  },
];

// -----------------------------
// 3) HTTP + Cache + Normalización
// -----------------------------
const REQ_UA = { "user-agent": "SommelierProAI/1.0 (+server)" };

const _cache = new Map<string, { at: number; text: string | null }>();
const TTL_MS = 1000 * 60 * 10; // 10 min

function _now() { return Date.now(); }
function _norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

async function httpGet(url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000); // 8s timeout

    const key = `GET:${url}`;
    const hit = _cache.get(key);
    if (hit && (_now() - hit.at) < TTL_MS) { clearTimeout(t); return hit.text; }

    const res = await fetch(url, { headers: REQ_UA, signal: ctrl.signal });
    clearTimeout(t);

    if (!res.ok) { _cache.set(key, { at: _now(), text: null }); return null; }
    const text = await res.text();
    _cache.set(key, { at: _now(), text });
    return text;
  } catch { return null; }
}

// -----------------------------
// 4) Extractor de hechos (grapes/barrel/country)
// -----------------------------
function extractFactsFromHtml(html: string) {
  const out: { grapes?: string; barrel?: string; country?: string } = {};
  const text = html.replace(/\s+/g, " ");

  // Uvas: porcentajes (ej. "35% Tempranillo, 65% Graciano") o lista de variedades
  const withPct =
    text.match(/(\d{1,2}\s*%\s*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s*,\s*\d{1,2}\s*%\s*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+)/);
  const varietals =
    text.match(/(Variedades?|Uvas?|Cepa[s]?):?\s*([^.<]{8,200})[.]/i);
  out.grapes = (withPct?.[1] || varietals?.[2])?.trim();

  // Barrica: tiempo + tipo de roble (acepta “12 meses”, “12 meses en roble francés”)
  const t = text.match(/(\d{1,2})\s*(mes(?:es)?|a(?:ños)?|years?)/i);
  const o = text.match(/roble\s+(franc[eé]s|americano|cauc[áa]sico|h[úu]ngaro)/i);
  if (t || o) {
    const tiempo = t ? `${t[1]} ${t[2]}` : "tiempo no declarado";
    const roble  = o ? `roble ${o[1]}` : "roble (tipo no declarado)";
    out.barrel = `Envejecido ${tiempo} en ${roble}.`;
  }

  // País explícito si aparece
  const pais = text.match(/\b(Espa[ñn]a|Francia|Italia|Portugal|Argentina|Chile|Uruguay|Alemania|Austria|Estados Unidos|Australia|Nueva Zelanda|Sud[áa]frica)\b/i)?.[1];
  if (pais) out.country = pais;

  return out;
}

// -----------------------------
// 5) Buscar primera página de producto fiable
// -----------------------------
async function findCandidatePage(name: string): Promise<string | null> {
  const q = encodeURIComponent(name);
  for (const def of SEARCH_DEFS) {
    const url = def.search(q);
    const html = await httpGet(url);
    if (!html) continue;
    const m = html.match(def.product);
    if (m?.[0]) return m[0];
  }
  return null;
}

// -----------------------------
// 6) API pública del módulo (RAG mínimo)
// -----------------------------
export async function fetchPublicFactsByName(nameRaw: string) {
  const name = _norm(nameRaw);
  if (!name) return null;

  const pageUrl = await findCandidatePage(name);
  if (!pageUrl) return null;

  const host = new URL(pageUrl).hostname.replace(/^www\./, "");
  if (!TRUSTED.some(d => host.endsWith(d))) return null;

  const html = await httpGet(pageUrl);
  if (!html) return null;

  const facts = extractFactsFromHtml(html);
  if (!facts.grapes && !facts.barrel && !facts.country) return null;

  console.log("[RAG] webFacts", facts);
  return { ...facts, sources: [pageUrl] as string[] };
}
