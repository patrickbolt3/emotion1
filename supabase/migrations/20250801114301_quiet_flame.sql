/*
  # Add Sample Assessment Questions

  1. New Questions
    - Add 10 relevant questions for the Emotional Dynamics Indicator assessment
    - Questions are distributed across different harmonic states
    - Each question is designed to assess emotional patterns and behaviors
    
  2. Question Distribution
    - Questions cover various harmonic states from the emotional spectrum
    - Designed to identify dominant emotional patterns
    - Professional coaching-oriented language
*/

-- Insert sample questions for the Emotional Dynamics Indicator assessment
INSERT INTO questions (question_text, harmonic_state, "order") VALUES
(
  'I often feel disconnected from my emotions and find it difficult to care about outcomes.',
  (SELECT id FROM harmonic_states WHERE name = 'Apathy'),
  1
),
(
  'I frequently experience a sense of loss or sadness that feels difficult to overcome.',
  (SELECT id FROM harmonic_states WHERE name = 'Grief'),
  2
),
(
  'I worry about potential problems even when things are going well in my life.',
  (SELECT id FROM harmonic_states WHERE name = 'Fear'),
  3
),
(
  'I say yes when I mean no and often resent it later.',
  (SELECT id FROM harmonic_states WHERE name = 'Covert Resistance'),
  4
),
(
  'When my boundaries are crossed, I feel compelled to defend myself strongly.',
  (SELECT id FROM harmonic_states WHERE name = 'Anger'),
  5
),
(
  'I find myself arguing or disagreeing with others more often than I''d like.',
  (SELECT id FROM harmonic_states WHERE name = 'Antagonism'),
  6
),
(
  'I often feel restless and struggle to find things that genuinely interest me.',
  (SELECT id FROM harmonic_states WHERE name = 'Boredom'),
  7
),
(
  'I am open to new possibilities and willing to adapt when circumstances change.',
  (SELECT id FROM harmonic_states WHERE name = 'Willingness'),
  8
),
(
  'I feel energized by challenges and excited about future opportunities.',
  (SELECT id FROM harmonic_states WHERE name = 'Enthusiasm'),
  9
),
(
  'I can generate new ideas and solutions that others haven''t considered.',
  (SELECT id FROM harmonic_states WHERE name = 'Creative Power'),
  10
);