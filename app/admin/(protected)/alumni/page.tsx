'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Alumni } from '@/lib/types'
import { getInitials, STRANDS as COURSES } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search, PlusCircle, Edit2, Trash2, Filter,
  X, Users, ChevronUp, ChevronDown, AlertTriangle, ChevronLeft, ChevronRight,
} from 'lucide-react'

type AlumniListRow = Pick<
  Alumni,
  'id' | 'full_name' | 'email' | 'graduation_year' | 'course' | 'current_occupation' | 'company' | 'address' | 'profile_photo_url'
>

function DeleteModal({ alumni, onConfirm, onCancel, loading }: {
  alumni: AlumniListRow; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(15,32,64,0.6)', backdropFilter: 'blur(4px)' }} onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--danger-light)' }}>
            <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--navy)' }}>Delete Alumni Record</h3>
            <p className="text-xs" style={{ color: 'var(--text-light)' }}>This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Are you sure you want to delete <span className="font-semibold" style={{ color: 'var(--navy)' }}>{alumni.full_name}</span>&apos;s record? All associated data will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 h-10 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'var(--cream)', color: 'var(--text-dark)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 h-10 rounded-xl text-sm font-medium text-white transition-opacity"
            style={{ background: 'var(--danger)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Deleting...' : 'Delete Record'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminAlumniPage() {
  const [alumni, setAlumni] = useState<AlumniListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 25
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  const [courseFilter, setCourseFilter] = useState('')
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AlumniListRow | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const supabase = createClient()

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAlumni = useCallback(async () => {
    setLoading(true)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('alumni')
      .select('id,full_name,email,graduation_year,course,current_occupation,company,address,profile_photo_url', { count: 'exact' })
      .order(sortField, { ascending: sortAsc })
    if (search) query = query.or(`full_name.ilike.%${search}%,company.ilike.%${search}%,current_occupation.ilike.%${search}%,email.ilike.%${search}%`)
    if (yearFilter) query = query.eq('graduation_year', yearFilter)
    if (courseFilter) query = query.eq('course', courseFilter)
    const { data, count, error } = await query.range(from, to)
    if (!error && data) { setAlumni(data); setTotal(count || 0) }
    setLoading(false)
  }, [search, sortField, sortAsc, yearFilter, courseFilter, supabase, page])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAlumni() }, [fetchAlumni])

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); setSearch(searchInput) }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    async function fetchYears() {
      const { data } = await supabase.from('alumni').select('graduation_year').order('graduation_year', { ascending: false })
      if (data) setAvailableYears([...new Set(data.map(d => d.graduation_year))])
    }
    fetchYears()
  }, [supabase])

  const toggleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc)
    else { setSortField(field); setSortAsc(true) }
    setPage(1)
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronUp size={12} style={{ opacity: 0.3 }} />
    return sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const { error } = await supabase.from('alumni').delete().eq('id', deleteTarget.id)
    if (error) showToast('Failed to delete record.', 'error')
    else { showToast(`${deleteTarget.full_name} has been deleted.`, 'success'); fetchAlumni() }
    setDeleteLoading(false)
    setDeleteTarget(null)
  }

  const hasFilters = yearFilter || courseFilter

  return (
    <div className="min-h-full p-8">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg animate-fade-in"
          style={{ background: toast.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
          {toast.msg}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal alumni={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--navy)' }}>Alumni Records</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading...' : `${total} ${total === 1 ? 'record' : 'records'} in the database`}
          </p>
        </div>
        <Link href="/admin/alumni/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-light))' }}>
          <PlusCircle size={16} /> Add Alumni
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-light)' }} />
            <input type="text" placeholder="Search name, email, company..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl text-sm"
              style={{ background: 'var(--cream)', border: '1.5px solid var(--border)', color: 'var(--text-dark)', outline: 'none', fontFamily: 'var(--font-body)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--gold)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium transition-all"
            style={{ background: showFilters ? 'var(--navy)' : 'var(--cream)', color: showFilters ? 'white' : 'var(--text-dark)', border: `1.5px solid ${showFilters ? 'var(--navy)' : 'var(--border)'}` }}>
            <Filter size={14} /> Filters {hasFilters && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />}
          </button>
        </div>
        {showFilters && (
          <div className="mt-3 pt-3 flex flex-wrap gap-3 items-center" style={{ borderTop: '1px solid var(--border)' }}>
            <select value={yearFilter || ''} onChange={e => { setPage(1); setYearFilter(e.target.value ? Number(e.target.value) : null) }}
              className="h-9 px-3 rounded-lg text-sm" style={{ background: 'var(--cream)', border: '1.5px solid var(--border)', color: 'var(--text-dark)', fontFamily: 'var(--font-body)' }}>
              <option value="">All Years</option>
              {availableYears.map(y => <option key={y} value={y}>Class of {y}</option>)}
            </select>
            <select value={courseFilter} onChange={e => { setPage(1); setCourseFilter(e.target.value) }}
              className="h-9 px-3 rounded-lg text-sm max-w-xs" style={{ background: 'var(--cream)', border: '1.5px solid var(--border)', color: 'var(--text-dark)', fontFamily: 'var(--font-body)' }}>
              <option value="">All Strands</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {hasFilters && (
              <button onClick={() => { setPage(1); setYearFilter(null); setCourseFilter('') }}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm"
                style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>
                <X size={13} /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream)' }}>
                {[
                  { label: 'Alumni', field: 'full_name' },
                  { label: 'Year', field: 'graduation_year' },
                  { label: 'Strand', field: 'course' },
                  { label: 'Career', field: 'current_occupation' },
                  { label: 'Location', field: 'address' },
                ].map(({ label, field }) => (
                  <th key={field} className="text-left px-5 py-3.5 cursor-pointer select-none"
                    onClick={() => toggleSort(field)}>
                    <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase"
                      style={{ color: sortField === field ? 'var(--navy)' : 'var(--text-light)' }}>
                      {label} <SortIcon field={field} />
                    </div>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right">
                  <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-light)' }}>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="skeleton h-4 rounded" style={{ width: j === 0 ? '80%' : j === 5 ? '60px' : '70%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : alumni.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--cream)' }}>
                      <Users size={24} style={{ color: 'var(--text-light)' }} />
                    </div>
                    <p className="font-display font-semibold mb-1" style={{ color: 'var(--navy)' }}>No records found</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                alumni.map((alum, i) => (
                  <tr key={alum.id}
                    className="transition-colors"
                    style={{ borderBottom: i < alumni.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(246,240,228,0.5)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {alum.profile_photo_url ? (
                          <Image
                            src={alum.profile_photo_url}
                            alt={alum.full_name}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-light))' }}>
                            {getInitials(alum.full_name)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{alum.full_name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-light)' }}>{alum.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(201,149,60,0.12)', color: 'var(--gold-muted)' }}>
                        {alum.graduation_year}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{alum.course}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{alum.current_occupation}</p>
                      <p className="text-xs" style={{ color: 'var(--text-light)' }}>{alum.company}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm truncate max-w-[160px]" style={{ color: 'var(--text-muted)' }}>{alum.address}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/alumni/${alum.id}/edit`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          style={{ color: 'var(--navy)', background: 'var(--cream)', border: '1px solid var(--border)' }}>
                          <Edit2 size={12} /> Edit
                        </Link>
                        <button onClick={() => setDeleteTarget(alum)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && alumni.length > 0 && (
          <div className="px-5 py-3 flex items-center justify-between gap-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--cream)' }}>
            <p className="text-xs" style={{ color: 'var(--text-light)' }}>
              Showing {alumni.length} of {total} records
            </p>
            <div className="flex items-center gap-2">
              <button
                className="h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <p className="text-xs" style={{ color: 'var(--text-light)' }}>
                Page {page} of {totalPages}
              </p>
              <button
                className="h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

