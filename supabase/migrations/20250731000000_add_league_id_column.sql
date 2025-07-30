-- Add league_id column to leagues table
ALTER TABLE public.leagues
ADD COLUMN league_id TEXT;

-- Add comment to explain the purpose
COMMENT ON COLUMN public.leagues.league_id IS 'The ID of the selected football league (e.g., ENGLAND, SPAIN, etc.)'; 