import AlumniForm from '@/components/AlumniForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add New Alumni',
}

export default function NewAlumniPage() {
  return <AlumniForm mode="create" />
}

