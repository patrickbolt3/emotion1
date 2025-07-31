/*
  # Fix user profile creation on registration

  1. Database Changes
    - Ensure the handle_new_user trigger function exists and works correctly
    - Make sure the trigger is properly set up on auth.users
    - Add a policy to allow profile creation during registration

  2. Security
    - Allow users to insert their own profile during registration
    - Maintain existing RLS policies for other operations
*/

-- First, let's recreate the handle_new_user function to ensure it works correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'role', 'respondent')::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add an INSERT policy to allow profile creation during registration
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.profiles;

CREATE POLICY "Allow profile creation during registration"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Also add an UPDATE policy to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());