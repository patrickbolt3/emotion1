/*
  # Fix RLS Policy for Respondents Reading Coach Profiles

  This migration fixes the infinite recursion issue in the RLS policy by:
  1. Dropping the problematic policy that caused recursion
  2. Creating a new policy that uses a direct relationship check without recursion
  
  The new policy allows respondents to read coach profiles by checking if the
  coach's ID matches the coach_id in the requesting user's profile, but uses
  a more efficient approach that avoids querying the profiles table recursively.
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Respondents can read their coach's profile" ON public.profiles;

-- Create a new policy that avoids recursion by using a function
-- First, create a helper function that safely checks if a user is a coach of the requesting user
CREATE OR REPLACE FUNCTION public.is_users_coach(coach_profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND coach_id = coach_profile_id
  );
$$;

-- Create the new policy using the helper function
CREATE POLICY "Respondents can read their coach profile"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_users_coach(id));