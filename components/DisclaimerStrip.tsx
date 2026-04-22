'use client';

import { useState } from 'react';

const DISCLAIMER_TEXT =
	'This website is not the official alumni website of Sibale Academy of the Immaculate Concepcion. It is a prototype created by the designer to demonstrate the potential design, layout, and features of an alumni platform. The content and functionality shown here are for preview purposes only.';

export default function DisclaimerStrip() {
	const [isPaused, setIsPaused] = useState(false);

	return (
		<div
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			className='text-sm text-center relative flex h-9.5 w-full items-center overflow-hidden border-b border-white/10'
			style={{ background: 'var(--blue)', color: 'var(--navy)' }}>
			{/* Badge */}
			<div
				className='flex h-full shrink-0 items-center gap-1.5 px-3.5'
				style={{ backgroundColor: 'var(--gold-light)' }}>
				<span
					className='pulse-dot h-1.5 w-1.5 shrink-0 rounded-full'
					style={{ backgroundColor: 'var(--navy)' }}
				/>
				NOTICE
			</div>

			{/* Marquee */}
			<div className='disclaimer-fade relative flex h-full flex-1 items-center overflow-hidden'>
				<div
					className={`marquee-track flex whitespace-nowrap ${isPaused ? 'paused' : ''}`}>
					{[...Array(3)].map((_, i) => (
						<span key={i} className='inline-flex items-center gap-4 px-3'>
							{DISCLAIMER_TEXT}
							<span
								aria-hidden='true'
								style={{ color: '#e8a838', fontSize: '10px', opacity: 0.7 }}>
								✦
							</span>
						</span>
					))}
				</div>
			</div>
		</div>
	);
}
