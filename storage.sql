-- ============================================================================
-- STORAGE · bucket `nexa` (avatares, evidencias de retos, portadas, stories)
-- Público en lectura (como el CDN de Base44: las URLs se comparten en el feed).
-- Escritura solo para usuarios autenticados; cada uno gestiona lo suyo.
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('nexa', 'nexa', true, 15728640)  -- 15 MB por archivo
on conflict (id) do update set public = true, file_size_limit = 15728640;

drop policy if exists nexa_read   on storage.objects;
drop policy if exists nexa_upload on storage.objects;
drop policy if exists nexa_update on storage.objects;
drop policy if exists nexa_delete on storage.objects;

-- Lectura pública: las fotos de las experiencias se ven en el feed.
create policy nexa_read on storage.objects for select
  using (bucket_id = 'nexa');

-- Subida: solo autenticados.
create policy nexa_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'nexa');

-- Modificar/borrar: solo el que lo subió.
create policy nexa_update on storage.objects for update to authenticated
  using (bucket_id = 'nexa' and owner = auth.uid());
create policy nexa_delete on storage.objects for delete to authenticated
  using (bucket_id = 'nexa' and owner = auth.uid());
