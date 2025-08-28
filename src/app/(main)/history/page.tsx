'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Wine, Calendar, Info, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

type Row = {
  id: string;
  wineName?: string;
  year?: number | null;
  createdAt?: any;
  wineryName?: string | null;
  imageUrl?: string | null;
};

const mapDoc = (d: any): Row => {
  const x: any = d.data() || {};
  const a: any = x.analysis || {};
  const img = x.imageUrl || a?.visual?.imageUrl || null;
  return {
    id: d.id,
    wineName: x.wineName,
    year: x.year ?? null,
    createdAt: x.createdAt,
    wineryName: x.wineryName ?? null,
    imageUrl: typeof img === "string" ? img : null,
  };
};

function HistoryCard({ r, first }: { r: Row; first?: boolean }) {
  const vino = r.wineName ?? "Vino sin nombre";
  const anio = r.year ?? "—";
  const fecha = r.createdAt
    ? typeof r.createdAt === "object" && r.createdAt.seconds
      ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date(r.createdAt).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
    : "—";

  return (
    <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="p-4">
        {r.imageUrl ? (
          <div className="relative h-40 w-full mb-3 rounded-lg overflow-hidden">
            <Image
              src={r.imageUrl}
              alt={vino}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
              priority={!!first}
              loading={first ? "eager" : "lazy"}
            />
          </div>
        ) : (
          <div className="inline-flex h-40 w-full items-center justify-center rounded-lg bg-muted border mb-3">
            <Wine className="h-12 w-12 opacity-80 text-yellow-400" />
          </div>
        )}
        <CardTitle className="text-lg font-semibold leading-snug text-gray-900 dark:text-gray-100">
          {vino}
        </CardTitle>
        <div className="text-sm opacity-80 text-gray-600 dark:text-gray-300">
          Año: {anio}
        </div>
        {r.wineryName && (
          <div className="text-sm opacity-80 text-gray-600 dark:text-gray-300">
            Bodega: {r.wineryName}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-500">
            <Calendar className="mr-1 h-3 w-3" /> Analizado: {fecha}
          </Badge>
        </div>

        <Link href={`/history/${r.id}`}>
          <Button className="w-full justify-between bg-yellow-500 hover:bg-yellow-600 text-white">
            Ver detalle <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function HistoryListPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const qUid = query(
      collection(db, "wineAnalyses"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const toMs = (v: any) =>
      v?.toMillis?.() ??
      (typeof v?.seconds === "number" ? v.seconds * 1000 : 0);

    const keyOf = (r: Row) =>
      `${(r.wineName || "").toLowerCase().trim()}|${r.year ?? ""}`;

    const unsub = onSnapshot(
      qUid,
      (snap) => {
        // mapea y deduplica por (wineName, year) -> conserva el más reciente
        const rows = snap.docs.map(mapDoc);
        const keep = new Map<string, Row>();
        for (const r of rows) {
          const k = keyOf(r);
          const prev = keep.get(k);
          const currTs = toMs(r.createdAt);
          const prevTs = prev ? toMs(prev.createdAt) : -1;
          if (!prev || currTs > prevTs) keep.set(k, r);
        }
        setItems([...keep.values()]);
      },
      (err) => {
        console.error("Error en history:", err);
        setError(err.message || "Error al cargar historial");
        setItems([]);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  if (!user?.uid) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm flex items-start gap-2 text-yellow-300">
          <Info className="h-4 w-4 mt-0.5" />
          <div>Inicia sesión para ver tus análisis guardados.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6 text-sm text-red-500">
        Error: {error}
      </div>
    );
  }

  const isEmpty = items !== null && items.length === 0;

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <Wine className="h-5 w-5 text-yellow-400" />
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-yellow-300">
          Mi Historial de Análisis
        </h1>
      </div>

      {items === null && <div className="text-sm text-muted-foreground">Cargando…</div>}

      {isEmpty && (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm flex items-start gap-2 text-yellow-300">
          <Info className="h-4 w-4 mt-0.5" />
          <div>Aún no tienes registros.</div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(items ?? []).map((r, i) => (
          <HistoryCard key={r.id} r={r} first={i === 0} />
        ))}
      </div>
    </div>
  );
}
