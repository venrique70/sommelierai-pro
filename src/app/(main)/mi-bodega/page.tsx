"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Wine, Plus } from "lucide-react";

// Firestore (SDK modular)
import { db } from "@/lib/firebase";
import {
  collection, query, where, limit, getDocs, Timestamp,
} from "firebase/firestore";

type Bottle = {
  id: string;
  wineName: string;
  year?: number;
  country?: string;
  grapeVariety?: string;
  addedAt?: string | number | Date | Timestamp;
};

export default function MyCellarPage() {
  const [items, setItems] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const load = async () => {
      try {
        // Consulta SIN orderBy (no requiere índice compuesto)
        const snap = await getDocs(
          query(
            collection(db, "cellar"),
            where("uid", "==", user.uid),
            limit(200)
          )
        );

        // Normaliza y ORDENA en cliente (desc)
        const rows = snap.docs
          .map((d) => {
            const x = d.data() as any;
            const added =
              x?.addedAt?.toDate?.() ??
              (x?.addedAt?.seconds ? new Date(x.addedAt.seconds * 1000) : undefined) ??
              (x?.addedAt ? new Date(x.addedAt) : new Date());

            return {
              id: d.id,
              wineName: x.wineName ?? x.name ?? "Producto",
              year: x.year,
              country: x.country,
              grapeVariety: x.grapeVariety,
              addedAt: added,
            } as Bottle;
          })
          .sort(
            (a, b) =>
              new Date(b.addedAt as any).getTime() -
              new Date(a.addedAt as any).getTime()
          );

        setItems(rows);
      } catch (e: any) {
        setError(e?.message || "Ocurrió un error al cargar tu bodega.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, authLoading, router]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
            <Wine /> Mi Bodega Personal
          </h1>
          <p className="text-muted-foreground mt-2">Cargando tu colección…</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="rounded-lg object-cover aspect-square w-full" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-5 w-1/2" />
              </CardHeader>
              <CardContent><Skeleton className="h-6 w-1/3" /></CardContent>
              <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
            <Wine /> Mi Bodega Personal
          </h1>
          <p className="text-muted-foreground mt-2">
            Aquí puedes gestionar tu colección de vinos.
          </p>
        </div>
        <Button asChild>
          <Link href="/mi-bodega/add"><Plus className="mr-2 h-4 w-4" /> Añadir botella</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="text-center p-12">
          <CardTitle>Tu bodega está vacía.</CardTitle>
          <CardDescription className="mt-2">
            Aún no has añadido botellas a tu colección.
          </CardDescription>
          <Button asChild className="mt-4">
            <Link href="/mi-bodega/add">Añadir mi primera botella</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((b) => (
            <Card key={b.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="mt-2">{b.wineName}</CardTitle>
                <CardDescription>
                  {b.grapeVariety || "N/A"}{b.year ? ` · ${b.year}` : ""}{b.country ? ` · ${b.country}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Añadido: {new Date(
                    (b.addedAt as any)?.seconds ? (b.addedAt as Timestamp).toDate() : (b.addedAt as any)
                  ).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/mi-bodega/${b.id}`}>Ver detalle</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
