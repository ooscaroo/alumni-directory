import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
	GraduationCap,
	ArrowLeft,
	ArrowRight,
	Users,
	Shield,
} from 'lucide-react';
import FooterSection from '@/components/FooterSection';

export const revalidate = 300;
export const metadata = {
	title: 'Batches · Sibale Academy of the Immaculate Concepcion Alumni',
};

type AlumniCountByYearRow = {
	graduation_year: number;
	alumni_count: number | string;
};

export default async function BatchPage() {
	const supabase = await createClient();

	const [{ data: rpcData, error: rpcError }, { count: totalAlumniCount }] =
		await Promise.all([
			supabase.rpc('get_alumni_counts_by_year'),
			supabase.from('alumni').select('*', { count: 'exact', head: true }),
		]);

	let batches: Array<{ year: number; count: number }> = [];

	if (rpcError) {
		// Fallback for when the SQL function isn't deployed yet or lacks EXECUTE perms.
		const { data: alumni } = await supabase
			.from('alumni')
			.select('graduation_year')
			.order('graduation_year', { ascending: false });

		const batchMap: Record<number, number> = {};
		for (const a of alumni || []) {
			batchMap[a.graduation_year] = (batchMap[a.graduation_year] || 0) + 1;
		}

		batches = Object.entries(batchMap)
			.map(([year, count]) => ({ year: Number(year), count }))
			.sort((a, b) => b.year - a.year);
	} else {
		const rows = (rpcData as AlumniCountByYearRow[] | null) ?? [];
		batches = rows.map((r) => ({
			year: r.graduation_year,
			count: Number(r.alumni_count),
		}));
	}

	return (
		<div className='min-h-screen' style={{ background: 'var(--cream)' }}>
			{/* Header */}
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
					<div className='flex items-center justify-between mb-8'>
						<Link
							href='/'
							className='flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70'
							style={{ color: 'rgba(255,255,255,0.7)' }}>
							<ArrowLeft size={15} /> Home
						</Link>
						<Link
							href='/admin/login'
							className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg'
							style={{
								color: 'rgba(255,255,255,0.5)',
								border: '1px solid rgba(255,255,255,0.15)',
							}}>
							<Shield size={11} /> Admin
						</Link>
					</div>

					<div className='flex items-center gap-3 mb-3'>
						<GraduationCap size={28} style={{ color: 'var(--gold)' }} />
						<h1
							className='font-display text-4xl font-bold'
							style={{ color: 'white' }}>
							Batch Directory
						</h1>
					</div>
					<p style={{ color: 'rgba(255,255,255,0.6)' }}>
						{batches.length} graduation{' '}
						{batches.length === 1 ? 'batch' : 'batches'} ·{' '}
						{totalAlumniCount ?? 0} total alumni
					</p>
				</div>
			</header>

			{/* Batch grid */}
			<main className='max-w-6xl mx-auto px-6 py-10'>
				{batches.length === 0 ? (
					<div className='text-center py-24'>
						<Users
							size={40}
							className='mx-auto mb-4'
							style={{ color: 'var(--text-light)' }}
						/>
						<p
							className='font-display text-xl font-semibold mb-2'
							style={{ color: 'var(--navy)' }}>
							No alumni yet
						</p>
						<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
							Alumni records will appear here once added by an admin.
						</p>
					</div>
				) : (
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-children'>
						{batches.map(({ year, count }, i) => (
							<Link
								key={year}
								href={`/batch/${year}`}
								className='group animate-fade-in'
								style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}>
								<div className='bg-white rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer'>
									{/* Gold bar */}
									<div
										className='w-8 h-1 rounded-full mx-auto mb-4'
										style={{ background: 'var(--gold)' }}
									/>

									<p
										className='font-display text-3xl font-bold mb-1 group-hover:text-amber-700 transition-colors'
										style={{ color: 'var(--navy)' }}>
										{year}
									</p>
									<p
										className='text-xs mb-4'
										style={{ color: 'var(--text-light)' }}>
										{count} {count === 1 ? 'alumnus' : 'alumni'}
									</p>

									<div
										className='inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-colors'
										style={{
											background: 'var(--cream)',
											color: 'var(--navy)',
										}}>
										View Batch <ArrowRight size={11} />
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</main>

			<FooterSection />
		</div>
	);
}
