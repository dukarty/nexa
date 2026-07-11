import { z } from 'zod';
import { supabase } from '@/lib/supabase';

/**
 * Bloque 3 · Onboarding — API.
 * Reglas duras:
 *  - La fecha de nacimiento se fija AQUÍ y queda protegida después (la edad se deriva, nunca se guarda).
 *  - Los intereses se guardan NORMALIZADOS (user_interests), nunca como texto libre.
 *  - `profile_complete` es la única señal que abre la app (la lee useSession).
 */

export type Interest = { id: string; slug: string; name: string; category: string };

const MIN_AGE = 16;
const MAX_AGE = 100;

export const basics = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, 'Escribe tu nombre (mínimo 2 caracteres).')
    .max(40, 'Nombre demasiado largo.'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'El usuario necesita al menos 3 caracteres.')
    .max(20, 'Máximo 20 caracteres.')
    .regex(/^[a-z0-9_.]+$/, 'Solo letras, números, punto y guion bajo.'),
  city: z.string().trim().min(2, 'Dinos tu ciudad.').max(60, 'Ciudad demasiado larga.'),
  birth_date: z
    .string()
    .min(1, 'Necesitamos tu fecha de nacimiento.')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha no válida.')
    .refine((v) => ageFrom(v) >= MIN_AGE, `Debes tener al menos ${MIN_AGE} años para usar NEXA.`)
    .refine((v) => ageFrom(v) <= MAX_AGE, 'Revisa la fecha de nacimiento.'),
});
export type Basics = z.infer<typeof basics>;

export const preferences = z.object({
  interestIds: z.array(z.string().uuid()).min(3, 'Elige al menos 3. Así acertamos con lo que te proponemos.'),
  looking_for: z.string().trim().max(120).optional().or(z.literal('')),
  seeking_people: z.string().trim().max(120).optional().or(z.literal('')),
  spontaneity: z.number().int().min(0).max(100),
});
export type Preferences = z.infer<typeof preferences>;

export function ageFrom(birth: string): number {
  const b = new Date(birth);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

/** Catálogo de intereses (lectura pública por RLS). */
export async function fetchInterests(): Promise<Interest[]> {
  const { data, error } = await supabase
    .from('interests')
    .select('id, slug, name, category')
    .eq('active', true)
    .order('category')
    .order('name');
  if (error) throw new Error('No se pudo cargar el catálogo de intereses.');
  return (data ?? []) as Interest[];
}

/** ¿Está libre el nombre de usuario? Comprobación optimista; la unicidad real la impone la BD. */
export async function isUsernameFree(username: string, selfId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('username', username.toLowerCase())
    .maybeSingle();
  if (error) return true; // no bloqueamos el flujo por un fallo de lectura
  return !data || data.user_id === selfId;
}

function humanError(message: string): string {
  if (/duplicate key|unique/i.test(message)) return 'Ese nombre de usuario ya está cogido. Prueba otro.';
  if (/row-level security/i.test(message)) return 'Tu sesión ha caducado. Vuelve a entrar.';
  return 'No se pudo guardar. Inténtalo de nuevo.';
}

/**
 * Guardado final del onboarding. Orden importante:
 *  1) perfil (con birth_date, ya inmutable en la práctica desde la UI)
 *  2) intereses normalizados (borrado + inserción, idempotente)
 *  3) marcar cuenta como onboarded
 *  4) profile_complete = true  ← lo último: si algo falla antes, el usuario repite sin quedar a medias
 */
export async function completeOnboarding(userId: string, b: Basics, p: Preferences): Promise<void> {
  const { error: e1 } = await supabase.from('user_profiles').upsert(
    {
      user_id: userId,
      display_name: b.display_name,
      username: b.username.toLowerCase(),
      city: b.city,
      birth_date: b.birth_date,
      looking_for: p.looking_for || null,
      seeking_people: p.seeking_people || null,
      spontaneity: p.spontaneity,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (e1) throw new Error(humanError(e1.message));

  await supabase.from('user_interests').delete().eq('user_id', userId);
  if (p.interestIds.length) {
    const { error: e2 } = await supabase
      .from('user_interests')
      .insert(p.interestIds.map((interest_id) => ({ user_id: userId, interest_id })));
    if (e2) throw new Error(humanError(e2.message));
  }

  await supabase.from('users').update({ onboarding_done: true }).eq('id', userId);

  const { error: e4 } = await supabase
    .from('user_profiles')
    .update({ profile_complete: true })
    .eq('user_id', userId);
  if (e4) throw new Error(humanError(e4.message));
}

export type RecommendedChallenge = {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  reward_points: number | null;
};

/**
 * Primer reto recomendado: el reto semanal activo. Si aún no hay temporada cargada,
 * devolvemos null y la pantalla final muestra su estado vacío (sin inventar datos).
 */
export async function fetchFirstChallenge(): Promise<RecommendedChallenge | null> {
  const { data } = await supabase
    .from('challenges')
    .select('id, title, description, emoji, reward_points')
    .eq('status', 'active')
    .order('starts_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as RecommendedChallenge) ?? null;
}
