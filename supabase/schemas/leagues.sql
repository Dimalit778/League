-- Create leagues table
CREATE TABLE IF NOT EXISTS public.leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT leagues_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Leagues are viewable by everyone."
  ON public.leagues
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own leagues."
  ON public.leagues
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "League owners can update their leagues."
  ON public.leagues
  FOR UPDATE
  USING (auth.uid() = owner_id); 