"use server";
import "server-only";

import { listWinesFromCellar } from "@/ai/flows/list-wines-from-cellar";
import type { ListWinesFromCellarOutput } from "@/lib/schemas";

// Acepta { uid, limit? } pero SOLO envía uid al flow (evita el error de TS)
export async function listCellarAction(params: { uid: string; limit?: number }): Promise<ListWinesFromCellarOutput> {
  return await listWinesFromCellar({ uid: params.uid });
}
