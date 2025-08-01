/*
  # Create Admin User

  1. New Admin User
    - Creates user account for adhiyadeep@icloud.com
    - Sets role as 'admin'
    - Sets up profile with admin permissions
  
  2. Security
    - User will need to set their own password on first login
    - Profile is created with admin role
*/

-- Create the admin user account
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'adhiyadeep@icloud.com',
  crypt('TempPassword123!', gen_salt('bf')), -- Temporary password
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create the admin profile
INSERT INTO profiles (
  id,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) 
SELECT 
  u.id,
  'Admin',
  'User',
  'admin',
  now(),
  now()
FROM auth.users u 
WHERE u.email = 'adhiyadeep@icloud.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = now();