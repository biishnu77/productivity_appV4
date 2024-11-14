-- User Preferences Table
create table if not exists public.user_preferences (
  id bigint primary key generated always as identity,
  user_name text not null,
  wake_up_time text not null,  
  sleep_time text, 
  date date not null default current_date,  -- Storing the date to track the wake-up time for each day
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Add Constraint for Time Validation
alter table public.user_preferences
add constraint valid_times check (
  wake_up_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' and
  sleep_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
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

-- Community Posts Table
create table if not exists public.community_posts (
  id bigint primary key generated always as identity,
  user_name text not null,
  content text not null,
  likes integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Users Table for Authentication
create table if not exists public.users (
  id bigint primary key generated always as identity,
  username text unique not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.tasks enable row level security;
alter table public.pomodoro_sessions enable row level security;
alter table public.notes enable row level security;
alter table public.community_posts enable row level security;
alter table public.users enable row level security;

-- Tasks Policies
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

-- Pomodoro Sessions Policies
create policy "Enable read access for all users"
  on public.pomodoro_sessions for select
  using (true);

create policy "Enable insert access for all users"
  on public.pomodoro_sessions for insert
  with check (true);

-- Notes Policies
create policy "Enable read access for all users"
  on public.notes for select
  using (true);

create policy "Enable insert access for all users"
  on public.notes for insert
  with check (true);

create policy "Enable update access for users based on user_name"
  on public.notes for update
  using (true);

-- Community Posts Policies
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

-- Users Policies
create policy "Enable insert access for all users"
  on public.users for insert
  with check (true);

create policy "Enable read access for all users"
  on public.users for select
  using (true);

create policy "Enable update access for users"
  on public.users for update
  using (true);
