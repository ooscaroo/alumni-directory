import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function calculateAge(birthdate: string): number {
  const today = new Date()
  const birth = new Date(birthdate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'] as const

/** SHS Tracks and Strands (DepEd K-12 curriculum) */
export const STRANDS = [
  // Academic Track
  'STEM — Science, Technology, Engineering & Mathematics',
  'ABM — Accountancy, Business & Management',
  'HUMSS — Humanities & Social Sciences',
  'GAS — General Academic Strand',
  // Technical-Vocational-Livelihood Track
  'TVL — Agri-Fishery Arts',
  'TVL — Home Economics',
  'TVL — Industrial Arts',
  'TVL — Information & Communications Technology',
  // Arts & Design Track
  'Arts & Design Track',
  // Sports Track
  'Sports Track',
  // Older / pre-K12 graduates
  'Other / Pre-K12 Graduate',
] as const

/** Alias kept for any existing references */
export const COURSES = STRANDS
