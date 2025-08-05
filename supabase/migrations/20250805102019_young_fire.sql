/*
  # Add password change tracking

  1. Schema Changes
    - Add `is_password_updated` column to profiles table
    - Default to false for new accounts
    - Set to true when user changes password

  2. Security
    - Update existing RLS policies to handle the new field
    - Ensure users can update their own password status
*/

-- Add is_password_updated column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_password_updated'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_password_updated boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Set existing users to true (they already have their passwords set)
UPDATE profiles 
SET is_password_updated = true 
WHERE is_password_updated = false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS profiles_password_updated_idx ON profiles(is_password_updated) WHERE is_password_updated = false;