/**
 * Tipos del esquema de Supabase (subset tipado a mano para el arranque).
 * En cuanto el esquema esté aplicado, se puede regenerar automáticamente con:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ParticipationStatus =
  | 'started' | 'evidence_pending' | 'in_review' | 'approved' | 'rejected' | 'expired';

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  birth_date: string | null;
  looking_for: string | null;
  spontaneity: number | null;
  profile_complete: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  category: string | null;
  difficulty: Difficulty;
  emoji: string | null;
  reward_points: number;
  week_number: number | null;
  season_year: number | null;
  starts_at: string | null;
  ends_at: string | null;
  status: 'draft' | 'scheduled' | 'available' | 'closed';
  participant_count: number;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  best_streak: number;
  last_week_completed: string | null;
}

/** Forma mínima que TanStack/Supabase necesitan; se ampliará al generar tipos. */
export interface Database {
  public: {
    Tables: {
      user_profiles: { Row: UserProfile; Insert: Partial<UserProfile>; Update: Partial<UserProfile> };
      challenges: { Row: Challenge; Insert: Partial<Challenge>; Update: Partial<Challenge> };
      user_streaks: { Row: UserStreak; Insert: Partial<UserStreak>; Update: Partial<UserStreak> };
    };
    Functions: {
      complete_challenge: {
        Args: { p_challenge: string; p_evidence: string; p_validation: unknown };
        Returns: unknown;
      };
    };
  };
}
