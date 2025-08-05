/*
  # Fix RLS permissions for profiles table

  1. Security Changes
    - Drop problematic policy that references non-existent users table
    - Create simple, working policies for profiles table access
    - Ensure authenticated users can access their own profile data
    - Allow service role full access for system operations

  2. Policy Details
    - Users can view and manage their own profile
    - Service role has full access for backend operations
    - Remove any references to users table that was causing permission errors
*/

-- Drop the problematic policy that references users table
DROP POLICY IF EXISTS "Users can view profiles based on role hierarchy" ON profiles;

-- Create a simple policy for users to access their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role needs full access for system operations
CREATE POLICY "Service role full access"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to insert profiles (for registration)
CREATE POLICY "Allow profile creation during registration"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Authenticated users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);