-- Can Predict Round
CREATE OR REPLACE FUNCTION public.can_predict_round(comp_id integer, round_name text, season_year integer)
RETURNS boolean AS
$func$
DECLARE
    round_start_time TIMESTAMPTZ;
BEGIN
    -- Get the earliest match time in the round
    SELECT MIN(date) INTO round_start_time
    FROM public.fixtures
    WHERE competition_id = comp_id 
    AND season = season_year 
    AND round = round_name;
    
    -- Return true if current time is before round start
    RETURN NOW() < COALESCE(round_start_time, NOW() + INTERVAL '1 day');
END;
$func$  LANGUAGE plpgsql;

-- Can Access League
CREATE OR REPLACE FUNCTION public.can_access_league(league_id text)
RETURNS boolean AS
$func$
DECLARE
    league_member_id text;

BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.league_members 
        WHERE user_id = auth.uid() AND league_id = can_access_league.league_id
    );
END;
$func$  LANGUAGE plpgsql;

-- Generate Join Code
CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS text AS
$func$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    -- Generate 6-character code
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    
    -- Ensure uniqueness by checking existing codes
    WHILE EXISTS(SELECT 1 FROM public.leagues WHERE join_code = result) LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$func$  LANGUAGE plpgsql;

-- Get member predictions
CREATE OR REPLACE FUNCTION public.get_member_predictions(p_league_id text)
RETURNS SETOF public.predictions AS
$func$
BEGIN
  RETURN QUERY
  SELECT 
    lm.user_id,
    lm.nickname,
    lm.avatar_url,
    p.fixture_id,
    p.home_score,
    p.away_score,
    p.winner,
    p.points,
    p.is_processed,
    p.created_at,
    p.id AS prediction_id
  FROM 
    public.league_members lm
    JOIN predictions p ON lm.user_id = p.user_id AND lm.league_id = p.league_id
  WHERE 
    lm.league_id = p_league_id
  ORDER BY 
    lm.nickname, p.fixture_id;
END;
$func$  LANGUAGE plpgsql;

-- Check if user in league
CREATE OR REPLACE FUNCTION public.check_user_in_league(uid text, lg text)
RETURNS boolean AS
$func$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.league_members
    WHERE user_id = uid AND league_id::text = lg::text
  );
$func$  LANGUAGE plpgsql;

-- Get league members with points
CREATE OR REPLACE FUNCTION public.get_league_members_with_points(p_league_id text)
RETURNS SETOF public.league_members AS
$func$
BEGIN
  RETURN QUERY
  SELECT 
    lm.user_id,
    lm.nickname,
    lm.avatar_url,
    COALESCE(SUM(p.points), 0)::INTEGER AS total_points,
    COUNT(p.id)::INTEGER AS predictions_count
  FROM 
    league_members lm
    LEFT JOIN predictions p ON lm.user_id = p.user_id AND lm.league_id = p.league_id
  WHERE 
    lm.league_id = p_league_id
  GROUP BY 
    lm.user_id, lm.nickname, lm.avatar_url
  ORDER BY 
    total_points DESC, predictions_count DESC, lm.nickname;
END;
$func$  LANGUAGE plpgsql;

-- Calculate prediction points based on fixture result
CREATE OR REPLACE FUNCTION public.calculate_prediction_points(
    predicted_home_score integer,
    predicted_away_score integer,
    actual_home_score integer,
    actual_away_score integer
)
RETURNS integer AS
$func$
DECLARE
    predicted_result text;
    actual_result text;
BEGIN
    -- Determine predicted result (H = Home win, A = Away win, D = Draw)
    IF predicted_home_score > predicted_away_score THEN
        predicted_result := 'H';
    ELSIF predicted_home_score < predicted_away_score THEN
        predicted_result := 'A';
    ELSE
        predicted_result := 'D';
    END IF;
    
    -- Determine actual result
    IF actual_home_score > actual_away_score THEN
        actual_result := 'H';
    ELSIF actual_home_score < actual_away_score THEN
        actual_result := 'A';
    ELSE
        actual_result := 'D';
    END IF;
    
    -- Calculate points based on accuracy
    -- Exact score match = 3 points
    IF predicted_home_score = actual_home_score AND predicted_away_score = actual_away_score THEN
        RETURN 3;
    -- Correct result prediction = 1 point
    ELSIF predicted_result = actual_result THEN
        RETURN 1;
    -- Wrong prediction = 0 points
    ELSE
        RETURN 0;
    END IF;
END;
$func$ LANGUAGE plpgsql;

-- Trigger function to update prediction points when fixture is finished
CREATE OR REPLACE FUNCTION public.update_prediction_points_on_fixture_finish()
RETURNS TRIGGER AS
$func$
BEGIN
    -- Only process if status changed to 'Match Finished' and scores are available
    IF NEW.status = 'Match Finished' 
       AND OLD.status != 'Match Finished' 
       AND NEW.home_score IS NOT NULL 
       AND NEW.away_score IS NOT NULL THEN
        
        -- Update all predictions for this fixture with calculated points
        UPDATE public.predictions 
        SET 
            points = public.calculate_prediction_points(
                home_score,
                away_score,
                NEW.home_score,
                NEW.away_score
            ),
            is_finished = true,
            updated_at = NOW()
        WHERE 
            fixture_id = NEW.id
            AND is_finished = false; -- Only update unprocessed predictions
            
    END IF;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Create trigger on fixtures table
DROP TRIGGER IF EXISTS trigger_update_prediction_points ON public.fixtures;
CREATE TRIGGER trigger_update_prediction_points
    AFTER UPDATE ON public.fixtures
    FOR EACH ROW
    EXECUTE FUNCTION public.update_prediction_points_on_fixture_finish();

-- Manual function to process predictions for finished fixtures
-- This can be used to backfill predictions that might have been missed
CREATE OR REPLACE FUNCTION public.process_finished_fixture_predictions(fixture_id_param integer)
RETURNS integer AS
$func$
DECLARE
    fixture_record RECORD;
    updated_count integer := 0;
BEGIN
    -- Get the fixture details
    SELECT * INTO fixture_record 
    FROM public.fixtures 
    WHERE id = fixture_id_param;
    
    -- Check if fixture exists and is finished with scores
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Fixture with ID % not found', fixture_id_param;
    END IF;
    
    IF fixture_record.status != 'Match Finished' THEN
        RAISE EXCEPTION 'Fixture % is not finished (status: %)', fixture_id_param, fixture_record.status;
    END IF;
    
    IF fixture_record.home_score IS NULL OR fixture_record.away_score IS NULL THEN
        RAISE EXCEPTION 'Fixture % is finished but missing scores', fixture_id_param;
    END IF;
    
    -- Update all predictions for this fixture
    UPDATE public.predictions 
    SET 
        points = public.calculate_prediction_points(
            home_score,
            away_score,
            fixture_record.home_score,
            fixture_record.away_score
        ),
        is_finished = true,
        updated_at = NOW()
    WHERE 
        fixture_id = fixture_id_param
        AND is_finished = false; -- Only update unprocessed predictions
        
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$func$ LANGUAGE plpgsql;

-- Function to process all unprocessed finished fixtures
CREATE OR REPLACE FUNCTION public.process_all_finished_fixture_predictions()
RETURNS integer AS
$func$
DECLARE
    fixture_record RECORD;
    total_updated integer := 0;
    fixture_updated integer;
BEGIN
    -- Get all finished fixtures with scores that have unprocessed predictions
    FOR fixture_record IN 
        SELECT DISTINCT f.id
        FROM public.fixtures f
        INNER JOIN public.predictions p ON f.id = p.fixture_id
        WHERE f.status = 'Match Finished'
          AND f.home_score IS NOT NULL
          AND f.away_score IS NOT NULL
          AND p.is_finished = false
    LOOP
        -- Process predictions for this fixture
        SELECT public.process_finished_fixture_predictions(fixture_record.id) INTO fixture_updated;
        total_updated := total_updated + fixture_updated;
    END LOOP;
    
    RETURN total_updated;
END;
$func$ LANGUAGE plpgsql;