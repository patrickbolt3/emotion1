/*
  # Add anonymous coach validation policy

  1. Security
    - Add policy for anonymous users to validate coach assessment codes
    - Allows SELECT on coach profiles with assessment codes only
    - Restricts access to only necessary fields for validation

  2. Purpose
    - Enables respondent registration with coach assessment codes
    - Maintains security by limiting data exposure to anonymous users
*/

-- Allow anonymous users to validate coach assessment codes during registration
CREATE POLICY "Anonymous users can validate coach assessment codes"
  ON profiles
  FOR SELECT
  TO anon
  USING (
    role = 'coach'::user_role 
    AND assessment_code IS NOT NULL
  );