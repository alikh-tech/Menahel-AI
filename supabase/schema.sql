-- =====================================================================
-- מנהל.AI - Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  institution text,
  field_of_study text,
  academic_year integer,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Automatically create a profile row when a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null,
  file_path text not null,
  file_size bigint not null default 0,
  mime_type text not null default 'application/octet-stream',
  status text not null default 'received' check (status in ('received', 'in_review', 'needs_correction', 'approved')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "documents_all_own" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists documents_user_id_idx on public.documents (user_id);

-- ---------------------------------------------------------------------
-- transactions (income / expenses / debts / payments)
-- ---------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  type text not null check (type in ('income', 'expense', 'debt', 'payment')),
  status text not null default 'completed' check (status in ('completed', 'pending', 'scheduled')),
  due_date date,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "transactions_all_own" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists transactions_user_id_idx on public.transactions (user_id);

-- ---------------------------------------------------------------------
-- reminders
-- ---------------------------------------------------------------------
create table if not exists public.reminders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  due_date date not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.reminders enable row level security;

create policy "reminders_all_own" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists reminders_user_id_idx on public.reminders (user_id);

-- ---------------------------------------------------------------------
-- ai_messages
-- ---------------------------------------------------------------------
create table if not exists public.ai_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id text not null default 'default',
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.ai_messages enable row level security;

create policy "ai_messages_all_own" on public.ai_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists ai_messages_user_conversation_idx
  on public.ai_messages (user_id, conversation_id, created_at);

-- ---------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------
-- Persisted, per-user smart notifications generated automatically from
-- academic/financial/document state. `channel` is future-ready for
-- email/whatsapp/push dispatch; only 'in_app' is used today.
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_key text not null,
  title text not null,
  description text,
  icon text not null default 'Bell',
  severity text not null default 'info' check (severity in ('critical', 'warning', 'info')),
  channel text not null default 'in_app' check (channel in ('in_app', 'email', 'whatsapp', 'push')),
  href text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, source_key)
);

alter table public.notifications enable row level security;

create policy "notifications_all_own" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_user_unread_idx on public.notifications (user_id, is_read);

-- ---------------------------------------------------------------------
-- requests
-- ---------------------------------------------------------------------
-- Administrative requests (special exam, grade appeal, scholarship,
-- inquiry) with a 5-state workflow. Status changes automatically create
-- entries in the notifications table via triggers.
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

-- Students can read, create, and delete their own requests, but cannot
-- update them (status changes are made by staff via the service role,
-- which bypasses RLS) - prevents self-approval/self-rejection.
create policy "requests_select_own" on public.requests
  for select using (auth.uid() = user_id);

create policy "requests_insert_own" on public.requests
  for insert with check (auth.uid() = user_id);

create policy "requests_delete_own" on public.requests
  for delete using (auth.uid() = user_id);

create index if not exists requests_user_id_idx on public.requests (user_id);
create index if not exists requests_user_status_idx on public.requests (user_id, status);

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

-- ---------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('students-documents', 'students-documents', true)
on conflict (id) do nothing;

-- Documents bucket: users can manage files inside a folder named after their user id.
create policy "documents_storage_select_own" on storage.objects
  for select using (
    bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "documents_storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "documents_storage_delete_own" on storage.objects
  for delete using (
    bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Students-documents bucket: shared academic document templates (אישור לימודים,
-- גיליון ציונים, כרטיס נבחן, מערכת שעות, בקשה למועד מיוחד) are public and
-- served via public object URLs.
create policy "students_documents_storage_select_public" on storage.objects
  for select using (bucket_id = 'students-documents');

-- Avatars bucket: public read, owner write.
create policy "avatars_storage_select_all" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_storage_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
