/*
  # Add 20 Assessment Questions

  1. New Questions
    - Creates 20 assessment questions across all harmonic states
    - Uses a simple approach without subqueries
    - Maps questions to harmonic states by name matching

  2. Approach
    - First creates a temporary mapping of state names to IDs
    - Then inserts questions using the mapped IDs
    - Avoids subquery issues entirely
*/

-- Create a temporary function to get harmonic state ID by name
CREATE OR REPLACE FUNCTION get_harmonic_state_id(state_name TEXT)
RETURNS UUID AS $$
DECLARE
    state_id UUID;
BEGIN
    SELECT id INTO state_id 
    FROM harmonic_states 
    WHERE name = state_name 
    LIMIT 1;
    
    RETURN state_id;
END;
$$ LANGUAGE plpgsql;

-- Insert questions using the function
INSERT INTO questions (question_text, harmonic_state, "order") VALUES
('I often feel disconnected from my emotions and find it difficult to care about outcomes', get_harmonic_state_id('Apathy'), 1),
('I have little motivation to engage with activities or people around me', get_harmonic_state_id('Apathy'), 2),
('I frequently experience a sense of loss or sadness that feels difficult to overcome', get_harmonic_state_id('Grief'), 3),
('I find myself dwelling on past events or relationships that have ended', get_harmonic_state_id('Grief'), 4),
('I worry about potential problems even when things are going well in my life', get_harmonic_state_id('Fear'), 5),
('I hesitate to make decisions because I am concerned about negative consequences', get_harmonic_state_id('Fear'), 6),
('I say yes when I mean no and often resent it later', get_harmonic_state_id('Covert Resistance'), 7),
('I use sarcasm or indirect communication when I disagree with someone', get_harmonic_state_id('Covert Resistance'), 8),
('When my boundaries are crossed, I feel compelled to defend myself strongly', get_harmonic_state_id('Anger'), 9),
('I become frustrated when things do not go according to my expectations', get_harmonic_state_id('Anger'), 10),
('I find myself arguing or disagreeing with others more often than I would like', get_harmonic_state_id('Antagonism'), 11),
('I often feel restless and struggle to find things that genuinely interest me', get_harmonic_state_id('Boredom'), 12),
('I am open to new possibilities and willing to adapt when circumstances change', get_harmonic_state_id('Willingness'), 13),
('I approach challenges with a flexible mindset and curiosity', get_harmonic_state_id('Willingness'), 14),
('I maintain my composure and balance even during stressful situations', get_harmonic_state_id('Stability'), 15),
('I feel energized by challenges and excited about future opportunities', get_harmonic_state_id('Enthusiasm'), 16),
('I experience moments of pure joy and aliveness in my daily activities', get_harmonic_state_id('Exhilaration'), 17),
('I take decisive action toward my goals without excessive hesitation', get_harmonic_state_id('Action'), 18),
('I can generate new ideas and solutions that others have not considered', get_harmonic_state_id('Creative Power'), 19),
('I observe my thoughts and emotions without being overwhelmed by them', get_harmonic_state_id('Pure Awareness'), 20);

-- Clean up the temporary function
DROP FUNCTION get_harmonic_state_id(TEXT);