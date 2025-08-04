/*
  # Add assessment code to profiles table

  1. New Columns
    - `assessment_code` (text, unique for coaches only)
      - Allows coaches to have a unique code for client registration
      - Only coaches can have assessment codes
      - Codes must be unique across all coaches

  2. Indexes
    - Unique partial index on assessment_code where role = 'coach'

  3. Constraints
    - Check constraint to ensure only coaches have assessment codes
*/

-- Add assessment_code column to profiles table
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS assessment_code TEXT;

-- Create a unique partial index on assessment_code for coaches only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' 
    AND indexname = 'profiles_assessment_code_coach_idx'
  ) THEN
    CREATE UNIQUE INDEX profiles_assessment_code_coach_idx 
    ON public.profiles (assessment_code)
    WHERE role = 'coach' AND assessment_code IS NOT NULL;
  END IF;
END $$;

-- Add check constraint to ensure assessment_code is only set for coaches
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' 
    AND constraint_name = 'assessment_code_only_for_coach'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT assessment_code_only_for_coach
    CHECK (
      (assessment_code IS NULL AND role != 'coach') OR
      (role = 'coach')
    );
  END IF;
END $$;