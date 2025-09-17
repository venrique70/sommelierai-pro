"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { z } from "zod";
import { WineAnalysisClientSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";

type ClientInput = z.infer<typeof WineAnalysisClientSchema>;

export default function WineAnalysisTab() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{
    wineName: string;
    year: number;
    grapeVariety?: string;
    wineryName?: string;
    country?: string;
    language?: string;
  }>({ defaultValues: { language: "es" } });

  async function onSubmit(values: any) {
    setError(null);
    if (!user?.uid) throw new Error("Debes iniciar sesión para analizar un producto");

    const lang: "es" | "en" = values?.language === "en" ? "en" : "es";

    const payload: ClientInput = {
      uid: user.uid,
      wineName: String(values.wineName ?? "").trim(),
      year: Number(values.year ?? 0),
      grapeVariety: values?.grapeVariety || undefined,
      wineryName: values?.wineryName || undefined,
      country: values?.country || undefined,
      language: lang,
    };

    const res = await fetch("/api/analyze-wine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok || !data?.ok) throw new Error(data?.error || "No se pudo completar el análisis");

    // 🚧 Si no está verificado o no hay análisis, no redirigimos; mostramos aviso
    const r = data?.result;
    if (!r || r.verified === false || !r.analysis) {
      setError("Vino no verificado. Por favor indica bodega y país exactos (y año si aplica).");
      return;
    }

    if (data.savedId) router.push(`/history/${data.savedId}`);
    else router.push("/history");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3" autoComplete="off">
      <input
        {...register("wineName", { required: true })}
        placeholder="Nombre del vino"
        autoComplete="off"
        className="border rounded px-3 py-2"
      />
      <input
        type="number"
        {...register("year", { valueAsNumber: true, required: true })}
        placeholder="Año"
        autoComplete="off"
        inputMode="numeric"
        min={1900}
        max={2100}
        className="border rounded px-3 py-2"
      />
      <input
        {...register("grapeVariety")}
        placeholder="Cepa (opcional)"
        autoComplete="off"
        className="border rounded px-3 py-2"
      />
      <input
        {...register("wineryName")}
        placeholder="Bodega (opcional)"
        autoComplete="off"
        className="border rounded px-3 py-2"
      />
      <input
        {...register("country")}
        placeholder="País (opcional)"
        autoComplete="off"
        className="border rounded px-3 py-2"
      />

      <label className="text-sm">Idioma</label>
      <select {...register("language")} className="border rounded px-3 py-2 w-fit">
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-red-800">
          <strong>Atención:</strong> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded bg-yellow-500 text-white px-4 py-2 disabled:opacity-60"
      >
        {isSubmitting ? "Analizando…" : "Analizar vino"}
      </button>
    </form>
  );
}
