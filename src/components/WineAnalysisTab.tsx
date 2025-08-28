"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { z } from "zod";
import { WineAnalysisClientSchema } from "@/lib/schemas";

// ⬇️ Este es tu componente (no toco tu UI; solo te doy el onSubmit correcto)
export default function WineAnalysisForm(/* tus props si aplica */) {
  const router = useRouter();
  const { user } = useAuth();

  // Tipar el payload con tu Zod schema ayuda a TS a validar
  type ClientInput = z.infer<typeof WineAnalysisClientSchema>;

  // ⬇️ Reemplaza tu onSubmit por este
  async function onSubmit(values: any) {
    if (!user?.uid) {
      throw new Error("Debes iniciar sesión para analizar un producto");
    }

    // "language" DEBE ser literal "es" | "en" (no string genérico)
    const lang: "es" | "en" = values?.language === "en" ? "en" : "es";

    const payload: ClientInput = {
      uid: user.uid,                                   // 👈 imprescindible para guardar
      wineName: String(values.wineName ?? "").trim(),
      year: Number(values.year),
      grapeVariety: values?.grapeVariety || undefined,
      wineryName: values?.wineryName || undefined,
      country: values?.country || undefined,
      language: lang,
    };

    // Llamamos a la API que ejecuta IA y GUARDA en 'history'
    const res = await fetch("/api/analyze-wine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || "No se pudo completar el análisis");
    }

    // Si la API devolvió el ID guardado, vamos directo al detalle
    if (data.savedId) {
      router.push(`/history/${data.savedId}`);
    } else {
      // Fallback: refrescar la lista si por algún motivo no vino el ID
      router.push("/history");
    }
  }

  // ⬇️ Devuelve tu JSX habitual; asegúrate de usar onSubmit en tu <form>
  // <form onSubmit={handleSubmit(onSubmit)}> ... </form>
  return null; // ← aquí va tu UI real
}
