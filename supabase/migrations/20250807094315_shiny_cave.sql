/*
  # Allow respondents to read their coach's profile

  1. New Policy
    - Allow respondents to read their assigned coach's profile data
    - This enables clients to see coach's custom CTA settings on results pages
  
  2. Security
    - Only allows reading coach profile if the coach_id matches the requesting user's coach
    - Maintains data privacy while enabling necessary functionality
*/

CREATE POLICY "Respondents can read their coach's profile"
ON public.profiles FOR SELECT
TO authenticated
USING (
  id = (
    SELECT coach_id 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND coach_id IS NOT NULL
  )
);