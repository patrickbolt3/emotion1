/*
  # Add partner role to user_role enum

  1. Schema Changes
    - Add 'partner' value to the existing user_role enum type
    - This allows partners to be created and managed in the system

  2. Security
    - No RLS changes needed as existing policies will handle partner role
    - Partners will have appropriate access based on existing role-based policies

  3. Notes
    - This migration safely adds the new enum value without affecting existing data
    - All existing users with other roles will remain unchanged
*/

-- Add 'partner' to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partner';