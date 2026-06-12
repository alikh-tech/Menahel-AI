-- Smart Notifications Center: persisted, per-user notifications generated
-- automatically from academic/financial/document state. `channel` is
-- future-ready for email/whatsapp/push dispatch; only 'in_app' is used today.

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
