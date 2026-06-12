-- Allows authenticated users to read shared academic document templates
-- (אישור לימודים, כרטיס נבחן, גיליון ציונים, מערכת שעות) stored under the
-- "documents/" prefix of the existing "documents" bucket.
--
-- The existing "documents_storage_select_own" policy only allows a user to
-- read files inside a folder named after their own user id, which does not
-- match these shared, non-user-specific files.

create policy "academic_documents_storage_select_shared" on storage.objects
  for select using (
    bucket_id = 'documents' and (storage.foldername(name))[1] = 'documents'
  );
