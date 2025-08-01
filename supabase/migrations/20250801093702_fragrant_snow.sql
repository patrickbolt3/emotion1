/*
  # Fix profiles table RLS INSERT policy

  1. Security Changes
    - Drop existing INSERT policies that might be conflicting
    - Create a proper INSERT policy for authenticated users
    - Ensure users can insert their own profile during registration

  This migration specifically addresses the RLS policy violation error
  that occurs when users try to register and create their profile.
*/

-- Drop any existing INSERT policies that might be conflicting
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a clear INSERT policy for authenticated users
CREATE POLICY "Enable insert for authenticated users own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the existing policies are still in place for other operations
-- (keeping the existing ALL policies for completeness)