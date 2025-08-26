"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wine, Calendar, Info, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import {
  collection, query, where, orderBy, onSnapshot, limit,
} from "firebase/firestore";

type Row = { id: string; wineName?: string; year?: number | null; createdAt?: any };

function HistoryCard({ r }: { r: Row }) {
  const vino = r.wineName ?? "Vino";
  const anio = r.year ?? "—";
  const fecha = r?.createdAt?.seconds
    ? new Date(r.createdAt.seconds * 1000).toLocaleDateString()
    : (typeof r.createdAt === "string" ? new Date(r.createdAt).toLocaleDateString() : "—");

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="mb-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted border">
            <Wine className="h-7 w-7 opacity-80" />
          </div>
        </div>
        <CardTitle className="leading-snug">{vino}</CardTitle>
        <div className="text-sm opacity-80">Año: {anio}</div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Calendar className="mr-1 h-3 w-3" />
            Analizado: {fecha}
          </Badge>
        </div>

        <div className="mt-2">
          <Link href={`/history/${r.id}`}>
            <Button className="w-full justify-between">
              Ver detalle <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HistoryListPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Row[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "history"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, [user?.uid]);

  const isEmpty = !!user?.uid && items.length === 0;

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <Wine className="h-5 w-5 text-yellow-400" />
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-yellow-300">Mi Historial de Análisis</h1>
      </div>

      {!user?.uid && (
        <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-3 text-sm flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5" />
          <div>Inicia sesión para ver tus análisis guardados.</div>
        </div>
      )}

      {isEmpty && (
        <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-3 text-sm flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5" />
          <div>
            Aún no tienes registros en <code>history</code>. Cuando realices tu primer Análisis Sensorial,
            aparecerá aquí automáticamente.
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <HistoryCard key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}
