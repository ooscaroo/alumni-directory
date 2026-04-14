'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Alumni } from '@/lib/types';
import { getInitials } from '@/lib/utils';
import AlumniModal from '@/components/AlumniModal';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
	ArrowLeft,
	Search,
	Briefcase,
	BookOpen,
	MapPin,
	Users,
	Shield,
} from 'lucide-react';
import Image from 'next/image';

/* ── Card ─────────────────────────────────────────── */
function GraduateCard({
	alumni,
	index,
	onSelect,
}: {
	alumni: Alumni;
	index: number;
	onSelect: (a: Alumni) => void;
}) {
	return (
		<button
			onClick={() => onSelect(alumni)}
			className='block w-full text-left group animate-fade-in'
			style={{ animationDelay: `${index * 45}ms`, opacity: 0 }}>
			<div
				className='bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1'
				style={{ boxShadow: 'var(--shadow-card)' }}
				onMouseEnter={(e) => {
					(e.currentTarget as HTMLDivElement).style.boxShadow =
						'var(--shadow-lg)';
				}}
				onMouseLeave={(e) => {
					(e.currentTarget as HTMLDivElement).style.boxShadow =
						'var(--shadow-card)';
				}}>
				<div
					className='h-1'
					style={{
						background: 'linear-gradient(90deg, var(--navy), var(--gold))',
					}}
				/>
				<div className='p-5'>
					<div className='flex items-start gap-4'>
						{/* Avatar */}
						<div className='shrink-0'>
							{alumni.profile_photo_url ? (
								<Image
									src={alumni.profile_photo_url}
									alt={alumni.full_name}
									className='w-14 h-14 rounded-full object-cover'
									style={{ border: '2px solid var(--cream-dark)' }}
								/>
							) : (
								<div
									className='w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base font-display'
									style={{
										background:
											'linear-gradient(135deg, var(--navy), var(--navy-light))',
									}}>
									{getInitials(alumni.full_name)}
								</div>
							)}
						</div>

						<div className='flex-1 min-w-0'>
							<h3
								className='font-display text-base font-semibold mb-0.5 group-hover:text-amber-700 transition-colors truncate'
								style={{ color: 'var(--navy)' }}>
								{alumni.full_name}
							</h3>
							<div className='space-y-1.5 mt-2'>
								<div
									className='flex items-center gap-1.5 text-xs'
									style={{ color: 'var(--text-muted)' }}>
									<Briefcase size={11} className='shrink-0' />
									<span className='truncate'>
										{alumni.current_occupation} · {alumni.company}
									</span>
								</div>
								<div
									className='flex items-center gap-1.5 text-xs'
									style={{ color: 'var(--text-muted)' }}>
									<BookOpen size={11} className='shrink-0' />
									<span className='truncate'>{alumni.course}</span>
								</div>
								<div
									className='flex items-center gap-1.5 text-xs'
									style={{ color: 'var(--text-muted)' }}>
									<MapPin size={11} className='shrink-0' />
									<span className='truncate'>{alumni.address}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Hover hint */}
					<div
						className='mt-4 pt-3 flex items-center justify-end text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity'
						style={{
							borderTop: '1px solid var(--border)',
							color: 'var(--gold-muted)',
						}}>
						View profile →
					</div>
				</div>
			</div>
		</button>
	);
}

/* ── Skeleton ─────────────────────────────────────── */
function SkeletonCard() {
	return (
		<div
			className='bg-white rounded-2xl overflow-hidden'
			style={{ boxShadow: 'var(--shadow-card)' }}>
			<div className='h-1 skeleton' />
			<div className='p-5 flex gap-4'>
				<div className='skeleton w-14 h-14 rounded-full shrink-0' />
				<div className='flex-1 space-y-2 pt-1'>
					<div className='skeleton h-4 w-3/4 rounded' />
					<div className='skeleton h-3 w-full rounded' />
					<div className='skeleton h-3 w-5/6 rounded' />
					<div className='skeleton h-3 w-2/3 rounded' />
				</div>
			</div>
		</div>
	);
}

/* ── Page ─────────────────────────────────────────── */
export default function BatchYearPage() {
	const { year } = useParams<{ year: string }>();
	const [alumni, setAlumni] = useState<Alumni[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [selected, setSelected] = useState<Alumni | null>(null);
	const supabase = createClient();

	useEffect(() => {
		const t = setTimeout(() => setSearch(searchInput), 300);
		return () => clearTimeout(t);
	}, [searchInput]);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			setLoading(true);
			let query = supabase
				.from('alumni')
				.select('*')
				.eq('graduation_year', Number(year))
				.order('full_name', { ascending: true });

			if (search) {
				query = query.or(
					`full_name.ilike.%${search}%,current_occupation.ilike.%${search}%,company.ilike.%${search}%,course.ilike.%${search}%`,
				);
			}

			const { data } = await query;
			if (cancelled) return;

			setAlumni(data || []);
			setLoading(false);
		})().catch(() => {
			if (cancelled) return;
			setAlumni([]);
			setLoading(false);
		});

		return () => {
			cancelled = true;
		};
	}, [year, search, supabase]);

	const closeModal = useCallback(() => setSelected(null), []);

	return (
		<div className='min-h-screen' style={{ background: 'var(--cream)' }}>
			{/* ── Header ─────────────────────────── */}
			<header
				className='relative overflow-hidden'
				style={{
					background:
						'linear-gradient(150deg, var(--navy) 0%, var(--navy-light) 60%, var(--navy-muted) 100%)',
				}}>
				<div
					className='absolute inset-0 opacity-5'
					style={{
						backgroundImage:
							'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
						backgroundSize: '32px 32px',
					}}
				/>
				<div
					className='absolute top-0 left-0 right-0 h-1'
					style={{ background: 'var(--gold)' }}
				/>

				<div className='relative max-w-6xl mx-auto px-6 py-12'>
					{/* Nav row */}
					<div className='flex items-center justify-between mb-10'>
						<Link
							href='/batch'
							className='flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70'
							style={{ color: 'rgba(255,255,255,0.7)' }}>
							<ArrowLeft size={15} /> All Batches
						</Link>
						<Link
							href='/admin/login'
							className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg'
							style={{
								color: 'rgba(255,255,255,0.45)',
								border: '1px solid rgba(255,255,255,0.15)',
							}}>
							<Shield size={11} /> Admin
						</Link>
					</div>

					{/* Heading */}
					<p
						className='text-sm font-semibold tracking-wider uppercase mb-1'
						style={{ color: 'var(--gold-light)' }}>
						Graduation Year
					</p>
					<div className='flex items-end gap-5'>
						<h1
							className='font-display font-bold leading-none'
							style={{ color: 'white', fontSize: 'clamp(4rem, 10vw, 6rem)' }}>
							{year}
						</h1>
						{!loading && (
							<p
								className='text-lg mb-2'
								style={{ color: 'rgba(255,255,255,0.5)' }}>
								{alumni.length} {alumni.length === 1 ? 'alumnus' : 'alumni'}
							</p>
						)}
					</div>
				</div>
			</header>

			{/* ── Sticky search ──────────────────── */}
			<div
				className='sticky top-0 z-20 py-4 px-6'
				style={{
					background: 'rgba(246,240,228,0.95)',
					backdropFilter: 'blur(12px)',
					borderBottom: '1px solid var(--border)',
				}}>
				<div className='max-w-6xl mx-auto'>
					<div className='relative max-w-md'>
						<Search
							size={16}
							className='absolute left-3.5 top-1/2 -translate-y-1/2'
							style={{ color: 'var(--text-light)' }}
						/>
						<input
							type='text'
							placeholder={`Search the ${year} batch…`}
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className='w-full h-11 pl-10 pr-4 rounded-xl text-sm'
							style={{
								background: 'white',
								border: '1.5px solid var(--border)',
								color: 'var(--text-dark)',
								outline: 'none',
								fontFamily: 'var(--font-body)',
							}}
							onFocus={(e) => {
								e.target.style.borderColor = 'var(--gold)';
							}}
							onBlur={(e) => {
								e.target.style.borderColor = 'var(--border)';
							}}
						/>
					</div>
				</div>
			</div>

			{/* ── Graduate grid ──────────────────── */}
			<main className='max-w-6xl mx-auto px-6 py-10'>
				{loading ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{Array.from({ length: 6 }).map((_, i) => (
							<SkeletonCard key={i} />
						))}
					</div>
				) : alumni.length === 0 ? (
					<div className='text-center py-24'>
						<div
							className='w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5'
							style={{ background: 'var(--cream-dark)' }}>
							<Users size={28} style={{ color: 'var(--text-light)' }} />
						</div>
						<h3
							className='font-display text-xl font-semibold mb-2'
							style={{ color: 'var(--navy)' }}>
							{search ? 'No results found' : 'No alumni for this batch yet'}
						</h3>
						<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
							{search
								? 'Try a different search term.'
								: 'Records will appear here once added by an admin.'}
						</p>
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children'>
						{alumni.map((a, i) => (
							<GraduateCard
								key={a.id}
								alumni={a}
								index={i}
								onSelect={setSelected}
							/>
						))}
					</div>
				)}
			</main>

			<footer
				className='mt-16 py-8 text-center'
				style={{ borderTop: '1px solid var(--border)' }}>
				<p className='text-xs' style={{ color: 'var(--text-light)' }}>
					© {new Date().getFullYear()} Sibale Academy of the Immaculate
					Concepcion · Alumni Affairs Office
				</p>
			</footer>

			{/* ── Alumni detail modal ──────────────── */}
			{selected && <AlumniModal alumni={selected} onClose={closeModal} />}
		</div>
	);
}
