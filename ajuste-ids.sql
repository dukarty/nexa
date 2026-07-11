-- ============================================================================
-- AJUSTE 1 · Los id de Base44 NO son UUID (son cadenas de 24 hex, estilo Mongo).
-- Además `challenge_id` a veces vale 'week-28': retos VIRTUALES del WEEKLY_SEED
-- que no existen como fila. Si forzáramos uuid/FK, romperíamos la app.
-- Solución fiel: id de tipo TEXT, conservando los identificadores originales.
-- ============================================================================
alter table public.app_metric alter column id drop default;
alter table public.app_metric alter column id type text using id::text;
alter table public.app_metric alter column id set default gen_random_uuid()::text;
alter table public.battle alter column id drop default;
alter table public.battle alter column id type text using id::text;
alter table public.battle alter column id set default gen_random_uuid()::text;
alter table public.challenge alter column id drop default;
alter table public.challenge alter column id type text using id::text;
alter table public.challenge alter column id set default gen_random_uuid()::text;
alter table public.challenge_participation alter column id drop default;
alter table public.challenge_participation alter column id type text using id::text;
alter table public.challenge_participation alter column id set default gen_random_uuid()::text;
alter table public.comments alter column id drop default;
alter table public.comments alter column id type text using id::text;
alter table public.comments alter column id set default gen_random_uuid()::text;
alter table public.direct_message alter column id drop default;
alter table public.direct_message alter column id type text using id::text;
alter table public.direct_message alter column id set default gen_random_uuid()::text;
alter table public.drops alter column id drop default;
alter table public.drops alter column id type text using id::text;
alter table public.drops alter column id set default gen_random_uuid()::text;
alter table public.follow alter column id drop default;
alter table public.follow alter column id type text using id::text;
alter table public.follow alter column id set default gen_random_uuid()::text;
alter table public.highlight alter column id drop default;
alter table public.highlight alter column id type text using id::text;
alter table public.highlight alter column id set default gen_random_uuid()::text;
alter table public.message_request alter column id drop default;
alter table public.message_request alter column id type text using id::text;
alter table public.message_request alter column id set default gen_random_uuid()::text;
alter table public.notification alter column id drop default;
alter table public.notification alter column id type text using id::text;
alter table public.notification alter column id set default gen_random_uuid()::text;
alter table public.post_like alter column id drop default;
alter table public.post_like alter column id type text using id::text;
alter table public.post_like alter column id set default gen_random_uuid()::text;
alter table public.reaction alter column id drop default;
alter table public.reaction alter column id type text using id::text;
alter table public.reaction alter column id set default gen_random_uuid()::text;
alter table public.story alter column id drop default;
alter table public.story alter column id type text using id::text;
alter table public.story alter column id set default gen_random_uuid()::text;
alter table public.user_presence alter column id drop default;
alter table public.user_presence alter column id type text using id::text;
alter table public.user_presence alter column id set default gen_random_uuid()::text;
alter table public.user_profile alter column id drop default;
alter table public.user_profile alter column id type text using id::text;
alter table public.user_profile alter column id set default gen_random_uuid()::text;
