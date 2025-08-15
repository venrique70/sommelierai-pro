"use server";
import "server-only";

import { adminDb } from "@/lib/firebase-admin";
import type { WineInCellarFormValues } from "@/lib/schemas";

// Normaliza cualquier documento a la forma que espera tu UI
function normalize(id: string, x: any) {
  return {
    id,
    name: x.name ?? x.wineName ?? "Vino",
    variety: x.variety ?? x.grapeVariety ?? "",
    year: typeof x.year === "number" ? x.year : x.year ? Number(x.year) : undefined,
    quantity: typeof x.quantity === "number" ? x.quantity : x.quantity ? Number(x.quantity) : 1,
    status: x.status ?? "Listo para Beber",
    addedAt: x.addedAt ?? x.createdAt ?? new Date(),
  };
}

// LISTAR
export async function listWinesAction({ uid }: { uid: string }) {
  try {
    const snap = await adminDb()
      .collection("cellar")
      .where("uid", "==", uid)
      .get();

    const wines = snap.docs
      .map((d) => normalize(d.id, d.data()))
      .sort(
        (a, b) =>
          new Date(b.addedAt as any).getTime() -
          new Date(a.addedAt as any).getTime()
      );

    return { wines };
  } catch (e: any) {
    return { error: String(e?.message || e) };
  }
}

// AÑADIR
export async function addWineAction({
  uid,
  name,
  variety,
  year,
  quantity,
  status,
}: { uid: string } & WineInCellarFormValues) {
  try {
    const doc = {
      uid,
      name: name?.trim(),
      variety: variety?.trim() ?? "",
      year: year ?? null,
      quantity: quantity ?? 1,
      status: status ?? "Listo para Beber",
      addedAt: new Date(),
    };

    const ref = await adminDb().collection("cellar").add(doc);
    return { success: true, id: ref.id };
  } catch (e: any) {
    return { success: false, error: String(e?.message || e) };
  }
}

// ACTUALIZAR
export async function updateWineAction({
  uid,
  wineId,
  name,
  variety,
  year,
  quantity,
  status,
}: { uid: string; wineId: string } & WineInCellarFormValues) {
  try {
    const ref = adminDb().collection("cellar").doc(wineId);
    const snap = await ref.get();
    if (!snap.exists) return { success: false, error: "No encontrado" };
    if (snap.data()?.uid !== uid) return { success: false, error: "No autorizado" };

    await ref.update({
      name: name?.trim(),
      variety: variety?.trim() ?? "",
      year: year ?? null,
      quantity: quantity ?? 1,
      status: status ?? "Listo para Beber",
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: String(e?.message || e) };
  }
}

// ELIMINAR
export async function deleteWineAction({
  uid,
  wineId,
}: { uid: string; wineId: string }) {
  try {
    const ref = adminDb().collection("cellar").doc(wineId);
    const snap = await ref.get();
    if (!snap.exists) return { success: false, error: "No encontrado" };
    if (snap.data()?.uid !== uid) return { success: false, error: "No autorizado" };

    await ref.delete();
    return { success: true };
  } catch (e: any) {
    return { success: false, error: String(e?.message || e) };
  }
}
