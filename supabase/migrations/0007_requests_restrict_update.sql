-- Security fix: students must not be able to change the status of their own
-- administrative requests (which would let them self-approve/self-reject
-- and trigger fake notifications). Replace the single "all" policy with
-- separate select/insert/delete policies for the owner; status changes are
-- expected to be performed by staff via the service role (which bypasses RLS).

drop policy if exists "requests_all_own" on public.requests;

create policy "requests_select_own" on public.requests
  for select using (auth.uid() = user_id);

create policy "requests_insert_own" on public.requests
  for insert with check (auth.uid() = user_id);

create policy "requests_delete_own" on public.requests
  for delete using (auth.uid() = user_id);
