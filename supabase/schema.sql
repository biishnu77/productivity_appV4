create table if not exists public.user_preferences (
  id bigint primary key generated always as identity,
  user_name text not null,
  wake_up_time text not null,  -- Storing wake-up time as text (e.g. HH:mm)
  date date not null default current_date,  -- Storing the date to track the wake-up time for each day
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(user_name, date)  -- Ensuring each user has only one wake-up time per day
);

-- Tasks Table
create table if not exists public.tasks (
  id bigint primary key generated always as identity,
  user_name text not null,
  description text not null,
  completed boolean default false,
  duration integer not null default 30,
  due_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Pomodoro Sessions Table
create table if not exists public.pomodoro_sessions (
  id bigint primary key generated always as identity,
  user_name text not null,
  task_id bigint references public.tasks(id),
  task_description text,
  duration integer not null,
  completed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Notes Table
create table if not exists public.notes (
  id bigint primary key generated always as identity,
  user_name text not null,
  content text not null,
  type text check (type in ('morning', 'evening')),
  date date not null default current_date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.tasks enable row level security;
alter table public.pomodoro_sessions enable row level security;
alter table public.notes enable row level security;

-- Tasks policies
create policy "Enable read access for all users"
  on public.tasks for select
  using (true);

create policy "Enable insert access for all users"
  on public.tasks for insert
  with check (true);

create policy "Enable update access for users based on user_name"
  on public.tasks for update
  using (true);

create policy "Enable delete access for users based on user_name"
  on public.tasks for delete
  using (true);

-- Pomodoro sessions policies
create policy "Enable read access for all users"
  on public.pomodoro_sessions for select
  using (true);

create policy "Enable insert access for all users"
  on public.pomodoro_sessions for insert
  with check (true);

-- Notes policies
create policy "Enable read access for all users"
  on public.notes for select
  using (true);

create policy "Enable insert access for all users"
  on public.notes for insert
  with check (true);

create policy "Enable update access for users based on user_name"
  on public.notes for update
  using (true);


  -- Community Posts Table
create table if not exists public.community_posts (
  id bigint primary key generated always as identity,
  user_name text not null,
  content text not null,
  likes integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS for community_posts
alter table public.community_posts enable row level security;

-- Community posts policies
create policy "Enable read access for all users"
  on public.community_posts for select
  using (true);

create policy "Enable insert access for all users"
  on public.community_posts for insert
  with check (true);

create policy "Enable update access for users based on user_name"
  on public.community_posts for update
  using (true);

create policy "Enable delete access for users based on user_name"
  on public.community_posts for delete
  using (true);
  
-- Add users table for authentication
create table if not exists public.users (
  id bigint primary key generated always as identity,
  username text unique not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS for users
alter table public.users enable row level security;

-- Users policies
create policy "Enable insert access for all users"
  on public.users for insert
  with check (true);

create policy "Enable read access for all users"
  on public.users for select
  using (true);

-- Add update policy for users
create policy "Enable update access for users"
  on public.users for update
  using (true);