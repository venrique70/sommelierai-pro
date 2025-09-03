"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Wine, Leaf, Award, Info, Calendar, MapPin,
  GlassWater, ThermometerSun, CheckCircle2, XCircle, Users
} from "lucide-react";
import Image from "next/image";

// ⬇️ i18n
import { useLang } from "@/lib/use-lang";
import { translations } from "@/lib/translations";

type Any = Record<string, any>;

function splitLines(s?: string) {
  if (!s || typeof s !== "string") return [];
  // admite listas numeradas o por guiones
  return s
    .split(/\n+/)
    .map((x) => x.replace(/^\s*(\d+\.|\-|\*)\s*/, "").trim())
    .filter(Boolean);
}

function stars(n?: number) {
  if (typeof n !== "number") return null;
  const k = Math.max(0, Math.min(5, Math.round(n)));
  return "★".repeat(k) + "☆".repeat(5 - k);
}

export default function HistoryDetail() {
  const lang = useLang("es");
  const t = translations[lang];

  const params = useParams<{ id: string }>();
  const id = useMemo(() => String(params?.id || ""), [params]);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [row, setRow] = useState<Any | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ⬇️ ÚNICO CAMBIO: soporta demo-* por GET y real por POST (lo demás queda igual)
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        let nextRow: Any | null = null;

        if (id.startsWith("demo-")) {
          // MODO DEMO: detalle directo por GET /api/history/<id>
          const res = await fetch(`/api/history/${encodeURIComponent(id)}`, { cache: "no-store" });
          const j = await res.json();
          if (!res.ok || j?.error) throw new Error(j?.error || `HTTP ${res.status}`);
          nextRow = j as Any;
        } else {
          // MODO REAL: tu flujo actual con verificación de owner
          const res = await fetch("/api/history/detail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: user.uid, id }),
          });
          const j = await res.json();
          if (!res.ok || j?.error) throw new Error(j?.error || `HTTP ${res.status}`);
          nextRow = (j.item as Any) || null;
        }

        if (active) setRow(nextRow);
      } catch (e: any) {
        if (active) setErr(e?.message || (lang === "es" ? "Ocurrió un error cargando el detalle." : "An error occurred while loading the detail."));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [authLoading, user, id, router, lang]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{lang === "es" ? "Cargando detalle…" : "Loading details…"}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (err) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{lang === "es" ? "Error al Cargar el Detalle" : "Failed to Load Details"}</AlertTitle>
        <AlertDescription>{err}</AlertDescription>
      </Alert>
    );
  }

  if (!row) return null;

  const a: Any = row.analysis || {};
  const wineName = row.wineName ?? (lang === "es" ? "Análisis" : "Analysis");
  const year = row.year ?? "";
  const country = row.country ?? "";
  const grape = row.grapeVariety ?? a.grapeVariety ?? "";
  const createdAt = row.createdAt
    ? new Date(row.createdAt).toISOString()
    : new Date().toISOString();

  const recoList = splitLines(a.recommendedPairings);
  const avoidList = splitLines(a.avoidPairings);

  const locale = lang === "es" ? "es-PE" : "en-US";

  return (
    <div className="space-y-6">
      {/* Cabecera estilo Análisis Sensorial */}
      <Card>
        <CardHeader>
          {/* HERO 16:9 */}
          {(() => {
            const imgSrc =
              row?.analysis?.visual?.imageUrl ??
              row?.imageUrl ??
              (Array.isArray(row?.image_urls) && row.image_urls.length > 0
                ? row.image_urls[0]
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

          {/* Cabecera textual */}
          <div className="flex items-center gap-3 mt-3">
            <Wine className="h-7 w-7 text-primary" />
            <div className="flex-1">
              <CardTitle className="text-3xl">
                {wineName} {year ? `· ${year}` : ""}
              </CardTitle>
              <CardDescription className="flex flex-wrap gap-3 pt-2">
                {grape ? (
                  <span className="inline-flex items-center gap-1">
                    <Leaf className="h-4 w-4" /> {grape}
                  </span>
                ) : null}
                {country ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {country}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <Badge variant="outline">
                    {new Date(createdAt).toLocaleDateString(locale)}
                  </Badge>
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumen del Sommelier */}
      {row.notaDelSommelier || row.servicio ? (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> {t.sommelierNote}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {row.notaDelSommelier ? (
              <p className="text-muted-foreground whitespace-pre-line">
                {row.notaDelSommelier}
              </p>
            ) : null}
            {row.servicio ? (
              <p className="text-muted-foreground">
                <strong>{lang === "es" ? "Servicio" : "Service"}:</strong> {row.servicio}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Tres bloques sensoriales */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wine className="h-5 w-5" /> {t.visualAnalysis}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground whitespace-pre-line">
            {a.visual?.description ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" /> {t.olfactoryAnalysis}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground whitespace-pre-line">
            {a.olfativa?.description ?? a.olfactory?.description ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" /> {t.gustatoryAnalysis}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground whitespace-pre-line">
            {a.gustativa?.description ?? a.gustatory?.description ?? "—"}
          </CardContent>
        </Card>
      </div>

      {/* Maridajes Recomendados / Evitar */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-5 w-5" /> {t.recommendedPairings}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            {recoList.length === 0 ? (
              "—"
            ) : (
              <ul className="space-y-2">
                {recoList.map((l, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-1" />
                    <div>
                      <div className="font-medium">
                        {lang === "es" ? "Combinación ideal" : "Ideal combination"}
                      </div>
                      <div>{l}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" /> {lang === "es" ? "Evitar Combinar con" : "Avoid Pairings"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            {avoidList.length === 0 ? (
              "—"
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {avoidList.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* El Alma del Vino (Ficha técnica completa) */}
      <Card>
        <CardHeader>
          <CardTitle>{t.additionalDetails}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {a.wineType ? (
            <div>
              <strong>{t.wineType}</strong>
              <div>{a.wineType}</div>
            </div>
          ) : null}
          {country ? (
            <div>
              <strong>{t.appellation}</strong>
              <div>{a.appellation ?? country}</div>
            </div>
          ) : null}
          {typeof a.qualityRating === "number" ? (
            <div>
              <strong>{t.qualityLevel}</strong>
              <div>{stars(a.qualityRating)}</div>
            </div>
          ) : null}
          {a.targetAudience ? (
            <div className="inline-flex gap-2 items-start">
              <Users className="h-4 w-4 mt-0.5" />
              <div>
                <strong>{t.targetAudience}</strong>
                <div>{a.targetAudience}</div>
              </div>
            </div>
          ) : null}
          {a.barrelInfo ? (
            <div>
              <strong>{t.barrelInfo}</strong>
              <div>{a.barrelInfo}</div>
            </div>
          ) : null}
          {grape ? (
            <div>
              <strong>{t.grapeVarieties}</strong>
              <div>{grape}</div>
            </div>
          ) : null}
          {a.servingTemperature ? (
            <div className="inline-flex gap-2 items-start">
              <ThermometerSun className="h-4 w-4 mt-0.5" />
              <div>
                <strong>{t.servingTemperature}</strong>
                <div>{a.servingTemperature}</div>
              </div>
            </div>
          ) : null}
          {a.decanterRecommendation ? (
            <div className="inline-flex gap-2 items-start">
              <GlassWater className="h-4 w-4 mt-0.5" />
              <div>
                <strong>{t.decanterRecommendation}</strong>
                <div>{a.decanterRecommendation}</div>
              </div>
            </div>
          ) : null}
          {a.agingPotential ? (
            <div>
              <strong>{t.agingPotential}</strong>
              <div>{a.agingPotential}</div>
            </div>
          ) : null}
          {a.tanninLevel ? (
            <div>
              <strong>{t.tanninLevel}</strong>
              <div>{a.tanninLevel}</div>
            </div>
          ) : null}
          {a.awards ? (
            <div>
              <strong>{lang === "es" ? "Premios" : "Awards"}</strong>
              <div>{a.awards}</div>
            </div>
          ) : null}
          {a.world50BestRestaurants ? (
            <div>
              <strong>{lang === "es" ? "50 Best / Michelin" : "50 Best / Michelin"}</strong>
              <div>{a.world50BestRestaurants}</div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
