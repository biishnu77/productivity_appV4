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

  


-- Enable RLS for daily_productivity
ALTER TABLE public.daily_productivity ENABLE ROW LEVEL SECURITY;

-- Add policies for daily_productivity
CREATE POLICY "Enable read access for users based on user_name"
  ON public.daily_productivity FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for users based on user_name"
  ON public.daily_productivity FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for users based on user_name"
  ON public.daily_productivity FOR UPDATE
  USING (true);




  -- Diary Entries Table
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  day_number INTEGER NOT NULL,
  lesson_learned TEXT,
  lesson TEXT,
  task_completion INTEGER CHECK (task_completion BETWEEN 0 AND 10),
  focus_level INTEGER CHECK (focus_level BETWEEN 0 AND 10),
  time_management INTEGER CHECK (time_management BETWEEN 0 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 0 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_name, date)
);

-- Daily Habits Table
CREATE TABLE IF NOT EXISTS public.daily_habits (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  diary_entry_id BIGINT REFERENCES public.diary_entries(id),
  habit_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;

-- Diary Entries Policies
CREATE POLICY "Enable read access for diary entries"
  ON public.diary_entries FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for diary entries"
  ON public.diary_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for diary entries"
  ON public.diary_entries FOR UPDATE
  USING (auth.uid()::text = user_name);

-- Daily Habits Policies
CREATE POLICY "Enable read access for daily habits"
  ON public.daily_habits FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for daily habits"
  ON public.daily_habits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for daily habits"
  ON public.daily_habits FOR UPDATE
  USING (true);