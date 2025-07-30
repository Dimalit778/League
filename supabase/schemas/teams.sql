-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id INTEGER NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  tla TEXT,
  crest_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teams are viewable by everyone."
  ON public.teams
  FOR SELECT
  USING (true); 