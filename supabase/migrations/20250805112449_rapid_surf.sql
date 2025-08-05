/*
  # Fix Partner Access Policies

  1. Policy Updates
    - Allow partners to see coaches they manage (where trainer_id = partner's id)
    - Allow partners to see clients of coaches they manage
    - Allow partners to see assessments and responses of their network

  2. Security
    - Maintain RLS on all tables
    - Ensure partners can only see their own network
    - Preserve admin full access
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Partners can view coaches they manage" ON profiles;
DROP POLICY IF EXISTS "Partners can view clients in their network" ON profiles;
DROP POLICY IF EXISTS "Partners can view network assessments" ON assessments;
DROP POLICY IF EXISTS "Partners can view network responses" ON responses;

-- Create function to check if user is a partner managing a specific coach
CREATE OR REPLACE FUNCTION is_partner_of_coach(coach_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = coach_id 
    AND trainer_id = auth.uid()
    AND role = 'coach'
  );
$$;

-- Create function to check if user is a partner managing a client's coach
CREATE OR REPLACE FUNCTION is_partner_of_client(client_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles client
    JOIN profiles coach ON client.coach_id = coach.id
    WHERE client.id = client_id 
    AND coach.trainer_id = auth.uid()
    AND client.role = 'respondent'
    AND coach.role = 'coach'
  );
$$;

-- Update profiles policies for partners
CREATE POLICY "Partners can view coaches they manage"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    role = 'coach' 
    AND trainer_id = auth.uid()
  );

CREATE POLICY "Partners can view clients in their network"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    role = 'respondent' 
    AND is_partner_of_client(id)
  );

-- Update assessments policies for partners
CREATE POLICY "Partners can view network assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (
    is_partner_of_client(user_id)
  );

-- Update responses policies for partners
CREATE POLICY "Partners can view network responses"
  ON responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM assessments 
      WHERE assessments.id = responses.assessment_id 
      AND is_partner_of_client(assessments.user_id)
    )
  );

-- Update questions policies for partners (read-only access)
CREATE POLICY "Partners can view questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('partner', 'admin')
    )
  );

-- Update harmonic_states policies for partners (read-only access)
CREATE POLICY "Partners can view harmonic states"
  ON harmonic_states
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('partner', 'admin')
    )
  );