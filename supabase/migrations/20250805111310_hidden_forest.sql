/*
  # Fix Admin Access Permissions

  1. Policy Updates
    - Allow admins to view and manage all profiles
    - Allow admins to view all assessments and responses
    - Maintain security for non-admin users

  2. Security
    - Admins can access everything
    - Other users can only access their own data or data they're authorized to see
    - Service role maintains full access for system operations
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

-- Create comprehensive policies for profiles table
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'adhiyadeep@outlook.com'
    )
    OR
    (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'admin'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'adhiyadeep@outlook.com'
    )
    OR
    (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'admin'
  );

CREATE POLICY "Partners can manage their network"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'partner'
    AND (
      id = auth.uid() -- Own profile
      OR trainer_id = auth.uid() -- Trainers they manage
      OR id IN (
        SELECT coach_id FROM profiles 
        WHERE trainer_id = auth.uid() AND role = 'trainer'
      ) -- Coaches managed by their trainers
      OR coach_id IN (
        SELECT id FROM profiles 
        WHERE trainer_id = auth.uid() AND role = 'coach'
      ) -- Clients of their coaches
    )
  );

CREATE POLICY "Trainers can manage their coaches and clients"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'trainer'
    AND (
      id = auth.uid() -- Own profile
      OR trainer_id = auth.uid() -- Coaches they manage
      OR coach_id IN (
        SELECT id FROM profiles 
        WHERE trainer_id = auth.uid() AND role = 'coach'
      ) -- Clients of their coaches
    )
  );

CREATE POLICY "Coaches can manage their clients"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'coach'
    AND (
      id = auth.uid() -- Own profile
      OR coach_id = auth.uid() -- Their clients
    )
  );

CREATE POLICY "Users can view and update their own profile"
  ON profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Service role full access
CREATE POLICY "Service role full access"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update assessments policies for admin access
DROP POLICY IF EXISTS "Users can manage their own assessments" ON assessments;

CREATE POLICY "Admins can manage all assessments"
  ON assessments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'adhiyadeep@outlook.com'
    )
    OR
    (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'admin'
  );

CREATE POLICY "Users can manage assessments in their network"
  ON assessments
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() -- Own assessments
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = assessments.user_id 
      AND coach_id = auth.uid()
    ) -- Coach viewing client assessments
    OR EXISTS (
      SELECT 1 FROM profiles client
      JOIN profiles coach ON client.coach_id = coach.id
      WHERE client.id = assessments.user_id 
      AND coach.trainer_id = auth.uid()
    ) -- Trainer viewing assessments of their coaches' clients
    OR EXISTS (
      SELECT 1 FROM profiles client
      JOIN profiles coach ON client.coach_id = coach.id
      JOIN profiles trainer ON coach.trainer_id = trainer.id
      WHERE client.id = assessments.user_id 
      AND trainer.trainer_id = auth.uid()
    ) -- Partner viewing assessments in their network
  );

-- Update responses policies for admin access
DROP POLICY IF EXISTS "Users can view their own responses" ON responses;
DROP POLICY IF EXISTS "Users can insert their own responses" ON responses;
DROP POLICY IF EXISTS "Users can update their own responses" ON responses;

CREATE POLICY "Admins can manage all responses"
  ON responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'adhiyadeep@outlook.com'
    )
    OR
    (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'admin'
  );

CREATE POLICY "Users can manage responses in their network"
  ON responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = responses.assessment_id 
      AND assessments.user_id = auth.uid()
    ) -- Own responses
    OR EXISTS (
      SELECT 1 FROM assessments
      JOIN profiles ON profiles.id = assessments.user_id
      WHERE assessments.id = responses.assessment_id 
      AND profiles.coach_id = auth.uid()
    ) -- Coach viewing client responses
    OR EXISTS (
      SELECT 1 FROM assessments
      JOIN profiles client ON client.id = assessments.user_id
      JOIN profiles coach ON client.coach_id = coach.id
      WHERE assessments.id = responses.assessment_id 
      AND coach.trainer_id = auth.uid()
    ) -- Trainer viewing responses
  );