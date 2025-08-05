/*
  # Fix Admin Role-Based Access

  1. Security Updates
    - Remove all existing problematic policies
    - Create new policies that check role from profiles table
    - Grant admin users full access to all tables
    - Maintain security for other roles

  2. Tables Updated
    - profiles: Admin can manage all profiles
    - assessments: Admin can view/manage all assessments  
    - responses: Admin can view/manage all responses
    - questions: Admin can manage all questions
    - harmonic_states: Admin can manage all harmonic states

  3. Policy Structure
    - Simple role-based checks using auth.uid()
    - No recursive queries to avoid infinite loops
    - Clear separation between admin and user permissions
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users have full access" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can view their own responses" ON responses;
DROP POLICY IF EXISTS "Users can insert their own responses" ON responses;
DROP POLICY IF EXISTS "Users can update their own responses" ON responses;
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Anyone can view harmonic states" ON harmonic_states;
DROP POLICY IF EXISTS "Admins can manage harmonic states" ON harmonic_states;

-- Create a simple function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Profiles table policies
CREATE POLICY "Admin full access to profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Assessments table policies
CREATE POLICY "Admin full access to assessments"
  ON assessments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can manage own assessments"
  ON assessments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Responses table policies
CREATE POLICY "Admin full access to responses"
  ON responses
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can manage own responses"
  ON responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = responses.assessment_id 
      AND assessments.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = responses.assessment_id 
      AND assessments.user_id = auth.uid()
    )
  );

-- Questions table policies
CREATE POLICY "Admin full access to questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Harmonic states table policies
CREATE POLICY "Admin full access to harmonic states"
  ON harmonic_states
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view harmonic states"
  ON harmonic_states
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role policies (for edge functions)
CREATE POLICY "Service role full access to profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to assessments"
  ON assessments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to responses"
  ON responses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to questions"
  ON questions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to harmonic states"
  ON harmonic_states
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);