export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string // ahora opcional
) {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(result.user, {
    displayName: displayName || email.split("@")[0] || "Usuario",
  });

  return result.user;
}
