"use client";

import AddToCellarButton from "@/components/history/AddToCellarButton";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wine, Leaf, Award, Info, Calendar, MapPin, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";



type Any = Record<string, any>;

function splitLines(s?: string) {
  if (!s || typeof s !== "string") return [];
  return s.split(/\n+/).map(x => x.replace(/^\s*(\d+\.|\-|\*)\s*/, "").trim()).filter(Boolean);
}
function toISO(ts: any) {
  // @ts-ignore
  if (ts?.toDate) return ts.toDate().toISOString();
  if (typeof ts?.seconds === "number") return new Date(ts.seconds * 1000).toISOString();
  if (ts instanceof Date) return ts.toISOString();
  if (typeof ts === "string") return ts;
  return new Date().toISOString();
}
function normalize(x: any) {
  const a = x?.analysis ?? {};
  return {
    wineName: x?.wineName ?? "Análisis",
    year: x?.year ?? null,
    country: x?.country ?? null,
    grapeVariety: a?.grapeVariety ?? x?.grapeVariety ?? null,
    notaDelSommelier: x?.notaDelSommelier ?? null,
    servicio: x?.servicio ?? null,
    createdAt: toISO(x?.createdAt),
    analysis: {
      wineType: a?.wineType ?? null,
      body: a?.body ?? null,
      appellation: a?.appellation ?? null,
      qualityLevel: a?.qualityLevel ?? null,
      qualityRating: typeof a?.qualityRating === "number" ? a?.qualityRating : null,
      targetAudience: a?.targetAudience ?? null,
      barrelInfo: a?.barrelInfo ?? null,
      servingTemperature: a?.servingTemperature ?? null,
      decanterRecommendation: a?.decanterRecommendation ?? null,
      agingPotential: a?.agingPotential ?? null,
      tanninLevel: a?.tanninLevel ?? null,
      relevantCulturalOrRegionalNotes: a?.relevantCulturalOrRegionalNotes ?? null,
      visual: { description: a?.visual?.description ?? null, imageUrl: a?.visual?.imageUrl ?? x?.imageUrl ?? null },
      olfativa: { description: a?.olfativa?.description ?? a?.olfactory?.description ?? null },
      gustativa: { description: a?.gustativa?.description ?? a?.gustatory?.description ?? null },
      recommendedPairings: a?.recommendedPairings ?? x?.recommendedPairings ?? null,
      avoidPairings: a?.avoidPairings ?? x?.avoidPairings ?? null
    }
  };
}

export default function HistoryDetail() {
  const params = useParams<{ id: string }>();
  const id = useMemo(() => String(params?.id || ""), [params]);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [row, setRow] = useState<Any | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    let alive = true;

    // 🔹 Fallback server (Admin SDK) cuando cliente no puede leer por falta de sesión
    const fetchAdminFallback = async (id: string) => {
      try {
        const res = await fetch("/api/history/detail", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id })  // uid es opcional en el API
        });
        const j = await res.json();
        if (res.ok && j?.item) return j.item as Any;
        return null;
      } catch {
        return null;
      }
    };

    (async () => {
      try {
        setLoading(true); setErr(null);

        const tryGet = async (ref: any) => {
          try {
            const s = await getDoc(ref);
            return s.exists() ? s : null;
          } catch (e: any) {
            if (e?.code === "permission-denied") return null; // tolera inicio sin cookie/token
            throw e;
          }
        };

        // 1) Cliente: intentos directos
        const refs = [
          doc(db, "users", user.uid, "history", id),
          doc(db, "history", id),
          doc(db, "wineAnalyses", id)
        ];

        let snap: any = null;
        for (const r of refs) {
          snap = await tryGet(r);
          if (snap) break;
        }

        // 2) Fallback server: Admin SDK
        if (!snap) {
          const adminItem = await fetchAdminFallback(id);
          if (adminItem) {
            if (alive) setRow({ id, ...normalize(adminItem) });
          } else {
            throw new Error("not_found_or_forbidden");
          }
        } else {
          const data: any = snap.data();
          const owner = data?.uid ?? data?.userId;
          if (owner && owner !== user.uid) throw new Error("forbidden");
          if (alive) setRow({ id, ...normalize(data) });
        }
      } catch (e:any) {
        if (alive) setErr(e?.message || "Ocurrió un error cargando el detalle.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [authLoading, user, id, router]);

  if (loading) {
    return <Card><CardHeader><CardTitle>Cargando detalle…</CardTitle></CardHeader></Card>;
  }

  if (err) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error al Cargar el Detalle</AlertTitle>
        <AlertDescription>{err}</AlertDescription>
      </Alert>
    );
  }

  if (!row) return null;

  const a: Any = row.analysis || {};
  const wineName = row.wineName ?? "Análisis";
  const year = row.year ?? "";
  const country = row.country ?? "";
  const grape = row.grapeVariety ?? a.grapeVariety ?? "";
  const createdAt = row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString();

  const recoList = splitLines(a.recommendedPairings);
  const avoidList = splitLines(a.avoidPairings);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          {(() => {
            const imgSrc =
              a?.visual?.imageUrl ??
              (row as any)?.imageUrl ??
              (Array.isArray((row as any)?.image_urls) && (row as any).image_urls.length > 0
                ? (row as any).image_urls[0]
                : null);
            if (!imgSrc) return null;
            return (
              <Image
                src={imgSrc}
                alt={wineName}
                width={1280}
                height={720}
                unoptimized
                className="aspect-[16/9] w-full rounded-xl border object-cover"
                priority
              />
            );
          })()}
          <div className="flex items-center gap-3 mt-3">
            <Wine className="h-7 w-7 text-primary" />
            <div className="flex-1">
              <CardTitle className="text-3xl">
                {wineName} {year ? `· ${year}` : ""}
              </CardTitle>
              <CardDescription className="flex flex-wrap gap-3 pt-2">
                {grape ? (<span className="inline-flex items-center gap-1"><Leaf className="h-4 w-4" /> {grape}</span>) : null}
                {country ? (<span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {country}</span>) : null}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <Badge variant="outline">{new Date(createdAt).toLocaleDateString()}</Badge>
                </span>
              </CardDescription>
            </div>

            {/* 👉 Acción directa: Añadir a Mi Bodega (sin cambios) */}
            <AddToCellarButton
              name={wineName ?? "Producto"}
              year={typeof row.year === "number" ? row.year : null}
              variety={row.grapeVariety ?? a.grapeVariety ?? ""}
            />
          </div>
        </CardHeader>
      </Card>

      {row.notaDelSommelier || row.servicio ? (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> Resumen del Sommelier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {row.notaDelSommelier ? <p className="text-muted-foreground whitespace-pre-line">{row.notaDelSommelier}</p> : null}
            {row.servicio ? <p className="text-muted-foreground"><strong>Servicio:</strong> {row.servicio}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Wine className="h-5 w-5" /> Visual</CardTitle></CardHeader><CardContent className="text-muted-foreground whitespace-pre-line">{a.visual?.description ?? "—"}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5" /> Olfativo</CardTitle></CardHeader><CardContent className="text-muted-foreground whitespace-pre-line">{a.olfativa?.description ?? a.olfactory?.description ?? "—"}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Gustativo</CardTitle></CardHeader><CardContent className="text-muted-foreground whitespace-pre-line">{a.gustativa?.description ?? a.gustatory?.description ?? "—"}</CardContent></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-green-400"><CheckCircle2 className="h-5 w-5" /> Maridajes Recomendados</CardTitle></CardHeader>
          <CardContent className="text-muted-foreground">
            {recoList.length === 0 ? "—" : (
              <ul className="space-y-2">
                {recoList.map((l, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-1" />
                    <div><div className="font-medium">Combinación ideal</div><div>{l}</div></div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><XCircle className="h-5 w-5" /> Evitar Combinar con</CardTitle></CardHeader>
          <CardContent className="text-muted-foreground">
            {avoidList.length === 0 ? "—" : (
              <ul className="list-disc pl-5 space-y-1">{avoidList.map((l, i) => (<li key={i}>{l}</li>))}</ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
