-- Create indexes for better query performance

-- Leagues indexes
CREATE INDEX IF NOT EXISTS leagues_join_code_idx ON public.leagues USING btree (join_code);

-- Matches indexes
CREATE INDEX IF NOT EXISTS matches_competition_id_matchday_idx ON public.matches USING btree (competition_id, matchday);
CREATE INDEX IF NOT EXISTS matches_competition_id_utc_date_idx ON public.matches USING btree (competition_id, utc_date);
CREATE INDEX IF NOT EXISTS matches_matchday_idx ON public.matches USING btree (matchday);
CREATE INDEX IF NOT EXISTS matches_utc_date_idx ON public.matches USING btree (utc_date); 