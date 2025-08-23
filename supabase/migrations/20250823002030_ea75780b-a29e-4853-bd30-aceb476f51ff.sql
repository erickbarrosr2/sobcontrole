-- Fix the function to properly set search_path and make it more secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, monthly_income)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''), 
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    0
  );
  RETURN NEW;
END;
$$;