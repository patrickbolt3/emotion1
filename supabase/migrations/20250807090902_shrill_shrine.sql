/*
  # Add custom CTA fields for coaches

  1. New Columns
    - `custom_cta_label` (text, nullable) - Custom button text for coaches
    - `custom_cta_url` (text, nullable) - Custom URL for coaches

  2. Purpose
    - Allow coaches to customize the call-to-action button on client results pages
    - Enable coaches to direct clients to their booking systems, websites, etc.
*/

-- Add custom CTA columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_cta_label TEXT,
ADD COLUMN IF NOT EXISTS custom_cta_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.custom_cta_label IS 'Custom call-to-action button label for coaches';
COMMENT ON COLUMN public.profiles.custom_cta_url IS 'Custom call-to-action URL for coaches';