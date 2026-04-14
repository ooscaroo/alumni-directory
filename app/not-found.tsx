import Link from 'next/link';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function NotFound() {
	return (
		<div
			className='min-h-screen flex flex-col items-center justify-center text-center px-6'
			style={{ background: 'var(--cream)' }}>
			{/* Logo */}
			<div
				className='w-16 h-16 rounded-2xl flex items-center justify-center mb-8'
				style={{ background: 'var(--navy)' }}>
				<GraduationCap size={28} style={{ color: 'var(--gold)' }} />
			</div>

			{/* 404 display */}
			<p
				className='font-display text-8xl font-bold mb-4 leading-none'
				style={{ color: 'var(--cream-darker)' }}>
				404
			</p>

			<h1
				className='font-display text-2xl font-bold mb-3'
				style={{ color: 'var(--navy)' }}>
				Page Not Found
			</h1>
			<p
				className='text-base max-w-sm mb-10'
				style={{ color: 'var(--text-muted)' }}>
				The page you&apos;re looking for doesn&apos;t exist or has been moved.
			</p>

			<Link
				href='/batch'
				className='inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95'
				style={{
					background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
				}}>
				<ArrowLeft size={15} />
				Back to Alumni Directory
			</Link>

			<p className='mt-16 text-xs' style={{ color: 'var(--text-light)' }}>
				© {new Date().getFullYear()} Sibale Academy of the Immaculate Concepcion
			</p>
		</div>
	);
}
