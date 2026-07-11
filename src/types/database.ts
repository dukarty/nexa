/**
 * Tipos del esquema de Supabase (escritos a mano, con la forma EXACTA que espera supabase-js:
 * cada tabla necesita Row/Insert/Update/Relationships y el esquema necesita
 * Tables/Views/Functions/Enums/CompositeTypes. Si falta cualquiera de esas piezas,
 * el cliente infiere `never` y todo el tipado se rompe silenciosamente.)
 *
 * Cuando queramos regenerarlos desde el esquema real:
 *   npx supabase gen types typescript --project-id mswcrxidpkyuuprhocxp > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Difficulty = 'easy' | 'medium' | 'hard';
export type ParticipationStatus =
  | 'started' | 'evidence_pending' | 'in_review' | 'approved' | 'rejected' | 'expired';
export type ChallengeStatus = 'draft' | 'scheduled' | 'available' | 'closed';
export type AccountStatus = 'active' | 'suspended' | 'deleted';
export type UserRole = 'user' | 'moderator' | 'admin';

export type UserRow = {
  id: string;
  email: string | null;
  status: AccountStatus;
  role: UserRole;
  onboarding_done: boolean;
  settings: Json;
  privacy: Json;
  created_at: string;
  last_seen_at: string;
};

export type UserProfile = {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  birth_date: string | null;
  looking_for: string | null;
  seeking_people: string | null;
  spontaneity: number | null;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type Interest = {
  id: string;
  slug: string;
  name: string;
  category: string;
  icon: string | null;
  active: boolean;
};

export type UserInterest = {
  user_id: string;
  interest_id: string;
};

export type Challenge = {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  category: string | null;
  difficulty: Difficulty;
  emoji: string | null;
  image_url: string | null;
  reward_points: number;
  challenge_type: string;
  validation_rules: Json;
  visibility: string;
  week_number: number | null;
  season_year: number | null;
  starts_at: string | null;
  ends_at: string | null;
  status: ChallengeStatus;
  participant_count: number;
  created_at: string;
};

export type ChallengeParticipation = {
  id: string;
  user_id: string;
  challenge_id: string;
  status: ParticipationStatus;
  started_at: string;
  completed_at: string | null;
  evidence_url: string | null;
  validation_result: Json;
  score: number;
  experiences_awarded: number;
  is_highlight: boolean;
  reviewed_at: string | null;
  reject_reason: string | null;
  reward_granted: boolean;
};

export type ExperiencePost = {
  id: string;
  author_id: string;
  challenge_id: string | null;
  participation_id: string | null;
  image_url: string | null;
  caption: string | null;
  city: string | null;
  privacy: string;
  moderation: 'pending' | 'approved' | 'rejected' | 'hidden';
  interaction_count: number;
  is_highlight: boolean;
  created_at: string;
};

export type UserStreak = {
  user_id: string;
  current_streak: number;
  best_streak: number;
  last_week_completed: string | null;
};

export type MonthlyProgress = {
  user_id: string;
  year: number;
  month: number;
  experiences: number;
  position: number | null;
  passport_stamp: boolean;
};

/** Azúcar: una tabla estándar con Insert/Update derivados de la Row. */
type Table<Row, Required extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: Table<UserRow, 'id'>;
      user_profiles: Table<UserProfile, 'user_id'>;
      interests: Table<Interest, 'slug' | 'name' | 'category'>;
      user_interests: Table<UserInterest, 'user_id' | 'interest_id'>;
      challenges: Table<Challenge, 'title'>;
      challenge_participations: Table<ChallengeParticipation, 'user_id' | 'challenge_id'>;
      experience_posts: Table<ExperiencePost, 'author_id'>;
      user_streaks: Table<UserStreak, 'user_id'>;
      monthly_progress: Table<MonthlyProgress, 'user_id' | 'year' | 'month'>;
    };
    Views: { [_ in never]: never };
    Functions: {
      complete_challenge: {
        Args: { p_challenge: string; p_evidence: string; p_validation: Json };
        Returns: Json;
      };
    };
    Enums: {
      difficulty: Difficulty;
      participation_status: ParticipationStatus;
      challenge_status: ChallengeStatus;
      account_status: AccountStatus;
      user_role: UserRole;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
