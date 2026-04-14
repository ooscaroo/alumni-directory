import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
	subsets: ['latin'],
	variable: '--font-dm-sans',
	display: 'swap',
});

const playfair = Playfair_Display({
	subsets: ['latin'],
	variable: '--font-playfair',
	display: 'swap',
});

export const metadata: Metadata = {
	title: {
		default: 'Alumni Directory | Sibale Academy of the Immaculate Concepcion',
		template: '%s | Sibale Academy of the Immaculate Concepcion Alumni',
	},
	description:
		'Connect with high school graduates of Sibale Academy of the Immaculate Concepcion. Browse our alumni directory and reconnect with your batchmates.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' className={`${dmSans.variable} ${playfair.variable}`}>
			<body className='antialiased'>{children}</body>
		</html>
	);
}
