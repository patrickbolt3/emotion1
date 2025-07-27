/*
  # Fix handle_new_user function for user registration

  1. Changes
     - Update the handle_new_user function to correctly access user metadata
     - Fix the data path to properly access first_name, last_name, and role
*/

-- Drop existing trigger first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace the function with updated metadata path
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->'data'->>'first_name',
    new.raw_user_meta_data->'data'->>'last_name',
    COALESCE((new.raw_user_meta_data->'data'->>'role')::user_role, 'respondent')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();