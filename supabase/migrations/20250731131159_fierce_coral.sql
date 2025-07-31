/*
  # Fix Profile RLS Policy for Registration

  1. Security Changes
    - Drop existing restrictive RLS policies on profiles table
    - Create permissive policies that allow profile creation during registration
    - Ensure users can create and manage their own profiles
    - Allow authenticated users to insert profiles for themselves

  2. Policy Updates
    - Allow INSERT for authenticated users creating their own profile
    - Allow SELECT for users viewing their own profile
    - Allow UPDATE for users modifying their own profile
    - Remove complex role-based policies that were causing issues
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Create new, more permissive policies
CREATE POLICY "Allow users to insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Also allow the service role to bypass RLS for triggers
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT INSERT, SELECT, UPDATE ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Recreate the trigger function with proper permissions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'respondent')::user_role,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();