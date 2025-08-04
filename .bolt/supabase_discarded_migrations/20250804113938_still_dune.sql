/*
  # Add test coach with assessment code UDXYO3

  1. New Data
    - Creates a test coach profile with assessment code 'UDXYO3'
    - Uses a test email and basic profile information
    - Ensures the code is available for respondent registration testing

  2. Security
    - Uses existing RLS policies for profiles table
    - Creates auth user and corresponding profile entry
*/

-- First, create a test auth user for the coach
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Generate a consistent UUID for the test coach
    test_user_id := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid;
    
    -- Check if this coach already exists
    IF NOT EXISTS (
        SELECT 1 FROM auth.users WHERE id = test_user_id
    ) THEN
        -- Insert into auth.users table (this requires service role)
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            aud,
            role
        ) VALUES (
            test_user_id,
            '00000000-0000-0000-0000-000000000000',
            'testcoach@example.com',
            crypt('TestPassword123!', gen_salt('bf')),
            now(),
            now(),
            now(),
            'authenticated',
            'authenticated'
        );
    END IF;
    
    -- Insert or update the profile
    INSERT INTO profiles (
        id,
        first_name,
        last_name,
        email,
        role,
        assessment_code,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        'Test',
        'Coach',
        'testcoach@example.com',
        'coach',
        'UDXYO3',
        now(),
        now()
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        assessment_code = 'UDXYO3',
        role = 'coach',
        updated_at = now();
        
END $$;