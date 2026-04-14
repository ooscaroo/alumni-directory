export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say'

export interface Alumni {
  id: string
  created_at: string
  updated_at: string

  // Required
  full_name: string
  gender: Gender
  birthdate: string
  graduation_year: number
  course: string
  address: string
  current_occupation: string
  company: string
  email: string

  // Optional
  phone?: string | null
  profile_photo_url?: string | null
  facebook_url?: string | null
  linkedin_url?: string | null
  achievements?: string | null
  bio?: string | null
}

export interface AdminProfile {
  id: string
  created_at: string
  email: string
  full_name?: string | null
  is_active: boolean
}

export type AlumniFormData = Omit<Alumni, 'id' | 'created_at' | 'updated_at'>

export interface AlumniFilters {
  search?: string
  graduation_year?: number | null
  course?: string | null
  gender?: Gender | null
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}
