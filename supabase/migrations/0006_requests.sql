-- Administrative Requests module: special exam requests, grade appeals,
-- scholarship requests, and general administrative inquiries, with a
-- 5-state workflow (received/in_progress/document_required/approved/rejected).
-- Status changes automatically create entries in the existing
-- notifications table (Phase 4) via triggers.

create table if not exists public.requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('special_exam', 'grade_appeal', 'scholarship', 'inquiry')),
  course text,
  title text not null,
  description text not null,
  status text not null default 'received' check (status in ('received', 'in_progress', 'document_required', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.requests enable row level security;

create policy "requests_all_own" on public.requests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists requests_user_id_idx on public.requests (user_id);
create index if not exists requests_user_status_idx on public.requests (user_id, status);

-- Notify the student when a new request is submitted.
create or replace function public.handle_request_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, source_key, title, description, icon, severity, channel, href)
  values (
    new.user_id,
    'request-submitted-' || new.id,
    'הבקשה "' || new.title || '" התקבלה',
    'הבקשה תטופל ותעודכן בהתאם',
    'Inbox',
    'info',
    'in_app',
    '/requests'
  )
  on conflict (user_id, source_key) do nothing;
  return new;
end;
$$;

create trigger requests_after_insert
  after insert on public.requests
  for each row execute function public.handle_request_submitted();

-- Notify the student when a request moves to approved / rejected / document_required.
create or replace function public.handle_request_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  notif_title text;
  notif_description text;
  notif_severity text;
  notif_icon text;
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'approved' then
    notif_title := 'הבקשה "' || new.title || '" אושרה';
    notif_description := 'הבקשה שלך אושרה - לחצו לפרטים';
    notif_severity := 'info';
    notif_icon := 'CheckCircle2';
  elsif new.status = 'rejected' then
    notif_title := 'הבקשה "' || new.title || '" נדחתה';
    notif_description := 'לצפייה בפרטי הבקשה לחצו כאן';
    notif_severity := 'critical';
    notif_icon := 'XCircle';
  elsif new.status = 'document_required' then
    notif_title := 'נדרש מסמך נוסף לבקשה "' || new.title || '"';
    notif_description := 'יש להשלים מסמכים על מנת להמשיך בטיפול בבקשה';
    notif_severity := 'warning';
    notif_icon := 'FileWarning';
  else
    return new;
  end if;

  insert into public.notifications (user_id, source_key, title, description, icon, severity, channel, href)
  values (
    new.user_id,
    'request-status-' || new.id || '-' || new.status,
    notif_title,
    notif_description,
    notif_icon,
    notif_severity,
    'in_app',
    '/requests'
  )
  on conflict (user_id, source_key) do nothing;

  return new;
end;
$$;

create trigger requests_after_status_update
  after update on public.requests
  for each row execute function public.handle_request_status_change();
