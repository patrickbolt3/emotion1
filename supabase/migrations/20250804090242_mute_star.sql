/*
  # Add email field to profiles table

  1. Schema Changes
    - Add `email` column to `profiles` table
    - Set default value to empty string
    - Make it not nullable after adding default

  2. Data Migration
    - Update existing profiles with email from auth.users table
    - Ensure all profiles have email addresses

  3. Security
    - No RLS changes needed as profiles table already has proper policies
*/

-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text DEFAULT '';

-- Update existing profiles with email from auth.users
UPDATE profiles 
SET email = auth_users.email
FROM auth.users auth_users
WHERE profiles.id = auth_users.id
AND profiles.email = '';

-- Make email not nullable after populating existing records
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;