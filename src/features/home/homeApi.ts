import { supabase } from '@/lib/supabase';

/**
 * Bloque 4 · Home — API.
 * Principio innegociable: "No puedes consumir experiencias si todavía no has vivido la tuya."
 * El feed se sirve, pero la UI solo lo desbloquea si `unlocked` es true.
 */

export type WeeklyChallenge = {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  reward_points: number;
  week_number: number | null;
  season_year: number | null;
  ends_at: string | null;
  participant_count: number;
};

export type MyParticipation = {
  id: string;
  status: 'started' | 'evidence_pending' | 'in_review' | 'approved' | 'rejected' | 'expired';
  completed_at: string | null;
};

export type FeedPost = {
  id: string;
  image_url: string | null;
  caption: string | null;
  city: string | null;
  created_at: string;
  author: { display_name: string | null; username: string | null; avatar_url: string | null } | null;
  challenge: { title: string; emoji: string | null } | null;
};

export type HomeData = {
  challenge: WeeklyChallenge | null;
  participation: MyParticipation | null;
  /** true = ya vivió su experiencia esta semana → puede ver el feed. */
  unlocked: boolean;
  displayName: string | null;
  streak: number;
};

/** Reto semanal en curso. */
export async function fetchWeeklyChallenge(): Promise<WeeklyChallenge | null> {
  const { data } = await supabase
    .from('challenges')
    .select(
      'id, title, description, emoji, difficulty, reward_points, week_number, season_year, ends_at, participant_count',
    )
    .eq('status', 'active')
    .eq('challenge_type', 'weekly')
    .order('starts_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? (data as WeeklyChallenge) : null;
}

/** Todo lo que la Home necesita, en una sola llamada (evita cascadas de spinners). */
export async function fetchHome(userId: string): Promise<HomeData> {
  const challenge = await fetchWeeklyChallenge();

  const [{ data: profile }, { data: streakRow }] = await Promise.all([
    supabase.from('user_profiles').select('display_name').eq('user_id', userId).maybeSingle(),
    supabase.from('user_streaks').select('current_streak').eq('user_id', userId).maybeSingle(),
  ]);

  let participation: MyParticipation | null = null;
  if (challenge) {
    const { data } = await supabase
      .from('challenge_participations')
      .select('id, status, completed_at')
      .eq('user_id', userId)
      .eq('challenge_id', challenge.id)
      .maybeSingle();
    participation = data ? (data as MyParticipation) : null;
  }

  return {
    challenge,
    participation,
    unlocked: participation?.status === 'approved',
    displayName: profile?.display_name ?? null,
    streak: streakRow?.current_streak ?? 0,
  };
}

/**
 * Feed de experiencias reales. Solo se pide cuando el usuario ya ha desbloqueado.
 * Nota: `experience_posts.author_id` apunta a `users`, no a `user_profiles`, así que
 * PostgREST no puede unirlos por sí solo. Traemos los perfiles en una segunda consulta
 * y los unimos aquí (2 consultas fijas, no N+1).
 */
export async function fetchFeed(): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from('experience_posts')
    .select('id, author_id, image_url, caption, city, created_at, challenge:challenges(title, emoji)')
    .eq('moderation', 'approved')
    .eq('privacy', 'public')
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw new Error('No se pudo cargar el feed.');

  const rows = (data ?? []) as unknown as (Omit<FeedPost, 'author'> & { author_id: string })[];
  if (rows.length === 0) return [];

  const authorIds = [...new Set(rows.map((r) => r.author_id))];
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, display_name, username, avatar_url')
    .in('user_id', authorIds);

  const byId = new Map((profiles ?? []).map((p) => [p.user_id, p]));
  return rows.map(({ author_id, ...post }) => ({
    ...post,
    author: byId.get(author_id) ?? null,
  }));
}

/** Cuenta atrás hasta el final del reto (o hasta el lunes, si no hay fecha). */
export function timeLeft(endsAt: string | null): { days: number; hours: number; minutes: number; over: boolean } {
  const end = endsAt ? new Date(endsAt) : nextMonday();
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, over: true };
  const minutes = Math.floor(ms / 60000);
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor((minutes % 1440) / 60),
    minutes: minutes % 60,
    over: false,
  };
}

function nextMonday(): Date {
  const d = new Date();
  const day = d.getDay(); // 0 domingo … 1 lunes
  const daysUntilMonday = (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Semana del año (ISO). La temporada tiene 52. */
export function isoWeek(date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Saludo por hora del día. Pequeño detalle, hace que la app se sienta viva. */
export function greeting(name: string | null): string {
  const h = new Date().getHours();
  const hi = h < 6 ? 'Aún despierto' : h < 13 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
  return name ? `${hi}, ${name.split(' ')[0]}` : hi;
}
