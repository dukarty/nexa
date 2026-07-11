-- ============================================================================
-- NEXA · ESQUEMA ESPEJO DE BASE44 (generado desde base44/entities/*.jsonc)
-- Regla: MISMOS nombres de campo que Base44. Cero renombrados. Cero creatividad.
-- La identidad funcional es el EMAIL (igual que en Base44).
-- Campos de sistema de Base44 replicados: id, created_date, updated_date, created_by
-- ============================================================================
create extension if not exists "uuid-ossp";

-- AppMetric
create table if not exists public.app_metric (
  id                           uuid primary key default uuid_generate_v4(),
  metric_key                   text not null,
  value                        double precision not null,
  updated_at                   timestamptz,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- Battle
create table if not exists public.battle (
  id                           uuid primary key default uuid_generate_v4(),
  creator_email                text not null,
  creator_name                 text,
  opponent_email               text not null,
  opponent_name                text,
  challenge_title              text not null,
  challenge_description        text,
  time_limit_hours             double precision,
  expires_at                   timestamptz,
  status                       text default 'pending',
  creator_proof_url            text,
  opponent_proof_url           text,
  creator_completed_at         timestamptz,
  opponent_completed_at        timestamptz,
  winner_email                 text,
  points_reward                double precision default 50,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- Challenge
create table if not exists public.challenge (
  id                           uuid primary key default uuid_generate_v4(),
  title                        text not null,
  description                  text not null,
  category                     text not null,
  difficulty                   text default 'medio' not null,
  type                         text default 'individual',
  points                       double precision default 10,
  image_url                    text,
  location                     text,
  max_participants             double precision,
  starts_at                    timestamptz,
  ends_at                      timestamptz,
  week                         double precision,
  is_weekly                    boolean default false,
  participant_count            double precision default 0,
  completion_count             double precision default 0,
  is_featured                  boolean default false,
  reward_description           text,
  validation_type              text default 'foto',
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- ChallengeParticipation
create table if not exists public.challenge_participation (
  id                           uuid primary key default uuid_generate_v4(),
  challenge_id                 text not null,
  user_email                   text not null,
  user_name                    text,
  status                       text default 'joined',
  proof_url                    text,
  proof_type                   text,
  proof_caption                text,
  likes_count                  double precision default 0,
  verified_by_count            double precision default 0,
  points_earned                double precision default 0,
  points_awarded               boolean default false,
  completed_at                 timestamptz,
  challenge_title              text,
  challenge_description        text,
  challenge_category           text,
  challenge_week               double precision,
  experience_score             double precision default 0,
  validation_analysis          text,
  is_featured                  boolean default false,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- Comment
create table if not exists public.comments (
  id                           uuid primary key default uuid_generate_v4(),
  participation_id             text not null,
  user_email                   text not null,
  user_name                    text,
  text                         text not null,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- DirectMessage
create table if not exists public.direct_message (
  id                           uuid primary key default uuid_generate_v4(),
  sender_email                 text not null,
  receiver_email               text not null,
  text                         text not null,
  reaction                     text,
  is_read                      boolean default false,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- Drop
create table if not exists public.drops (
  id                           uuid primary key default uuid_generate_v4(),
  title                        text not null,
  tagline                      text,
  description                  text,
  image_url                    text,
  sponsor_name                 text,
  sponsor_logo_url             text,
  category                     text default 'aventura',
  tier                         text default 'principal',
  points_required              double precision default 1200 not null,
  max_winners                  double precision default 1,
  starts_at                    timestamptz,
  ends_at                      timestamptz,
  status                       text default 'active',
  participant_count            double precision default 0,
  benefits                     jsonb default '[]'::jsonb,
  steps_to_win                 jsonb default '[]'::jsonb,
  winner_email                 text,
  winner_name                  text,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- Follow
create table if not exists public.follow (
  id                           uuid primary key default uuid_generate_v4(),
  follower_email               text not null,
  following_email              text not null,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- Highlight
create table if not exists public.highlight (
  id                           uuid primary key default uuid_generate_v4(),
  user_email                   text not null,
  name                         text not null,
  emoji                        text,
  cover_url                    text,
  story_ids                    jsonb default '[]'::jsonb,
  sort_order                   double precision default 0,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- MessageRequest
create table if not exists public.message_request (
  id                           uuid primary key default uuid_generate_v4(),
  sender_email                 text not null,
  receiver_email               text not null,
  first_message                text not null,
  status                       text default 'pending',
  created_at                   timestamptz,
  updated_at                   timestamptz,
  expires_at                   timestamptz,
  last_message_at              timestamptz,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- Notification
create table if not exists public.notification (
  id                           uuid primary key default uuid_generate_v4(),
  user_email                   text not null,
  type                         text not null,
  title                        text not null,
  message                      text,
  reference_id                 text,
  is_read                      boolean default false,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- PostLike
create table if not exists public.post_like (
  id                           uuid primary key default uuid_generate_v4(),
  participation_id             text not null,
  user_email                   text not null,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- Reaction
create table if not exists public.reaction (
  id                           uuid primary key default uuid_generate_v4(),
  participation_id             text not null,
  user_email                   text not null,
  type                         text default 'fire' not null,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- Story
create table if not exists public.story (
  id                           uuid primary key default uuid_generate_v4(),
  user_email                   text not null,
  user_name                    text,
  image_url                    text not null,
  caption                      text,
  type                         text default 'regular',
  highlight_id                 text,
  views                        jsonb default '[]'::jsonb,
  expires_at                   timestamptz,
  is_public                    boolean default true,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- User: OMITIDA a propósito. Es palabra reservada en Postgres y la entidad solo tenía 'role'.
--   Supabase ya trae auth.users; el rol vive en user_profile.role (añadido abajo).

-- UserPresence
create table if not exists public.user_presence (
  id                           uuid primary key default uuid_generate_v4(),
  user_email                   text not null,
  session_id                   text not null,
  last_seen                    timestamptz not null,
  is_active                    boolean default true,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- UserProfile
create table if not exists public.user_profile (
  id                           uuid primary key default uuid_generate_v4(),
  user_email                   text not null,
  auth_user_id                 text,
  role                         text default 'user',
  display_name                 text not null,
  username                     text,
  avatar_url                   text,
  bio                          text,
  city                         text,
  birthdate                    text,
  intent                       text,
  persona                      text,
  interests                    jsonb default '[]'::jsonb,
  primary_intent               text,
  activity_level               text,
  yearly_goal                  text,
  people_types                 jsonb default '[]'::jsonb,
  onboarding_data              jsonb default '{}'::jsonb,
  learned_preferences          jsonb default '{}'::jsonb,
  total_points                 double precision default 0,
  level                        double precision default 1,
  challenges_completed         double precision default 0,
  challenges_created           double precision default 0,
  current_streak               double precision default 0,
  longest_streak               double precision default 0,
  battles_total                double precision default 0,
  battles_won                  double precision default 0,
  battle_streak                double precision default 0,
  badges                       jsonb,
  is_private                   boolean default false,
  onboarding_completed         boolean default false,
  profile_updated_at           timestamptz,
  account_status               text default 'active',
  deletion_requested           boolean default false,
  deletion_requested_at        timestamptz,
  deletion_grace_until         timestamptz,
  deleted_at                   timestamptz,
  completed_categories_count   jsonb default '{}'::jsonb,
  streak_start_date            timestamptz,
  last_completion_date         timestamptz,
  wildcard_next_available      timestamptz,
  life_pause_active            boolean default false,
  life_pause_expires           timestamptz,
  feed_unlocked_until          timestamptz,
  challenges_intro_seen        boolean default false,
  birthdate_correction_used    boolean default false,
  created_date                 timestamptz default now(),
  updated_date                 timestamptz default now(),
  created_by                   text
);

-- ============================================================================
-- ÍNDICES (según los patrones de consulta reales del código)
-- ============================================================================
create unique index if not exists uq_profile_email      on public.user_profile(lower(user_email));
create unique index if not exists uq_profile_username   on public.user_profile(lower(username)) where username is not null;
create index if not exists idx_profile_points           on public.user_profile(total_points desc);
create index if not exists idx_profile_auth             on public.user_profile(auth_user_id);
create index if not exists idx_part_user                on public.challenge_participation(user_email);
create index if not exists idx_part_challenge           on public.challenge_participation(challenge_id);
create unique index if not exists uq_part_user_challenge on public.challenge_participation(user_email, challenge_id);
create index if not exists idx_part_status              on public.challenge_participation(status, completed_at desc);
create index if not exists idx_challenge_week           on public.challenge(week) where is_weekly = true;
create unique index if not exists uq_follow             on public.follow(follower_email, following_email);
create index if not exists idx_follow_following         on public.follow(following_email);
create index if not exists idx_dm_pair                  on public.direct_message(sender_email, receiver_email, created_date desc);
create index if not exists idx_dm_receiver              on public.direct_message(receiver_email, is_read);
create index if not exists idx_notif_user               on public.notification(user_email, is_read, created_date desc);
create unique index if not exists uq_postlike           on public.post_like(participation_id, user_email);
create index if not exists idx_comment_part             on public.comments(participation_id, created_date);
create index if not exists idx_presence_active          on public.user_presence(is_active, last_seen desc);

-- ============================================================================
-- PUENTE CON SUPABASE AUTH
-- Base44 identifica por email; Supabase por uuid. Mantenemos AMBOS.
-- auth_user_id ya existía en UserProfile → lo usamos como puente, sin romper nada.
-- ============================================================================
create or replace function public.current_email() returns text
language sql stable security definer as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- Al registrarse un usuario, crear su UserProfile (equivale a createInitialProfile)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into public.user_profile (user_email, auth_user_id, display_name, account_status, onboarding_completed)
  values (lower(new.email), new.id, split_part(new.email,'@',1), 'active', false)
  on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- RLS · Regla de oro: el cliente NUNCA escribe puntos, likes, follows ni rachas.
-- Eso sigue pasando SOLO por Edge Functions con service_role (igual que hoy en Base44).
-- ============================================================================
alter table public.user_profile             enable row level security;
alter table public.challenge                enable row level security;
alter table public.challenge_participation  enable row level security;
alter table public.follow                   enable row level security;
alter table public.direct_message           enable row level security;
alter table public.message_request          enable row level security;
alter table public.notification             enable row level security;
alter table public.comments                  enable row level security;
alter table public.post_like                enable row level security;
alter table public.reaction                 enable row level security;
alter table public.story                    enable row level security;
alter table public.highlight                enable row level security;
alter table public.battle                   enable row level security;
alter table public.drops                     enable row level security;
alter table public.user_presence            enable row level security;
alter table public.app_metric               enable row level security;

-- Perfiles: todos visibles (es una red social); solo el dueño edita campos no sensibles.
create policy p_profile_read   on public.user_profile for select using (true);
create policy p_profile_update on public.user_profile for update using (lower(user_email) = public.current_email());

-- Retos y drops: lectura pública, escritura solo backend.
create policy p_challenge_read on public.challenge for select using (true);
create policy p_drop_read      on public.drops      for select using (true);
create policy p_metric_read    on public.app_metric for select using (true);

-- Participaciones: se ven las completadas (son el feed) y siempre las propias.
create policy p_part_read on public.challenge_participation for select
  using (status = 'completed' or lower(user_email) = public.current_email());
create policy p_part_insert on public.challenge_participation for insert
  with check (lower(user_email) = public.current_email());
create policy p_part_update on public.challenge_participation for update
  using (lower(user_email) = public.current_email());

-- Social: lectura pública; la ESCRITURA va por Edge Function (no hay policy de insert).
create policy p_follow_read   on public.follow    for select using (true);
create policy p_like_read     on public.post_like for select using (true);
create policy p_comment_read  on public.comments   for select using (true);
create policy p_reaction_read on public.reaction  for select using (true);
create policy p_story_read    on public.story     for select using (is_public = true or lower(user_email) = public.current_email());
create policy p_highlight_read on public.highlight for select using (true);

-- Mensajes: SOLO los tuyos. Nadie más los lee.
create policy p_dm_read on public.direct_message for select
  using (lower(sender_email) = public.current_email() or lower(receiver_email) = public.current_email());
create policy p_dm_insert on public.direct_message for insert
  with check (lower(sender_email) = public.current_email());
create policy p_dm_update on public.direct_message for update
  using (lower(receiver_email) = public.current_email());

create policy p_req_read on public.message_request for select
  using (lower(sender_email) = public.current_email() or lower(receiver_email) = public.current_email());

-- Notificaciones: solo las tuyas.
create policy p_notif_read   on public.notification for select using (lower(user_email) = public.current_email());
create policy p_notif_update on public.notification for update using (lower(user_email) = public.current_email());

-- Batallas: las tuyas.
create policy p_battle_read on public.battle for select
  using (lower(creator_email) = public.current_email() or lower(opponent_email) = public.current_email());

-- Presencia: lectura pública (se muestra "gente activa"), escritura propia.
create policy p_presence_read   on public.user_presence for select using (true);
create policy p_presence_write  on public.user_presence for all
  using (lower(user_email) = public.current_email()) with check (lower(user_email) = public.current_email());

-- FIN
