-- Add primary_league_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN primary_league_id UUID NULL;

-- Add foreign key constraint
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_primary_league_id_fkey 
FOREIGN KEY (primary_league_id) 
REFERENCES public.leagues(id) 
ON DELETE SET NULL;

-- Add comment to explain the purpose
COMMENT ON COLUMN public.profiles.primary_league_id IS 'The ID of the user''s primary league'; 