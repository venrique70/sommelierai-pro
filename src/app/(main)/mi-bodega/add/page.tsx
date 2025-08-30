"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { addWineAction } from "../actions";  // ✅ importamos la server action

export default function AddBottlePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ wineName: "", year: "", country: "", grapeVariety: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && !user) {
    router.push("/login");
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.wineName.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!user) {
      setError("Debes iniciar sesión.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await addWineAction({
        uid: user.uid,
        name: form.wineName,
        variety: form.grapeVariety || "",
        year: form.year ? Number(form.year) : undefined,
        quantity: 1,
        status: "Listo para Beber",
      });

      if (!result.success) throw new Error(result.error || "No se pudo guardar la botella.");

      // volver a la lista y refrescar
      router.push("/mi-bodega");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar la botella.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Añadir botella</h1>
        <Button asChild variant="outline">
          <Link href="/mi-bodega">Volver</Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Datos de la botella</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Nombre del vino *</Label>
              <Input
                value={form.wineName}
                onChange={(e) => setForm(f => ({ ...f, wineName: e.target.value }))}
                placeholder="Malbec Reserva..."
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Año</Label>
                <Input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm(f => ({ ...f, year: e.target.value }))}
                  placeholder="2019"
                />
              </div>
              <div>
                <Label>País</Label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))}
                  placeholder="Argentina"
                />
              </div>
              <div>
                <Label>Cepa / Variedad</Label>
                <Input
                  value={form.grapeVariety}
                  onChange={(e) => setForm(f => ({ ...f, grapeVariety: e.target.value }))}
                  placeholder="Malbec"
                />
              </div>
            </div>
            <CardFooter className="p-0">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Guardando…" : (
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />Guardar
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
