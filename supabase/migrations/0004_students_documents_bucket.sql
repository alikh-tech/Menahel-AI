-- Creates the "students-documents" storage bucket, which holds the real
-- academic document templates served by the Documents Center
-- (אישור לימודים, גיליון ציונים, כרטיס נבחן, מערכת שעות, בקשה למועד מיוחד).
--
-- These files are shared, non-user-specific templates served via public
-- object URLs (no signed URLs required).

insert into storage.buckets (id, name, public)
values ('students-documents', 'students-documents', true)
on conflict (id) do update set public = true;

drop policy if exists "academic_documents_storage_select_shared" on storage.objects;

create policy "students_documents_storage_select_public" on storage.objects
  for select using (bucket_id = 'students-documents');
