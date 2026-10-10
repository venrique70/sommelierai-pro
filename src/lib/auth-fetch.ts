// src/lib/auth-fetch.ts
// fetch del lado cliente que agrega el token de sesión de Firebase.
import { auth } from "@/lib/firebase";

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = await auth.currentUser?.getIdToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
