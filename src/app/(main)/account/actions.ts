
'use server';

import { requestVendorRole as requestVendorRoleFlow } from '@/ai/flows/request-vendor-role';
import type { RequestVendorRoleOutput } from '@/lib/schemas';
import { auth } from '@/lib/firebase';

// Se ha simplificado la acción para no requerir un input.
// El UID del usuario se obtendrá de forma segura en el backend.
export async function requestVendorRole(): Promise<RequestVendorRoleOutput> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: 'Usuario no autenticado.' };
  }
  const result = await requestVendorRoleFlow({ uid: user.uid });
  return result;
}

    