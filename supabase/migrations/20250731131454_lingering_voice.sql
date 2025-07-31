/*
  # Fix Assessment Creation and Profile Issues

  1. Ensure profiles table has proper foreign key relationship
  2. Fix RLS policies for assessments
  3. Update trigger function to be more robust
  4. Add proper error handling
*/

-- First, let's make sure the profiles table structure is correct
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, first_name, last_name, role, created_at, updated_at)
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
    RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for profiles to be more permissive
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON profiles;

-- Create more permissive policies
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Allow service role to manage all profiles (for triggers)
CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Update RLS policies for assessments
DROP POLICY IF EXISTS "Users can create their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can view their own assessments" ON assessments;

-- Create comprehensive assessment policies
CREATE POLICY "Users can manage their own assessments" ON assessments
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = assessments.user_id 
      AND profiles.coach_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles coach
      JOIN profiles client ON client.coach_id = coach.id
      WHERE coach.trainer_id = auth.uid() 
      AND client.id = assessments.user_id
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON assessments TO authenticated;
GRANT ALL ON responses TO authenticated;
GRANT ALL ON questions TO authenticated;
GRANT ALL ON harmonic_states TO authenticated;

-- Ensure service role has full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;