/*
  # Update Harmonic State Colors

  1. Changes
    - Update Willingness color from bright yellow (#FFEE58) to darker gold (#D4AF37)
    - Update Pure Awareness color from white (#FFFFFF) to light gray (#E5E7EB)

  2. Security
    - No RLS changes needed as this only updates existing data
*/

-- Update Willingness color to a darker, more visible gold
UPDATE harmonic_states 
SET color = '#D4AF37' 
WHERE name = 'Willingness';

-- Update Pure Awareness color to a light gray that's visible on white backgrounds
UPDATE harmonic_states 
SET color = '#E5E7EB' 
WHERE name = 'Pure Awareness';