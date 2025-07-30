-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id INTEGER NOT NULL PRIMARY KEY,
  competition_id INTEGER NOT NULL,
  home_team_id INTEGER NOT NULL,
  away_team_id INTEGER NOT NULL,
  matchday INTEGER NOT NULL,
  utc_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  stage TEXT,
  group_name TEXT,
  last_updated TIMESTAMPTZ,
  full_time_home_score INTEGER,
  full_time_away_score INTEGER,
  half_time_home_score INTEGER,
  half_time_away_score INTEGER,
  winner TEXT,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT matches_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(id) ON DELETE CASCADE,
  CONSTRAINT matches_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.teams(id) ON DELETE CASCADE,
  CONSTRAINT matches_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.competitions(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Matches are viewable by everyone."
  ON public.matches
  FOR SELECT
  USING (true);
