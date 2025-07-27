-- Check if user_role type already exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('respondent', 'coach', 'trainer', 'admin');
    END IF;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'respondent' NOT NULL,
  coach_id UUID REFERENCES profiles(id),
  trainer_id UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS harmonic_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT NOT NULL,
  coaching_tips TEXT
);

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  question_text TEXT NOT NULL,
  harmonic_state UUID REFERENCES harmonic_states(id) NOT NULL,
  "order" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  dominant_state UUID REFERENCES harmonic_states(id),
  results JSONB
);

CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 7),
  UNIQUE (assessment_id, question_id)
);

-- Enable Row Level Security on all tables if not already enabled
DO $$ 
BEGIN
    EXECUTE 'ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE IF EXISTS harmonic_states ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE IF EXISTS questions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE IF EXISTS assessments ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE IF EXISTS responses ENABLE ROW LEVEL SECURITY';
END $$;

-- Create RLS policies - avoiding duplicates by checking if they exist first

-- Profiles policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile"
          ON profiles FOR SELECT
          TO authenticated
          USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile"
          ON profiles FOR UPDATE
          TO authenticated
          USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Coaches can view their clients'' profiles') THEN
        CREATE POLICY "Coaches can view their clients' profiles"
          ON profiles FOR SELECT
          TO authenticated
          USING (
            -- User is viewing their own profile
            auth.uid() = id
            OR
            -- User is a coach viewing their client
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role IN ('coach', 'trainer', 'admin')
              AND coach_id = profiles.id
            )
            OR
            -- User is a trainer viewing coaches they manage or clients of those coaches
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role IN ('trainer', 'admin')
              AND (trainer_id = profiles.id OR profiles.coach_id IN (
                SELECT id FROM profiles WHERE trainer_id = auth.uid()
              ))
            )
            OR
            -- Admin can view all profiles
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
    END IF;
END $$;

-- Harmonic States policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'harmonic_states' AND policyname = 'Anyone can view harmonic states') THEN
        CREATE POLICY "Anyone can view harmonic states"
          ON harmonic_states FOR SELECT
          TO authenticated
          USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'harmonic_states' AND policyname = 'Admins can manage harmonic states') THEN
        CREATE POLICY "Admins can manage harmonic states"
          ON harmonic_states FOR ALL
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
    END IF;
END $$;

-- Questions policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Anyone can view questions') THEN
        CREATE POLICY "Anyone can view questions"
          ON questions FOR SELECT
          TO authenticated
          USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Admins can manage questions') THEN
        CREATE POLICY "Admins can manage questions"
          ON questions FOR ALL
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
    END IF;
END $$;

-- Assessments policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'Users can view their own assessments') THEN
        CREATE POLICY "Users can view their own assessments"
          ON assessments FOR SELECT
          TO authenticated
          USING (
            -- User is viewing their own assessment
            auth.uid() = user_id
            OR
            -- User is a coach viewing their client's assessment
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = assessments.user_id
              AND profiles.coach_id = auth.uid()
            )
            OR
            -- User is a trainer viewing assessments of clients managed by coaches they supervise
            EXISTS (
              SELECT 1 FROM profiles coach
              JOIN profiles client ON client.coach_id = coach.id
              WHERE coach.trainer_id = auth.uid()
              AND client.id = assessments.user_id
            )
            OR
            -- Admin can view all assessments
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'Users can create their own assessments') THEN
        CREATE POLICY "Users can create their own assessments"
          ON assessments FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'Users can update their own assessments') THEN
        CREATE POLICY "Users can update their own assessments"
          ON assessments FOR UPDATE
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Responses policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'responses' AND policyname = 'Users can view their own responses') THEN
        CREATE POLICY "Users can view their own responses"
          ON responses FOR SELECT
          TO authenticated
          USING (
            -- User is viewing their own responses
            EXISTS (
              SELECT 1 FROM assessments
              WHERE assessments.id = responses.assessment_id
              AND assessments.user_id = auth.uid()
            )
            OR
            -- User is a coach viewing their client's responses
            EXISTS (
              SELECT 1 FROM assessments
              JOIN profiles ON profiles.id = assessments.user_id
              WHERE assessments.id = responses.assessment_id
              AND profiles.coach_id = auth.uid()
            )
            OR
            -- User is a trainer viewing responses of clients managed by coaches they supervise
            EXISTS (
              SELECT 1 FROM assessments
              JOIN profiles client ON client.id = assessments.user_id
              JOIN profiles coach ON coach.id = client.coach_id
              WHERE assessments.id = responses.assessment_id
              AND coach.trainer_id = auth.uid()
            )
            OR
            -- Admin can view all responses
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'responses' AND policyname = 'Users can insert their own responses') THEN
        CREATE POLICY "Users can insert their own responses"
          ON responses FOR INSERT
          TO authenticated
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM assessments
              WHERE assessments.id = responses.assessment_id
              AND assessments.user_id = auth.uid()
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'responses' AND policyname = 'Users can update their own responses') THEN
        CREATE POLICY "Users can update their own responses"
          ON responses FOR UPDATE
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM assessments
              WHERE assessments.id = responses.assessment_id
              AND assessments.user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Create or replace function for handling new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'respondent')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;