/*
  # Add 20 Assessment Questions

  1. New Questions
    - 20 professionally crafted questions covering all 14 harmonic states
    - Questions designed for emotional dynamics assessment
    - Distributed across the harmonic spectrum from Apathy to Pure Awareness
    - Each question targets specific emotional patterns and behaviors

  2. Question Distribution
    - Covers all major harmonic states with multiple questions for key states
    - Balanced representation across the emotional spectrum
    - Questions suitable for coaching and personal development contexts
*/

-- Insert 20 assessment questions covering all harmonic states
INSERT INTO questions (question_text, harmonic_state, "order") VALUES

-- Apathy Questions (1-2)
('I often feel disconnected from my emotions and find it difficult to care about outcomes.', 
 (SELECT id FROM harmonic_states WHERE name = 'Apathy'), 1),

('Most days I feel like nothing I do really matters or makes a difference.', 
 (SELECT id FROM harmonic_states WHERE name = 'Apathy'), 2),

-- Grief Questions (3-4)
('I frequently experience a sense of loss or sadness that feels difficult to overcome.', 
 (SELECT id FROM harmonic_states WHERE name = 'Grief'), 3),

('I find myself dwelling on past disappointments or things that didn''t work out.', 
 (SELECT id FROM harmonic_states WHERE name = 'Grief'), 4),

-- Fear Questions (5-6)
('I worry about potential problems even when things are going well in my life.', 
 (SELECT id FROM harmonic_states WHERE name = 'Fear'), 5),

('I often hesitate to take action because I''m concerned about what might go wrong.', 
 (SELECT id FROM harmonic_states WHERE name = 'Fear'), 6),

-- Covert Resistance Questions (7-8)
('I say yes when I mean no and often resent it later.', 
 (SELECT id FROM harmonic_states WHERE name = 'Covert Resistance'), 7),

('I sometimes use sarcasm or indirect comments when I''m frustrated with someone.', 
 (SELECT id FROM harmonic_states WHERE name = 'Covert Resistance'), 8),

-- Anger Questions (9-10)
('When my boundaries are crossed, I feel compelled to defend myself strongly.', 
 (SELECT id FROM harmonic_states WHERE name = 'Anger'), 9),

('I get frustrated when people don''t meet my expectations or standards.', 
 (SELECT id FROM harmonic_states WHERE name = 'Anger'), 10),

-- Antagonism Question (11)
('I find myself arguing or disagreeing with others more often than I''d like.', 
 (SELECT id FROM harmonic_states WHERE name = 'Antagonism'), 11),

-- Boredom Question (12)
('I often feel restless and struggle to find things that genuinely interest me.', 
 (SELECT id FROM harmonic_states WHERE name = 'Boredom'), 12),

-- Willingness Questions (13-14)
('I am open to new possibilities and willing to adapt when circumstances change.', 
 (SELECT id FROM harmonic_states WHERE name = 'Willingness'), 13),

('I approach challenges with curiosity rather than resistance.', 
 (SELECT id FROM harmonic_states WHERE name = 'Willingness'), 14),

-- Stability Question (15)
('I maintain my composure and balance even during stressful situations.', 
 (SELECT id FROM harmonic_states WHERE name = 'Stability'), 15),

-- Enthusiasm Question (16)
('I feel energized by challenges and excited about future opportunities.', 
 (SELECT id FROM harmonic_states WHERE name = 'Enthusiasm'), 16),

-- Exhilaration Question (17)
('I experience moments of pure joy and aliveness that inspire my actions.', 
 (SELECT id FROM harmonic_states WHERE name = 'Exhilaration'), 17),

-- Action Question (18)
('I take decisive action toward my goals without excessive hesitation.', 
 (SELECT id FROM harmonic_states WHERE name = 'Action'), 18),

-- Creative Power Question (19)
('I can generate new ideas and solutions that others haven''t considered.', 
 (SELECT id FROM harmonic_states WHERE name = 'Creative Power'), 19),

-- Pure Awareness Question (20)
('I observe my thoughts and emotions without being overwhelmed by them.', 
 (SELECT id FROM harmonic_states WHERE name = 'Pure Awareness'), 20);