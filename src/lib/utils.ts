import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAssessmentLink(assessmentId: string) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/assessment/${assessmentId}`;
}