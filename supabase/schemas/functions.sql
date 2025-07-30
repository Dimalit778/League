-- Function to generate a unique join code for leagues
CREATE OR REPLACE FUNCTION public.generate_league_join_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  generated_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a random 6-digit number as text
    generated_code := lpad(floor(random() * 1000000)::text, 6, '0');

    -- Check if the code already exists in the leagues table
    SELECT EXISTS (SELECT 1 FROM public.leagues WHERE join_code = generated_code) INTO code_exists;

    -- If the code does not exist, exit the loop
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;

  -- Set the new join_code for the inserted row
  NEW.join_code := generated_code;

  -- Return the modified NEW row
  RETURN NEW;
END;
$$;

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email) 
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  RETURN new;
END;
$$;

-- Create trigger for generating join codes
CREATE OR REPLACE TRIGGER set_league_join_code
BEFORE INSERT ON public.leagues
FOR EACH ROW
WHEN (new.join_code IS NULL)
EXECUTE FUNCTION public.generate_league_join_code();

-- Create trigger for handling new users
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user(); 