/*
  # Add Role-Based Row Level Security Policies

  1. Security Updates
    - Add RLS policies for coaches to only see their own clients
    - Add RLS policies for partners to only see coaches they manage and their clients
    - Ensure admins can see all data
    - Remove application-level filtering since it's now handled by database

  2. Policies Added
    - Coaches can only view profiles where coach_id = their user id (for respondents)
    - Partners can view coaches where trainer_id = their user id
    - Partners can view respondents through their managed coaches
    - Admins can view all profiles
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users own profile" ON profiles;

-- Create comprehensive RLS policies for profiles table

-- 1. Users can manage their own profile
CREATE POLICY "Users can manage their own profile"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Coaches can view their assigned respondents
CREATE POLICY "Coaches can view their respondents"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles coach_profile
      WHERE coach_profile.id = auth.uid()
      AND coach_profile.role = 'coach'
      AND profiles.coach_id = auth.uid()
      AND profiles.role = 'respondent'
    )
  );

-- 3. Partners can view coaches they manage
CREATE POLICY "Partners can view their coaches"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles partner_profile
      WHERE partner_profile.id = auth.uid()
      AND partner_profile.role = 'partner'
      AND profiles.trainer_id = auth.uid()
      AND profiles.role = 'coach'
    )
  );

-- 4. Partners can view respondents through their managed coaches
CREATE POLICY "Partners can view respondents through coaches"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles partner_profile
      JOIN profiles coach_profile ON coach_profile.trainer_id = partner_profile.id
      WHERE partner_profile.id = auth.uid()
      AND partner_profile.role = 'partner'
      AND coach_profile.role = 'coach'
      AND profiles.coach_id = coach_profile.id
      AND profiles.role = 'respondent'
    )
  );

-- 5. Trainers can view coaches they manage
CREATE POLICY "Trainers can view their coaches"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles trainer_profile
      WHERE trainer_profile.id = auth.uid()
      AND trainer_profile.role = 'trainer'
      AND profiles.trainer_id = auth.uid()
      AND profiles.role = 'coach'
    )
  );

-- 6. Trainers can view respondents through their managed coaches
CREATE POLICY "Trainers can view respondents through coaches"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles trainer_profile
      JOIN profiles coach_profile ON coach_profile.trainer_id = trainer_profile.id
      WHERE trainer_profile.id = auth.uid()
      AND trainer_profile.role = 'trainer'
      AND coach_profile.role = 'coach'
      AND profiles.coach_id = coach_profile.id
      AND profiles.role = 'respondent'
    )
  );

-- 7. Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- 8. Service role can manage all profiles (for edge functions)
CREATE POLICY "Service role can manage all profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 9. Allow authenticated users to insert profiles (for registration)
CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 10. Allow anonymous users to insert profiles (for registration via edge functions)
CREATE POLICY "Enable insert for anonymous users"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);