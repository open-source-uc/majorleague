-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (references auth.users)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role int8,
  username text UNIQUE,
  avatar_url text,
  first_name text,
  last_name text,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create competitions table
CREATE TABLE public.competitions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  year int NOT NULL,
  semester text,
  start_date date,
  end_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  major text,
  captain_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  nickname text,
  age int,
  position text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create team_competitions junction table
CREATE TABLE public.team_competitions (
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE,
  points int DEFAULT 0,
  position int,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (team_id, competition_id)
);

-- Create streams table
CREATE TABLE public.streams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  type text NOT NULL,
  platform text,
  url text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  local_team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  visitor_team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  stream_id uuid REFERENCES public.streams(id) ON DELETE SET NULL,
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE,
  date date,
  match_time timestamp with time zone,
  location text,
  local_score int DEFAULT 0,
  visitor_score int DEFAULT 0,
  status text DEFAULT 'scheduled',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT different_teams CHECK (local_team_id != visitor_team_id)
);

-- Update streams table to reference matches (circular reference handled)
ALTER TABLE public.streams 
ADD COLUMN match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE;

-- Create lineups table
CREATE TABLE public.lineups (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE,
  date timestamp with time zone DEFAULT now(),
  matrix jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  type text NOT NULL,
  minute int,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create event_players junction table
CREATE TABLE public.event_players (
  event_id bigint REFERENCES public.events(id) ON DELETE CASCADE,
  player_id bigint REFERENCES public.players(id) ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (event_id, player_id, role)
);

-- Create join_team_requests table
CREATE TABLE public.join_team_requests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  date timestamp with time zone DEFAULT now(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  age int,
  preferred_position text,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user_favorite_teams table
CREATE TABLE public.user_favorite_teams (
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  favorited_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (profile_id, team_id)
);

-- Create user_favorite_matches table
CREATE TABLE public.user_favorite_matches (
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE,
  favorited_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (profile_id, match_id)
);

-- Create preferences table
CREATE TABLE public.preferences (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type text NOT NULL,
  channel text NOT NULL,
  lead_time_minutes int NOT NULL DEFAULT 15,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE,
  preference_id bigint REFERENCES public.preferences(id) ON DELETE SET NULL,
  sent_at timestamp with time zone,
  is_enabled boolean DEFAULT true,
  status text DEFAULT 'pending',
  delivery_info jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_players_team_id ON public.players(team_id);
CREATE INDEX idx_players_profile_id ON public.players(profile_id);
CREATE INDEX idx_matches_date ON public.matches(date);
CREATE INDEX idx_matches_local_team ON public.matches(local_team_id);
CREATE INDEX idx_matches_visitor_team ON public.matches(visitor_team_id);
CREATE INDEX idx_matches_competition ON public.matches(competition_id);
CREATE INDEX idx_events_match_id ON public.events(match_id);
CREATE INDEX idx_events_team_id ON public.events(team_id);
CREATE INDEX idx_notifications_profile_id ON public.notifications(profile_id);
CREATE INDEX idx_notifications_match_id ON public.notifications(match_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_team_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (these can be customized based on your needs)

-- Profiles: Users can see all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams: Everyone can view teams
CREATE POLICY "Teams are viewable by everyone" ON public.teams
  FOR SELECT USING (true);

-- Players: Everyone can view players
CREATE POLICY "Players are viewable by everyone" ON public.players
  FOR SELECT USING (true);

-- Competitions: Everyone can view competitions
CREATE POLICY "Competitions are viewable by everyone" ON public.competitions
  FOR SELECT USING (true);

-- Matches: Everyone can view matches
CREATE POLICY "Matches are viewable by everyone" ON public.matches
  FOR SELECT USING (true);

-- Events: Everyone can view events
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);

-- User favorites: Users can only manage their own favorites
CREATE POLICY "Users can manage own favorite teams" ON public.user_favorite_teams
  FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage own favorite matches" ON public.user_favorite_matches
  FOR ALL USING (auth.uid() = profile_id);

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can see own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = profile_id);

-- Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  PERFORM set_config('search_path', 'public', false);
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
