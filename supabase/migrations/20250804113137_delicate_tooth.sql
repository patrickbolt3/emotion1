/*
  # Generate assessment codes for existing coaches

  1. Updates
    - Generate unique assessment codes for all existing coaches who don't have one
    - Uses a function to ensure uniqueness across all generated codes

  2. Security
    - Only affects coaches (role = 'coach')
    - Maintains existing RLS policies
*/

-- Function to generate a random 6-character alphanumeric code
CREATE OR REPLACE FUNCTION generate_assessment_code() RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing coaches to have unique assessment codes
DO $$
DECLARE
    coach_record RECORD;
    new_code TEXT;
    code_exists BOOLEAN;
    attempts INTEGER;
BEGIN
    -- Loop through all coaches without assessment codes
    FOR coach_record IN 
        SELECT id FROM profiles 
        WHERE role = 'coach' AND assessment_code IS NULL
    LOOP
        attempts := 0;
        
        -- Generate a unique code for this coach
        LOOP
            new_code := generate_assessment_code();
            
            -- Check if this code already exists
            SELECT EXISTS(
                SELECT 1 FROM profiles 
                WHERE assessment_code = new_code AND role = 'coach'
            ) INTO code_exists;
            
            -- If code is unique or we've tried too many times, break
            IF NOT code_exists OR attempts >= 50 THEN
                EXIT;
            END IF;
            
            attempts := attempts + 1;
        END LOOP;
        
        -- Update the coach with the new code
        IF NOT code_exists THEN
            UPDATE profiles 
            SET assessment_code = new_code 
            WHERE id = coach_record.id;
        END IF;
    END LOOP;
END $$;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS generate_assessment_code();