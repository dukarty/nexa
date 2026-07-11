import { z } from 'zod';
import { supabase } from '@/lib/supabase';

/** Validaciones compartidas (cliente). El servidor las refuerza vía RLS + Auth. */
export const credentials = z.object({
  email: z.string().email('Introduce un correo válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});
export type Credentials = z.infer<typeof credentials>;

/** Traduce errores de Supabase a mensajes claros y accionables (no genéricos). */
function humanError(message: string): string {
  if (/already registered/i.test(message)) return 'Ese correo ya tiene cuenta. Inicia sesión.';
  if (/Invalid login/i.test(message)) return 'Correo o contraseña incorrectos.';
  if (/Email not confirmed/i.test(message)) return 'Confirma tu correo antes de entrar.';
  if (/rate limit/i.test(message)) return 'Demasiados intentos. Espera un momento.';
  return 'No se pudo completar. Inténtalo de nuevo.';
}

export async function signUp(input: Credentials) {
  const { error } = await supabase.auth.signUp(input);
  if (error) throw new Error(humanError(error.message));
}

export async function signIn(input: Credentials) {
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) throw new Error(humanError(error.message));
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset`,
  });
  if (error) throw new Error(humanError(error.message));
}
