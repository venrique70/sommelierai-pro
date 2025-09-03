"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection, query, getDocs, where, setDoc, doc,
  serverTimestamp, FirestoreError, deleteDoc
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Upload, PlusCircle, ChevronRight, Trash2 } from "lucide-react";

// ⬇️ i18n mínimo
import { useLang } from "@/lib/use-lang";
import { translations } from "@/lib/translations";

/* ───────── Estado automático (heurística inicial; luego la IA lo refina) ───────── */
function inferEstado(
  name?: string, variety?: string, year?: number
): "Listo para Beber" | "En su punto" | "Necesita Guarda" {
  const n = (name ?? "").toLowerCase();
  const v = (variety ?? "").toLowerCase();
  if (/\b(whisk|ron|gin|tequil|vodka|pisco|mezcal|bourbon|scotch|rum)\b/.test(n + " " + v)) return "Listo para Beber";
  const Y = new Date().getFullYear();
  if (!year || year < 1900 || year > Y + 1) return "Listo para Beber";
  const age = Y - year;

  const heavies = /\b(cabernet|malbec|nebbiolo|barolo|syrah|shiraz|tempranillo|bordeaux|tannat|sagrantino|mourv|petit verdot)\b/;
  const mediums = /\b(pinot noir|merlot|sangiovese|chianti|grenache|garnacha|carmenere|monastrell)\b/;
  const whites  = /\b(sauvignon|chardonnay|riesling|albari|verdejo|viognier|chenin|godello|pinot gris|pinot grigio)\b/;
  const roseSpk = /\b(ros[ée]|rosado|sparkling|champagne|cava|prosecco|espumante)\b/;

  let start = 1, end = 3;
  if (roseSpk.test(n + " " + v)) { start = 0; end = 2; }
  else if (whites.test(n + " " + v)) { start = 1; end = 3; }
  else if (mediums.test(n + " " + v)) { start = 2; end = 6; }
  else if (heavies.test(n + " " + v)) { start = 4; end = 12; }
  else { start = 1; end = 5; }

  if (age < start) return "Necesita Guarda";
  if (age <= end) return "En su punto";
  return "Listo para Beber";
}

// Mapea el estado guardado en ES a label visible según idioma (no altera Firestore)
function displayStatusLabel(status: string | undefined, lang: "es" | "en") {
  const s = (status ?? "").toLowerCase();
  if (lang === "en") {
    if (s.includes("necesita guarda")) return "Needs Cellaring";
    if (s.includes("en su punto"))     return "At Peak";
    if (s.includes("listo para beber"))return "Ready to Drink";
    return status ?? "Ready to Drink";
  }
  // ES
  return status ?? "Listo para Beber";
}

/* ───────── Hook inline (sin imports externos) ───────── */
type CellarItem = {
  id: string;
  name: string;
  variety?: string;
  year?: number;
  quantity?: number;
  status?: string;
};

function useCellarInline() {
  const [uid, setUid] = useState<string | null>(null);
  const [items, setItems] = useState<CellarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUid(u?.uid ?? null);
      setLoading(true);
      setError(null);
      setItems([]);

      if (!u?.uid) { setLoading(false); return; }

      async function read(path: string) {
        const snap = await getDocs(query(collection(db, path)));
        return snap.docs.map(d => {
          const x: any = d.data();
          return {
            id: d.id,
            name: x.name ?? x.wineName ?? "Producto",
            variety: x.variety ?? x.grapeVariety ?? "",
            year: typeof x.year === "number" ? x.year : (x.year ? Number(x.year) : undefined),
            quantity: typeof x.quantity === "number" ? x.quantity : (x.quantity ? Number(x.quantity) : 1),
            status: x.status ?? inferEstado(x.name ?? x.wineName, x.variety ?? x.grapeVariety, (typeof x.year === "number" ? x.year : Number(x.year))),
          } as CellarItem;
        });
      }

      try {
        let rows = await read(`cellars/${u.uid}/wines`);
        if (!rows.length) rows = await read(`users/${u.uid}/cellar`);
        setItems(rows);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return { uid, items, loading, error };
}

/* ───────── Página ───────── */
export default function MiBodegaPage() {
  const lang = useLang("es");
  const t = translations[lang];

  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { uid, items, loading, error } = useCellarInline();
  const [isPending, startTransition] = useTransition();

  // sólo una vez
  const autoSyncedRef = useRef(false);

  // diagnóstico del import
  const [importStats, setImportStats] = useState<string | null>(null);

  /* Añadir (genérico) */
  const [name, setName] = useState("");
  const [variety, setVariety] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">("");

  function slugify(s: any) {
    return String(s ?? "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/gi, "_")
      .replace(/^_+|_+$/g, "");
  }

  async function writeCellarDoc(uid: string, key: string, data: any) {
    try {
      await setDoc(doc(db, `cellars/${uid}/wines/${key}`), data, { merge: true });
    } catch (e) {
      const err = e as FirestoreError;
      if (err.code === "permission-denied") {
        await setDoc(doc(db, `users/${uid}/cellar/${key}`), data, { merge: true });
      } else {
        throw e;
      }
    }
  }

  const addItem = async () => {
    if (!user?.uid) { toast({ title: lang === "es" ? "Debes iniciar sesión" : "You must sign in", variant: "destructive" }); return; }
    if (!name.trim()) { toast({ title: lang === "es" ? "Ingresa el nombre del producto" : "Enter the product name", variant: "destructive" }); return; }

    startTransition(() => { (async () => {
      try {
        const estado = inferEstado(name, variety, year === "" ? undefined : Number(year));
        const key = `${slugify(name)}__${year === "" ? "" : Number(year)}`;
        await writeCellarDoc(user.uid, key, {
          name: name.trim(),
          variety: variety.trim(),
          year: year === "" ? null : Number(year),
          quantity: quantity === "" ? 1 : Number(quantity),
          status: estado,
          createdAt: serverTimestamp(),
        });
        setName(""); setVariety(""); setYear(""); setQuantity("");
        toast({
          title: lang === "es" ? "Añadido" : "Added",
          description: lang === "es" ? "Producto agregado a tu bodega." : "Product added to your cellar.",
        });
        router.refresh();
      } catch (e: any) {
        toast({
          title: lang === "es" ? "No se pudo añadir" : "Could not add",
          description: e?.message || String(e),
          variant: "destructive"
        });
      }
    })(); });
  };

  /* Importar desde Historial — SOLO CLIENTE (sin Admin) */
  const runImportFromHistory = async () => {
    if (!user?.uid) { toast({ title: lang === "es" ? "Debes iniciar sesión" : "You must sign in", variant: "destructive" }); return; }

    startTransition(() => { (async () => {
      try {
        let upserts = 0;
        const seen = new Set<string>();
        const sources = { wa: 0, uhis: 0, his_uid: 0, his_userId: 0 };

        // normalizador de esquemas
        const extract = (h: any) => {
          const name = (h?.wineName ??
                        h?.analysis?.wineName ??
                        h?.analysis?.wine?.name ??
                        "").toString().trim();
          let year: any = h?.year ?? h?.vintage ?? null;
          if (typeof year === "string") {
            const m = year.match(/\d{4}/); year = m ? Number(m[0]) : null;
          }
          if (typeof year !== "number") year = null;
          const variety = h?.grapeVariety ?? h?.analysis?.grapeVariety ?? "";
          return { name, year, variety };
        };

        const process = async (h: any) => {
          const { name, year, variety } = extract(h);
          if (!name) return;
          const key = `${slugify(name)}__${year ?? ""}`;
          if (seen.has(key)) return;
          seen.add(key);

          await writeCellarDoc(user.uid, key, {
            name, variety, year,
            quantity: 1,
            status: inferEstado(name, variety, year ?? undefined),
            createdAt: serverTimestamp(),
          });
          upserts++;
        };

        // 1) wineAnalyses por uid (lo que muestra Mi Historial)
        const wa = await getDocs(query(collection(db, "wineAnalyses"), where("uid", "==", user.uid)));
        sources.wa = wa.size;
        for (const d of wa.docs) await process(d.data());

        // 2) users/{uid}/history
        const uhis = await getDocs(collection(db, `users/${user.uid}/history`));
        sources.uhis = uhis.size;
        for (const d of uhis.docs) await process(d.data());

        // 3) /history por uid y por userId (compat)
        const his1 = await getDocs(query(collection(db, "history"), where("uid", "==", user.uid)));
        sources.his_uid = his1.size;
        for (const d of his1.docs) await process(d.data());

        const his2 = await getDocs(query(collection(db, "history"), where("userId", "==", user.uid)));
        sources.his_userId = his2.size;
        for (const d of his2.docs) await process(d.data());

        setImportStats(`WA:${sources.wa} · uHist:${sources.uhis} · hist(uid):${sources.his_uid} · hist(userId):${sources.his_userId} · Importados:${upserts}`);

        if (upserts === 0) {
          toast({
            title: lang === "es" ? "No se encontraron análisis" : "No analyses found",
            description: lang === "es"
              ? "No hay documentos visibles en wineAnalyses / users/{uid}/history / history para tu usuario."
              : "No visible documents in wineAnalyses / users/{uid}/history / history for your user.",
            variant: "destructive",
          });
        } else {
          toast({
            title: lang === "es" ? "Importación completada" : "Import completed",
            description: lang === "es" ? `Se sincronizaron ${upserts} elemento(s).` : `${upserts} item(s) synchronized.`,
          });
          router.refresh();
        }
      } catch (e:any) {
        toast({
          title: lang === "es" ? "Error importando" : "Import error",
          description: e?.message || String(e),
          variant: "destructive"
        });
      }
    })(); });
  };

  // Autoimport una sola vez si está vacía
  useEffect(() => {
    if (!autoSyncedRef.current && user?.uid && !loading && items.length === 0) {
      autoSyncedRef.current = true;
      runImportFromHistory().catch(() => {});
    }
  }, [user?.uid, loading, items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Eliminar */
  const deleteItem = async (id: string) => {
    if (!user?.uid) { toast({ title: lang === "es" ? "Debes iniciar sesión" : "You must sign in", variant: "destructive" }); return; }
    if (!confirm(lang === "es" ? "¿Eliminar este producto de tu bodega?" : "Delete this product from your cellar?")) return;

    startTransition(() => { (async () => {
      try {
        await deleteDoc(doc(db, `cellars/${user.uid}/wines/${id}`)).catch(() => {});
        await deleteDoc(doc(db, `users/${user.uid}/cellar/${id}`)).catch(() => {});
        toast({
          title: lang === "es" ? "Eliminado" : "Deleted",
          description: lang === "es" ? "Se quitó de tu bodega." : "Removed from your cellar.",
        });
        router.refresh();
      } catch (e:any) {
        toast({
          title: lang === "es" ? "No se pudo eliminar" : "Could not delete",
          description: e?.message || String(e),
          variant: "destructive"
        });
      }
    })(); });
  };

  /* UI */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">{t.navCellar}</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
            {lang === "es"
              ? <>Inventario digital de tu cava. Añade productos (vino, whisky u otros) con <b>Producto</b>, <b>Cepa/Característica</b>, <b>Año</b> y <b>Cantidad</b>. El <b>Estado</b> lo determina automáticamente la app (SommelierPro AI). Tú no lo eliges.</>
              : <>Digital inventory of your cellar. Add products (wine, whisky or others) with <b>Product</b>, <b>Grape/Feature</b>, <b>Year</b> and <b>Quantity</b>. The <b>Status</b> is automatically determined by the app (SommelierPro AI). You don’t choose it.</>}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">uid: {uid ?? "–"}</Badge>
            <Badge variant="outline">{lang === "es" ? "items" : "items"}: {items.length}</Badge>
            {importStats ? <Badge variant="outline">{importStats}</Badge> : null}
            {loading ? <Badge variant="outline">{lang === "es" ? "cargando…" : "loading…"}</Badge> : null}
            {error ? <Badge variant="destructive">{lang === "es" ? "error" : "error"}</Badge> : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={runImportFromHistory} disabled={isPending || !user}>
            <Upload className="mr-2 h-4 w-4" /> {lang === "es" ? "Importar del Historial" : "Import from History"}
          </Button>
          <Button onClick={addItem} disabled={isPending || !user}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {lang === "es" ? "Añadir" : "Add"}
          </Button>
        </div>
      </div>

      {/* Formulario “Añadir” */}
      <Card>
        <CardHeader>
          <CardTitle>{lang === "es" ? "Añadir producto" : "Add product"}</CardTitle>
          <CardDescription>
            {lang === "es"
              ? "Rellena y pulsa “Añadir”. El estado lo calcula la app."
              : "Fill the fields and press “Add”. The status is calculated by the app."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm">{lang === "es" ? "Producto / Vino" : "Product / Wine"}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === "es" ? "ej. Catena Zapata Malbec / Glenfiddich 12" : "e.g., Catena Zapata Malbec / Glenfiddich 12"}
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-sm">{lang === "es" ? "Cepa o característica" : "Grape / Feature"}</label>
            <Input
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder={lang === "es" ? "ej. Malbec / Single Malt" : "e.g., Malbec / Single Malt"}
            />
          </div>
          <div>
            <label className="text-sm">{lang === "es" ? "Año" : "Year"}</label>
            <Input type="number" value={year as any} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")} />
          </div>
          <div>
            <label className="text-sm">{lang === "es" ? "Cantidad" : "Quantity"}</label>
            <Input type="number" min={1} value={quantity as any} onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")} />
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>{lang === "es" ? "Tu Colección" : "Your Collection"}</CardTitle>
          <CardDescription>
            {lang === "es"
              ? <>Tienes {items.length} {items.length === 1 ? "producto" : "productos"} en tu bodega.</>
              : <>You have {items.length} {items.length === 1 ? "item" : "items"} in your cellar.</>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm opacity-70">{lang === "es" ? "Cargando…" : "Loading…"}</div>
          ) : items.length === 0 ? (
            <div className="text-sm opacity-70">
              {lang === "es"
                ? "Tu bodega está vacía. Se importará automáticamente desde tu Historial si hay análisis."
                : "Your cellar is empty. It will be imported automatically from your History if there are analyses."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{lang === "es" ? "Producto" : "Product"}</TableHead>
                  <TableHead>{lang === "es" ? "Año" : "Year"}</TableHead>
                  <TableHead>{lang === "es" ? "Cantidad" : "Qty"}</TableHead>
                  <TableHead>{lang === "es" ? "Estado (app)" : "Status (app)"}</TableHead>
                  <TableHead className="text-right">{lang === "es" ? "Acciones" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">
                      {w.name}
                      {w.variety ? <div className="text-xs opacity-70">{w.variety}</div> : null}
                    </TableCell>
                    <TableCell>{w.year ?? "-"}</TableCell>
                    <TableCell>{w.quantity ?? 1}</TableCell>
                    <TableCell>
                      <Badge>{displayStatusLabel(w.status ?? inferEstado(w.name, w.variety, w.year), lang)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={lang === "es" ? "Recomendación IA" : "AI Recommendation"}
                          onClick={() => router.push("/sommelier")}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={lang === "es" ? "Eliminar" : "Delete"}
                          onClick={() => deleteItem(w.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
