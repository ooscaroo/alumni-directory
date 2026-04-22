import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			// Supabase Storage public/signed object URLs:
			// https://<project>.supabase.co/storage/v1/object/...
			{
				protocol: 'https',
				hostname: '**.supabase.co',
				pathname: '/storage/v1/object/**',
			},
			{
				protocol: 'https',
				hostname: 'encrypted-tbn0.gstatic.com',
			},
		],
	},
};

export default nextConfig;
