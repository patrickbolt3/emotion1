import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Determines if a color is light or dark and returns appropriate text color class
 * @param hexColor - Hex color string (e.g., "#FFEE58")
 * @returns CSS class for text color
 */
export function getTextColorForBackground(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using the relative luminance formula
  // https://www.w3.org/WAI/GL/wiki/Relative_luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If luminance is greater than 0.5, use dark text, otherwise use white text
  return luminance > 0.5 ? 'text-gray-900' : 'text-white';
}

/**
 * Gets the appropriate text color for a harmonic state
 * @param stateColor - The harmonic state color
 * @returns CSS class for text color
 */
export function getHarmonicStateTextColor(stateColor: string): string {
  // Special handling for specific harmonic state colors that need dark text
  const lightColors = [
    '#FFEE58', // Willingness (yellow)
    '#9CCC65', // Stability (light green)
    '#64B5F6', // Covert Resistance (light blue)
    '#FFFFFF', // Pure Awareness (white)
    '#FFA726', // Boredom (amber)
  ];
  
  if (lightColors.includes(stateColor.toUpperCase())) {
    return 'text-gray-900';
  }
  
  return getTextColorForBackground(stateColor);
}
export function generateAssessmentLink(assessmentId: string) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/assessment/${assessmentId}`;
}