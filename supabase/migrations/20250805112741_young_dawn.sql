/*
  # Fix coach access to their clients

  1. Policy Updates
    - Allow coaches to view clients where coach_id = auth.uid()
    - Allow coaches to view assessments of their clients
    - Allow coaches to view responses from their clients' assessments
    - Maintain existing admin and partner access

  2. Security
    - Coaches can only see their own clients
    - Coaches can only see assessments/responses from their clients
    - No access to other coaches' data
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Coaches can view their clients" ON profiles;
DROP POLICY IF EXISTS "Coaches can view client assessments" ON assessments;
DROP POLICY IF EXISTS "Coaches can view client responses" ON responses;

-- Allow coaches to view their clients (respondents where coach_id = auth.uid())
CREATE POLICY "Coaches can view their clients"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    role = 'respondent' AND coach_id = auth.uid()
  );

-- Allow coaches to view assessments from their clients
CREATE POLICY "Coaches can view client assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = assessments.user_id
      AND profiles.coach_id = auth.uid()
      AND profiles.role = 'respondent'
    )
  );

-- Allow coaches to view responses from their clients' assessments
CREATE POLICY "Coaches can view client responses"
  ON responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      JOIN profiles ON profiles.id = assessments.user_id
      WHERE assessments.id = responses.assessment_id
      AND profiles.coach_id = auth.uid()
      AND profiles.role = 'respondent'
    )
  );

-- Allow coaches to insert assessments for their clients
CREATE POLICY "Coaches can create assessments for clients"
  ON assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = assessments.user_id
      AND profiles.coach_id = auth.uid()
      AND profiles.role = 'respondent'
    )
  );

-- Allow coaches to update assessments for their clients
CREATE POLICY "Coaches can update client assessments"
  ON assessments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = assessments.user_id
      AND profiles.coach_id = auth.uid()
      AND profiles.role = 'respondent'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = assessments.user_id
      AND profiles.coach_id = auth.uid()
      AND profiles.role = 'respondent'
    )
  );