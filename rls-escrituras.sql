-- ============================================================================
-- RLS · ESCRITURAS DEL CLIENTE
-- En Base44 la app escribía directamente estas entidades (likes, follows,
-- comentarios, highlights, batallas, retos, stories). Para mantener la PARIDAD
-- hay que permitirlo, pero con la regla de oro: cada uno solo escribe LO SUYO.
-- La identidad la pone la BD (current_email()), no el cliente: no se puede
-- falsificar un like o un follow en nombre de otro.
-- ============================================================================

-- LIKES: crear/borrar los propios.
drop policy if exists p_like_insert on public.post_like;
drop policy if exists p_like_delete on public.post_like;
create policy p_like_insert on public.post_like for insert to authenticated
  with check (lower(user_email) = public.current_email());
create policy p_like_delete on public.post_like for delete to authenticated
  using (lower(user_email) = public.current_email());

-- FOLLOWS: seguir y dejar de seguir. Solo en tu nombre.
drop policy if exists p_follow_insert on public.follow;
drop policy if exists p_follow_delete on public.follow;
create policy p_follow_insert on public.follow for insert to authenticated
  with check (lower(follower_email) = public.current_email());
create policy p_follow_delete on public.follow for delete to authenticated
  using (lower(follower_email) = public.current_email());

-- COMENTARIOS: crear los propios, borrar/editar los propios.
drop policy if exists p_comment_insert on public.comments;
drop policy if exists p_comment_delete on public.comments;
create policy p_comment_insert on public.comments for insert to authenticated
  with check (lower(user_email) = public.current_email());
create policy p_comment_delete on public.comments for delete to authenticated
  using (lower(user_email) = public.current_email());

-- REACCIONES
drop policy if exists p_reaction_write on public.reaction;
create policy p_reaction_write on public.reaction for all to authenticated
  using (lower(user_email) = public.current_email())
  with check (lower(user_email) = public.current_email());

-- HIGHLIGHTS (destacados del perfil): los tuyos.
drop policy if exists p_highlight_write on public.highlight;
create policy p_highlight_write on public.highlight for all to authenticated
  using (lower(user_email) = public.current_email())
  with check (lower(user_email) = public.current_email());

-- STORIES: las tuyas.
drop policy if exists p_story_write on public.story;
create policy p_story_write on public.story for all to authenticated
  using (lower(user_email) = public.current_email())
  with check (lower(user_email) = public.current_email());

-- BATALLAS: puedes crear una (siendo tú el creador) y actualizar las tuyas
-- (aceptar/rechazar/subir prueba), seas creador u oponente.
drop policy if exists p_battle_insert on public.battle;
drop policy if exists p_battle_update on public.battle;
create policy p_battle_insert on public.battle for insert to authenticated
  with check (lower(creator_email) = public.current_email());
create policy p_battle_update on public.battle for update to authenticated
  using (lower(creator_email) = public.current_email()
      or lower(opponent_email) = public.current_email());

-- PARTICIPACIONES: borrar la propia (la app lo hace al eliminar un post).
drop policy if exists p_part_delete on public.challenge_participation;
create policy p_part_delete on public.challenge_participation for delete to authenticated
  using (lower(user_email) = public.current_email());

-- RETOS creados por usuarios (pantalla "Crear reto").
drop policy if exists p_challenge_insert on public.challenge;
create policy p_challenge_insert on public.challenge for insert to authenticated
  with check (true);

-- SOLICITUDES DE MENSAJE: la app las lee; crearlas/aceptarlas va por Edge Function.
-- (No se añade escritura directa a propósito.)

-- MENSAJES DIRECTOS: borrar los propios (la app permite borrar conversación).
drop policy if exists p_dm_delete on public.direct_message;
create policy p_dm_delete on public.direct_message for delete to authenticated
  using (lower(sender_email) = public.current_email());

-- NOTIFICACIONES: la app las crea al interactuar (comentar, seguir…).
drop policy if exists p_notif_insert on public.notification;
create policy p_notif_insert on public.notification for insert to authenticated
  with check (true);

-- PERFIL: crear el propio (la app lo hace en el onboarding si no existe).
drop policy if exists p_profile_insert on public.user_profile;
create policy p_profile_insert on public.user_profile for insert to authenticated
  with check (lower(user_email) = public.current_email());
