export function toJson(o: any) {
  // 1) Extraer el texto de la respuesta (varias posibles formas)
  const raw =
    o?.text ??
    o?.output_text ??
    ((o?.candidates?.[0]?.content?.parts) || []).map((p: any) => p?.text).join('') ??
    (typeof o?.output === 'string' ? o.output : JSON.stringify(o?.output ?? ''));

  // 2) Normalizar: quitar fences ```json ... ``` y ruido antes/después del JSON
  let s = String(raw ?? '').trim();

  // quitar fences Markdown
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();

  // si hay texto extra, recorta desde el primer { o [
  const start = s.search(/[\[{]/);
  if (start > 0) s = s.slice(start);

  // recorta al último } o ] (por si el modelo agregó texto luego)
  const lastBrace = s.lastIndexOf('}');
  const lastBracket = s.lastIndexOf(']');
  const end = Math.max(lastBrace, lastBracket);
  if (end >= 0) s = s.slice(0, end + 1);

  // 3) Parse estricto, con un intento de reparación de comas finales si falla
  try {
    return JSON.parse(s);
  } catch {
    const repaired = s.replace(/,\s*([}\]])/g, '$1'); // elimina comas colgantes
    return JSON.parse(repaired);
  }
}
