-- Migrates documents.status from the old 3-state workflow
-- (pending/verified/rejected) to the new 4-state student-portal
-- workflow (received/in_review/needs_correction/approved).
--
-- Run this against an existing Supabase project that was created
-- with the previous schema.sql. New projects can use schema.sql
-- directly, which already reflects this constraint.

alter table public.documents drop constraint if exists documents_status_check;

update public.documents set status = case status
  when 'pending' then 'received'
  when 'verified' then 'approved'
  when 'rejected' then 'needs_correction'
  else status
end;

alter table public.documents alter column status set default 'received';

alter table public.documents add constraint documents_status_check
  check (status in ('received', 'in_review', 'needs_correction', 'approved'));
