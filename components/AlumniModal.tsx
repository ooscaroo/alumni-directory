'use client'

import { useEffect, useCallback } from 'react'
import { Alumni } from '@/lib/types'
import { getInitials, formatDate, calculateAge } from '@/lib/utils'
import Image from 'next/image'
import {
  X, Mail, Phone, MapPin, Briefcase, BookOpen,
  Calendar, ExternalLink, Award, GraduationCap, User,
} from 'lucide-react'

interface AlumniModalProps {
  alumni: Alumni
  onClose: () => void
}

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: 'var(--cream)' }}
      >
        <Icon size={14} style={{ color: 'var(--navy)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5 font-medium" style={{ color: 'var(--text-light)' }}>
          {label}
        </p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline break-all"
            style={{ color: 'var(--navy)' }}
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium" style={{ color: 'var(--navy)' }}>
            {value}
          </p>
        )}
      </div>
    </div>
  )
}

export default function AlumniModal({ alumni, onClose }: AlumniModalProps) {
  // Close on Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 animate-fade-in"
        style={{ background: 'rgba(15,32,64,0.65)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Panel — slides in from right */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: 'min(560px, 100vw)',
          background: 'var(--cream)',
          boxShadow: '-8px 0 48px rgba(15,32,64,0.2)',
          animation: 'slideInRight 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        }}
      >
        {/* Top gradient banner */}
        <div
          className="relative h-44 flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 55%, var(--navy-muted) 100%)',
          }}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Gold line */}
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'var(--gold)' }} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Batch badge */}
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(201,149,60,0.2)',
              border: '1px solid rgba(201,149,60,0.4)',
              color: 'var(--gold-light)',
            }}
          >
            Class of {alumni.graduation_year}
          </div>
        </div>

        {/* Avatar — overlaps banner */}
        <div className="relative flex-shrink-0 px-6 -mt-14 mb-4 flex items-end gap-4">
          {alumni.profile_photo_url ? (
            <Image
              src={alumni.profile_photo_url}
              alt={alumni.full_name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
              style={{ border: '4px solid var(--cream)', boxShadow: 'var(--shadow-md)' }}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl font-bold font-display flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
                border: '4px solid var(--cream)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {getInitials(alumni.full_name)}
            </div>
          )}

          {/* Social links */}
          <div className="flex gap-2 pb-1 ml-auto">
            {alumni.facebook_url && (
              <a
                href={alumni.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: '#e8f0fe', color: '#1877f2' }}
              >
                <ExternalLink size={11} /> FB
              </a>
            )}
            {alumni.linkedin_url && (
              <a
                href={alumni.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: '#e8f4fd', color: '#0a66c2' }}
              >
                <ExternalLink size={11} /> LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-6">
          {/* Name & title */}
          <div>
            <h2
              className="font-display text-2xl font-bold leading-tight mb-1"
              style={{ color: 'var(--navy)' }}
            >
              {alumni.full_name}
            </h2>
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
              {alumni.current_occupation}
              {alumni.company && (
                <span style={{ color: 'var(--gold)' }}> · {alumni.company}</span>
              )}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-light)' }}>
              {alumni.gender} · Age {calculateAge(alumni.birthdate)}
            </p>
          </div>

          {/* Bio */}
          {alumni.bio && (
            <div
              className="p-4 rounded-xl text-sm leading-relaxed"
              style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              {alumni.bio}
            </div>
          )}

          {/* Education card */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h3
              className="font-display text-sm font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--navy)' }}
            >
              <GraduationCap size={15} style={{ color: 'var(--gold)' }} />
              Education
            </h3>
            <div className="space-y-4">
              <DetailRow
                icon={BookOpen}
                label="Track / Strand"
                value={alumni.course}
              />
              <DetailRow
                icon={Calendar}
                label="Graduation Year"
                value={String(alumni.graduation_year)}
              />
              <DetailRow
                icon={Calendar}
                label="Date of Birth"
                value={formatDate(alumni.birthdate)}
              />
            </div>
          </div>

          {/* Career card */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h3
              className="font-display text-sm font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--navy)' }}
            >
              <Briefcase size={15} style={{ color: 'var(--gold)' }} />
              Career
            </h3>
            <div className="space-y-4">
              <DetailRow
                icon={Briefcase}
                label="Current Occupation"
                value={alumni.current_occupation}
              />
              <DetailRow
                icon={User}
                label="Company / Organization"
                value={alumni.company}
              />
              <DetailRow icon={MapPin} label="Location" value={alumni.address} />
            </div>
          </div>

          {/* Contact card */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h3
              className="font-display text-sm font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--navy)' }}
            >
              <Mail size={15} style={{ color: 'var(--gold)' }} />
              Contact
            </h3>
            <div className="space-y-4">
              <DetailRow
                icon={Mail}
                label="Email"
                value={alumni.email}
                href={`mailto:${alumni.email}`}
              />
              {alumni.phone && (
                <DetailRow
                  icon={Phone}
                  label="Phone"
                  value={alumni.phone}
                  href={`tel:${alumni.phone}`}
                />
              )}
              {alumni.facebook_url && (
                <DetailRow
                  icon={ExternalLink}
                  label="Facebook"
                  value={alumni.facebook_url}
                  href={alumni.facebook_url}
                />
              )}
              {alumni.linkedin_url && (
                <DetailRow
                  icon={ExternalLink}
                  label="LinkedIn"
                  value={alumni.linkedin_url}
                  href={alumni.linkedin_url}
                />
              )}
            </div>
          </div>

          {/* Achievements */}
          {alumni.achievements && (
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h3
                className="font-display text-sm font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'var(--navy)' }}
              >
                <Award size={15} style={{ color: 'var(--gold)' }} />
                Achievements
              </h3>
              <div
                className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,149,60,0.07), rgba(201,149,60,0.03))',
                  border: '1px solid rgba(201,149,60,0.18)',
                  color: 'var(--text-muted)',
                }}
              >
                {alumni.achievements}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
