
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Saved ocean profiles
create table public.ocean_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  params jsonb not null,
  thumbnail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ocean_profiles enable row level security;
create policy "op_select_own" on public.ocean_profiles for select to authenticated using (auth.uid() = user_id);
create policy "op_insert_own" on public.ocean_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "op_update_own" on public.ocean_profiles for update to authenticated using (auth.uid() = user_id);
create policy "op_delete_own" on public.ocean_profiles for delete to authenticated using (auth.uid() = user_id);

-- Camera presets
create table public.camera_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  config jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.camera_presets enable row level security;
create policy "cp_select_own" on public.camera_presets for select to authenticated using (auth.uid() = user_id);
create policy "cp_insert_own" on public.camera_presets for insert to authenticated with check (auth.uid() = user_id);
create policy "cp_update_own" on public.camera_presets for update to authenticated using (auth.uid() = user_id);
create policy "cp_delete_own" on public.camera_presets for delete to authenticated using (auth.uid() = user_id);

-- Chat conversations
create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.chat_conversations enable row level security;
create policy "cc_select_own" on public.chat_conversations for select to authenticated using (auth.uid() = user_id);
create policy "cc_insert_own" on public.chat_conversations for insert to authenticated with check (auth.uid() = user_id);
create policy "cc_update_own" on public.chat_conversations for update to authenticated using (auth.uid() = user_id);
create policy "cc_delete_own" on public.chat_conversations for delete to authenticated using (auth.uid() = user_id);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system','tool')),
  content text not null default '',
  attachments jsonb,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
create policy "cm_select_own" on public.chat_messages for select to authenticated using (auth.uid() = user_id);
create policy "cm_insert_own" on public.chat_messages for insert to authenticated with check (auth.uid() = user_id);
create policy "cm_delete_own" on public.chat_messages for delete to authenticated using (auth.uid() = user_id);

create index on public.ocean_profiles (user_id, created_at desc);
create index on public.camera_presets (user_id, created_at desc);
create index on public.chat_messages (conversation_id, created_at);
create index on public.chat_conversations (user_id, updated_at desc);
