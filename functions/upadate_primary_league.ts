
BEGIN
    //-- First, set all user's existing leagues to non-primary
    UPDATE public.league_members 
    SET is_primary_league = FALSE 
    WHERE user_id = p_user_id;

   // -- Then, set the specified league as primary
    UPDATE public.league_members 
    SET is_primary_league = TRUE 
    WHERE user_id = p_user_id 
      AND league_id = p_league_id;
END;
