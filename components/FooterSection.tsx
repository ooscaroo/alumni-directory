import Link from 'next/link';

export default function FooterSection() {
	return (
		<footer
			className='flex gap-1 justify-center py-6 text-center'
			style={{ borderTop: '1px solid var(--border)' }}>
			<p className='text-sm' style={{ color: 'var(--text-light)' }}>
				© {new Date().getFullYear()} Sibale Academy of the Immaculate Concepcion
				· Prototype design by
			</p>
			<Link
				target='_blank'
				href='https://oscar-faigmani.vercel.app/'
				className='text-sm hover:text-green-600'
				style={{ color: 'var(--text-light)' }}>
				OoscaroO
			</Link>
		</footer>
	);
}
