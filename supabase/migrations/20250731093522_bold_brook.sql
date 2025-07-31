/*
  # Fix RLS recursion issue on profiles table

  1. Problem
    - Complex RLS policies on profiles table causing infinite recursion
    - This prevents assessment creation due to foreign key relationships

  2. Solution
    - Drop all existing SELECT policies on profiles table
    - Create a simple policy allowing users to view only their own profile
    - This eliminates recursion while maintaining basic security

  3. Changes
    - Remove complex role-based hierarchy policies
    - Add simple self-access policy
    - Assessment creation should work after this fix
*/

-- Drop all existing SELECT policies on profiles table
DROP POLICY IF EXISTS "Allow authenticated users to view profiles based on role hierar" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can view their clients' profiles" ON public.profiles;

-- Create a simple SELECT policy allowing users to view only their own profile
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());