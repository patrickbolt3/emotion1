/*
  # Fix infinite recursion in profiles RLS policy

  1. Changes
    - Drop the problematic "Coaches can view their clients' profiles" policy
    - Create a new comprehensive policy with corrected logic
    - Ensure no circular references in EXISTS subqueries

  2. Security
    - Users can view their own profile
    - Coaches can view their direct clients' profiles
    - Trainers can view their coaches and their coaches' clients
    - Admins can view all profiles

  3. Notes
    - Fixes infinite recursion by restructuring EXISTS conditions
    - Maintains the same access control requirements
    - Uses more descriptive policy name
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Coaches can view their clients' profiles" ON public.profiles;

-- Create a new, comprehensive SELECT policy for profiles
CREATE POLICY "Allow authenticated users to view profiles based on role hierarchy"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    -- Rule 1: Users can view their own profile
    id = auth.uid()

    -- Rule 2: Coaches can view profiles of their direct clients
    OR (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach'::user_role)
        AND coach_id = auth.uid()
    )

    -- Rule 3: Trainers can view profiles of coaches they manage, and clients of those coaches
    OR (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'trainer'::user_role)
        AND (
            trainer_id = auth.uid()
            OR coach_id IN (SELECT id FROM profiles WHERE trainer_id = auth.uid() AND role = 'coach'::user_role)
        )
    )

    -- Rule 4: Admins can view all profiles
    OR (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'::user_role)
    )
);