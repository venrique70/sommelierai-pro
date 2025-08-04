
'use server';
/**
 * @fileOverview Server Actions for the Mi Bodega (My Cellar) feature.
 * This file centralizes the logic for interacting with the backend Genkit flows
 * for adding, updating, and deleting wines from a user's cellar.
 */

import { revalidatePath } from 'next/cache';
import {
  addWineToCellar,
  deleteWineFromCellar,
  listWinesFromCellar,
  updateWineInCellar,
} from '@/ai/flows';

import {
  type AddWineToCellarInput,
  type AddWineToCellarOutput,
  type DeleteWineFromCellarInput,
  type DeleteWineFromCellarOutput,
  type ListWinesFromCellarInput,
  type ListWinesFromCellarOutput,
  type UpdateWineInCellarInput,
  type UpdateWineInCellarOutput,
} from '@/lib/schemas';


// Each function acts as a secure wrapper around the Genkit flow.

export async function addWineAction(
  input: AddWineToCellarInput
): Promise<AddWineToCellarOutput> {
  const result = await addWineToCellar(input);
  if (result.success) {
    revalidatePath('/mi-bodega');
  }
  return result;
}

export async function updateWineAction(
  input: UpdateWineInCellarInput
): Promise<UpdateWineInCellarOutput> {
  const result = await updateWineInCellar(input);
  if (result.success) {
    revalidatePath('/mi-bodega');
  }
  return result;
}

export async function deleteWineAction(
  input: DeleteWineFromCellarInput
): Promise<DeleteWineFromCellarOutput> {
  const result = await deleteWineFromCellar(input);
  if (result.success) {
    revalidatePath('/mi-bodega');
  }
  return result;
}

export async function listWinesAction(
  input: ListWinesFromCellarInput
): Promise<ListWinesFromCellarOutput> {
  // list does not need revalidation as it's a read operation.
  return await listWinesFromCellar(input);
}
