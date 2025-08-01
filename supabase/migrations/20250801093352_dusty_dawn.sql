/*
  # Fix Registration Errors

  1. RLS Policy Fix
    - Add INSERT policy for profiles table to allow authenticated users to insert their own profile
    - Ensure proper permissions for profile creation during registration

  2. Database Permissions
    - Grant necessary permissions for profile insertion
*/

-- Add INSERT policy for profiles table
CREATE POLICY "Allow authenticated users to insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Ensure the policy is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant INSERT permission to authenticated users
GRANT INSERT ON public.profiles TO authenticated;