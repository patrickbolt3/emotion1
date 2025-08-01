/*
  # Add 20 Assessment Questions for Emotional Dynamics Indicator

  1. New Questions
    - 20 professionally crafted questions covering all 14 harmonic states
    - Questions are behaviorally specific and suitable for coaching contexts
    - Sequential ordering from 1-20
    - Designed for 7-point Likert scale responses

  2. Security
    - Questions will inherit existing RLS policies from questions table
*/

-- Insert 20 assessment questions with explicit harmonic state IDs
INSERT INTO questions (question_text, harmonic_state, "order") VALUES
-- Apathy questions (2)
('I often feel disconnected from my emotions and find it difficult to care about outcomes.', 
 (SELECT id FROM harmonic_states WHERE name = 'Apathy' LIMIT 1), 1),
('I frequently experience a lack of motivation and struggle to engage with daily activities.', 
 (SELECT id FROM harmonic_states WHERE name = 'Apathy' LIMIT 1), 2),

-- Grief questions (2)
('I find myself dwelling on losses or disappointments from my past.', 
 (SELECT id FROM harmonic_states WHERE name = 'Grief' LIMIT 1), 3),
('I often feel a deep sadness that seems difficult to overcome or move beyond.', 
 (SELECT id FROM harmonic_states WHERE name = 'Grief' LIMIT 1), 4),

-- Fear questions (2)
('I worry about potential problems even when things are going well in my life.', 
 (SELECT id FROM harmonic_states WHERE name = 'Fear' LIMIT 1), 5),
('I hesitate to make decisions because I''m concerned about making the wrong choice.', 
 (SELECT id FROM harmonic_states WHERE name = 'Fear' LIMIT 1), 6),

-- Covert Resistance questions (2)
('I say yes when I mean no and often resent it later.', 
 (SELECT id FROM harmonic_states WHERE name = 'Covert Resistance' LIMIT 1), 7),
('I sometimes use sarcasm or indirect comments when I''m frustrated with someone.', 
 (SELECT id FROM harmonic_states WHERE name = 'Covert Resistance' LIMIT 1), 8),

-- Anger questions (2)
('When my boundaries are crossed, I feel compelled to defend myself strongly.', 
 (SELECT id FROM harmonic_states WHERE name = 'Anger' LIMIT 1), 9),
('I become frustrated when things don''t go according to my expectations.', 
 (SELECT id FROM harmonic_states WHERE name = 'Anger' LIMIT 1), 10),

-- Antagonism question (1)
('I find myself arguing or disagreeing with others more often than I''d like.', 
 (SELECT id FROM harmonic_states WHERE name = 'Antagonism' LIMIT 1), 11),

-- Boredom question (1)
('I often feel restless and struggle to find things that genuinely interest me.', 
 (SELECT id FROM harmonic_states WHERE name = 'Boredom' LIMIT 1), 12),

-- Willingness questions (2)
('I am open to new possibilities and willing to adapt when circumstances change.', 
 (SELECT id FROM harmonic_states WHERE name = 'Willingness' LIMIT 1), 13),
('I approach challenges with curiosity rather than resistance.', 
 (SELECT id FROM harmonic_states WHERE name = 'Willingness' LIMIT 1), 14),

-- Stability question (1)
('I maintain my composure and balance even during stressful situations.', 
 (SELECT id FROM harmonic_states WHERE name = 'Stability' LIMIT 1), 15),

-- Enthusiasm question (1)
('I feel energized by challenges and excited about future opportunities.', 
 (SELECT id FROM harmonic_states WHERE name = 'Enthusiasm' LIMIT 1), 16),

-- Exhilaration question (1)
('I experience moments of pure joy and aliveness in my daily life.', 
 (SELECT id FROM harmonic_states WHERE name = 'Exhilaration' LIMIT 1), 17),

-- Action question (1)
('I take decisive action toward my goals without excessive hesitation.', 
 (SELECT id FROM harmonic_states WHERE name = 'Action' LIMIT 1), 18),

-- Creative Power question (1)
('I can generate innovative ideas and solutions that others haven''t considered.', 
 (SELECT id FROM harmonic_states WHERE name = 'Creative Power' LIMIT 1), 19),

-- Pure Awareness question (1)
('I observe my thoughts and emotions without being overwhelmed by them.', 
 (SELECT id FROM harmonic_states WHERE name = 'Pure Awareness' LIMIT 1), 20);