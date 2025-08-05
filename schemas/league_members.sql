-- Create league_members table
CREATE TABLE IF NOT EXISTS public.league_members (
  league_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (league_id, user_id),
  CONSTRAINT league_members_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE,
  CONSTRAINT league_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "League members are viewable by everyone."
  ON public.league_members
  FOR SELECT
  USING (true);

CREATE POLICY "Users can join leagues."
  ON public.league_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave leagues."
  ON public.league_members
  FOR DELETE
  USING (auth.uid() = user_id); 