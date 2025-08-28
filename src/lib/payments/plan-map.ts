// src/lib/payments/plan-map.ts
// Claves internas tal como quieres conservarlas en tu app:
export type PlanKey =
  | "iniciado"
  | "copa premium"
  | "sibarita"
  | "una copa"
  | "iniciado anual"
  | "copa premium anual"
  | "sibarita anual"
  | "una copa anual"
  | "descúbrete";

// Mapeo por NOMBRE que envía LemonSqueezy (minúsculas, sin tildes opc.)
export const LEMON_VARIANTNAME_TO_PLAN: Record<string, PlanKey> = {
  "iniciado": "iniciado",
  "copa premium": "copa premium",
  "sibarita": "sibarita",
  "una copa": "una copa",
  "iniciado anual": "iniciado anual",
  "copa premium anual": "copa premium anual",
  "sibarita anual": "sibarita anual",
  "una copa anual": "una copa anual",
  "descúbrete": "descúbrete",
  "default": "iniciado", // por si aún llega "Default" en algunos eventos
};

export function resolvePlanFromLemon(evt: any): PlanKey | null {
  const a = evt?.data?.attributes;
  const d = a?.data || {};
  const vName = String(d.variant_name ?? "").trim().toLowerCase();
  return (vName && LEMON_VARIANTNAME_TO_PLAN[vName]) || null;
}
