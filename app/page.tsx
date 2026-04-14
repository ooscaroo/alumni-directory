import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { GraduationCap, BookOpen, ArrowRight, Shield } from 'lucide-react';

export const revalidate = 300;

export default async function HomePage() {
	const supabase = await createClient();

	const { count: totalAlumni } = await supabase
		.from('alumni')
		.select('*', { count: 'exact', head: true });

	const { data: yearData } = await supabase
		.from('alumni')
		.select('graduation_year')
		.order('graduation_year', { ascending: true });

	const years = [...new Set((yearData || []).map((r) => r.graduation_year))];
	const firstYear = years[0];
	const lastYear = years[years.length - 1];

	return (
		<div
			className='min-h-screen flex flex-col'
			style={{ background: 'var(--cream)' }}>
			{/* Nav */}
			<nav
				className='flex items-center justify-between px-8 py-4'
				style={{
					borderBottom: '1px solid var(--border)',
					background: 'white',
				}}>
				<div className='flex items-center gap-2.5'>
					<div
						className='w-8 h-8 rounded-xl flex items-center justify-center'
						style={{ background: 'var(--navy)' }}>
						<GraduationCap size={16} style={{ color: 'var(--gold)' }} />
					</div>
					<span
						className='font-display font-bold text-sm'
						style={{ color: 'var(--navy)' }}>
						Sibale Academy of the Immaculate Concepcion
					</span>
				</div>
				<div className='flex items-center gap-4 '>
					<Link
						href='/batch'
						className='hidden text-sm font-medium transition-opacity hover:opacity-70'
						style={{ color: 'var(--navy)' }}>
						Browse Batches
					</Link>
					<Link
						href='/admin/login'
						className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg'
						style={{
							color: 'var(--text-light)',
							border: '1px solid var(--border)',
							background: 'var(--cream)',
						}}
						>
						<Shield size={11} /> Admin
					</Link>
				</div>
			</nav>

			{/* Hero */}
			<section className='relative overflow-hidden flex-1 flex items-center'>
				<div
					className='absolute inset-0'
					style={{
						background:
							'linear-gradient(150deg, var(--navy) 0%, var(--navy-light) 55%, var(--navy-muted) 100%)',
					}}
				/>
				<div
					className='absolute inset-0 opacity-5'
					style={{
						backgroundImage:
							'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
						backgroundSize: '36px 36px',
					}}
				/>
				<div
					className='absolute right-0 top-0 w-150 h-150 rounded-full opacity-5'
					style={{
						background: 'var(--gold)',
						transform: 'translate(30%, -30%)',
					}}
				/>

				<div className='relative max-w-5xl mx-auto px-8 py-28 text-center w-full'>
					<div
						className='inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8'
						style={{
							background: 'rgba(201,149,60,0.15)',
							border: '1px solid rgba(201,149,60,0.3)',
						}}>
						<GraduationCap size={15} style={{ color: 'var(--gold-light)' }} />
						<span
							className='text-sm font-medium tracking-wider uppercase'
							style={{ color: 'var(--gold-light)' }}>
							Alumni Directory
						</span>
					</div>

					<h1
						className='font-display text-6xl font-bold leading-tight mb-6'
						style={{ color: 'white' }}>
						Once a SAICian
						<br />
						<span style={{ color: 'var(--gold-light)' }}>
							Always a SAICian.
						</span>
					</h1>

					<p
						className='text-xl max-w-2xl mx-auto mb-12 leading-relaxed'
						style={{ color: 'rgba(255,255,255,0.65)' }}>
						Reconnect with your batchmates and discover where your classmates
						are today. Browse graduates by batch year.
					</p>

					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Link
							href='/batch'
							className='inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all hover:opacity-90 active:scale-95'
							style={{ background: 'var(--gold)', color: 'white' }}>
							Browse by Batch <ArrowRight size={18} />
						</Link>
					</div>
				</div>
			</section>

			{/* Stats */}
			<section
				className='py-16 px-8'
				style={{ background: 'white', borderTop: '1px solid var(--border)' }}>
				<div className='max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center'>
					<div>
						<p
							className='font-display text-5xl font-bold mb-2'
							style={{ color: 'var(--navy)' }}>
							{totalAlumni ?? '—'}
						</p>
						<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
							Alumni in the directory
						</p>
					</div>
					<div>
						<p
							className='font-display text-5xl font-bold mb-2'
							style={{ color: 'var(--navy)' }}>
							{years.length}
						</p>
						<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
							Graduation batches
						</p>
					</div>
					<div>
						<p
							className='font-display text-5xl font-bold mb-2'
							style={{ color: 'var(--navy)' }}>
							{firstYear && lastYear ? `${firstYear}–${lastYear}` : '—'}
						</p>
						<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
							Years represented
						</p>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className='py-16 px-8 text-center'>
				<div className='max-w-xl mx-auto'>
					<BookOpen
						size={32}
						className='mx-auto mb-4'
						style={{ color: 'var(--gold)' }}
					/>
					<h2
						className='font-display text-3xl font-bold mb-3'
						style={{ color: 'var(--navy)' }}>
						Find your batch
					</h2>
					<p className='mb-8' style={{ color: 'var(--text-muted)' }}>
						Select a graduation year to see all alumni for that batch.
					</p>
					<Link
						href='/batch'
						className='inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95'
						style={{
							background:
								'linear-gradient(135deg, var(--navy), var(--navy-light))',
						}}>
						See All Batches <ArrowRight size={15} />
					</Link>
				</div>
			</section>

			<footer
				className='py-6 text-center'
				style={{ borderTop: '1px solid var(--border)' }}>
				<p className='text-xs' style={{ color: 'var(--text-light)' }}>
					© {new Date().getFullYear()} Sibale Academy of the Immaculate
					Concepcion · Alumni Affairs Office
				</p>
			</footer>
		</div>
	);
}
