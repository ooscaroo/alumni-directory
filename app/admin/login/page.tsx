'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { GraduationCap, Shield } from 'lucide-react';

export default function AdminLoginPage() {
	const supabase = createClient();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [accessError, setAccessError] = useState<string | null>(null);

	useEffect(() => {
		const checkAdminAccess = async () => {
			setAccessError(null);
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				setLoading(false);
				return;
			}

			const { data: adminProfile, error } = await supabase
				.from('admin_profiles')
				.select('is_active')
				.eq('id', session.user.id)
				.single();

			if (error || !adminProfile?.is_active) {
				await supabase.auth.signOut();
				setAccessError('Your account does not have admin access.');
				setLoading(false);
				return;
			}

			router.push('/admin/alumni');
		};

		checkAdminAccess();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!session) return;

			(async () => {
				const { data: adminProfile } = await supabase
					.from('admin_profiles')
					.select('is_active')
					.eq('id', session.user.id)
					.single();

				if (!adminProfile?.is_active) {
					await supabase.auth.signOut();
					setAccessError('Your account does not have admin access.');
					setLoading(false);
					return;
				}

				router.push('/admin/alumni');
			})().catch(() => {
				// If the profile lookup fails, keep the user on the login screen.
				setLoading(false);
			});
		});

		return () => subscription.unsubscribe();
	}, [router, supabase]);

	if (loading) {
		return (
			<div
				className='min-h-screen flex items-center justify-center'
				style={{ background: 'var(--navy)' }}>
				<div
					className='w-8 h-8 rounded-full border-2 animate-spin'
					style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }}
				/>
			</div>
		);
	}

	return (
		<div className='min-h-screen flex' style={{ background: 'var(--navy)' }}>
			{/* Left panel - branding */}
			<div className='hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden'>
				<div
					className='absolute inset-0 opacity-5'
					style={{
						backgroundImage:
							'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
						backgroundSize: '32px 32px',
					}}
				/>
				<div
					className='absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5'
					style={{
						background: 'var(--gold)',
						transform: 'translate(30%, 30%)',
					}}
				/>
				<div className='relative text-center'>
					<div
						className='w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8'
						style={{
							background: 'rgba(201,149,60,0.15)',
							border: '1px solid rgba(201,149,60,0.3)',
						}}>
						<GraduationCap size={36} style={{ color: 'var(--gold)' }} />
					</div>
					<h1
						className='font-display text-4xl font-bold mb-4'
						style={{ color: 'white' }}>
						Sibale Academy of the Immaculate Concepcion
					</h1>
					<p
						className='text-lg mb-2'
						style={{ color: 'rgba(255,255,255,0.6)' }}>
						Alumni Directory
					</p>
					<p
						className='text-sm max-w-xs mx-auto leading-relaxed'
						style={{ color: 'rgba(255,255,255,0.4)' }}>
						Administrators can manage high school alumni records, upload photos,
						and keep the directory up to date.
					</p>

					<div className='mt-12 grid grid-cols-2 gap-6 text-center'>
						{[
							{ label: 'Add Alumni', desc: 'Create new records' },
							{ label: 'Edit Records', desc: 'Update information' },
							{ label: 'Delete Records', desc: 'Remove outdated information' },
							{ label: 'Upload Photos', desc: 'Profile pictures' },
						].map((item) => (
							<div
								key={item.label}
								className='p-4 rounded-xl'
								style={{
									background: 'rgba(255,255,255,0.05)',
									border: '1px solid rgba(255,255,255,0.08)',
								}}>
								<p
									className='text-sm font-semibold mb-1'
									style={{ color: 'var(--gold-light)' }}>
									{item.label}
								</p>
								<p
									className='text-xs'
									style={{ color: 'rgba(255,255,255,0.4)' }}>
									{item.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Right panel - login form */}
			<div
				className='w-full lg:w-1/2 flex items-center justify-center p-8'
				style={{ background: 'white', borderRadius: '0' }}>
				<div className='w-full max-w-md'>
					{/* Mobile logo */}
					<div className='lg:hidden flex items-center gap-3 mb-8'>
						<div
							className='w-10 h-10 rounded-xl flex items-center justify-center'
							style={{ background: 'var(--navy)' }}>
							<GraduationCap size={20} style={{ color: 'var(--gold)' }} />
						</div>
						<div>
							<p
								className='font-display font-bold'
								style={{ color: 'var(--navy)' }}>
								Sibale Academy of the Immaculate Concepcion
							</p>
							<p className='text-xs' style={{ color: 'var(--text-light)' }}>
								Alumni Directory
							</p>
						</div>
					</div>

					<div className='flex items-center gap-2 mb-2'>
						<Shield size={18} style={{ color: 'var(--navy)' }} />
						<h2
							className='font-display text-2xl font-bold'
							style={{ color: 'var(--navy)' }}>
							Admin Portal
						</h2>
					</div>
					<p className='text-sm mb-8' style={{ color: 'var(--text-muted)' }}>
						Sign in to manage alumni records.
					</p>

					{accessError && (
						<div
							className='mb-6 px-4 py-3 rounded-xl text-sm'
							style={{
								background: 'var(--danger-light)',
								color: 'var(--danger)',
								border: '1px solid rgba(184,49,47,0.2)',
							}}>
							{accessError}
						</div>
					)}

					<Auth
						supabaseClient={supabase}
						appearance={{
							theme: ThemeSupa,
							variables: {
								default: {
									colors: {
										brand: '#0f2040',
										brandAccent: '#1a3260',
										brandButtonText: 'white',
										defaultButtonBackground: '#f6f0e4',
										defaultButtonBackgroundHover: '#ede5d3',
										inputBackground: 'white',
										inputBorder: '#ddd5c2',
										inputBorderFocus: '#c9953c',
										inputBorderHover: '#c9953c',
										inputText: '#1a1208',
										inputLabelText: '#6b5d4a',
										inputPlaceholder: '#9b8e7e',
									},
									fonts: {
										bodyFontFamily: 'var(--font-dm-sans), sans-serif',
										buttonFontFamily: 'var(--font-dm-sans), sans-serif',
										inputFontFamily: 'var(--font-dm-sans), sans-serif',
										labelFontFamily: 'var(--font-dm-sans), sans-serif',
									},
									borderWidths: {
										buttonBorderWidth: '0px',
										inputBorderWidth: '1.5px',
									},
									radii: {
										borderRadiusButton: '10px',
										buttonBorderRadius: '10px',
										inputBorderRadius: '10px',
									},
								},
							},
							className: {
								button: 'font-medium',
								input: 'text-sm',
							},
						}}
						providers={[]}
						view='sign_in'
						showLinks={false}
					/>

					<p
						className='mt-8 text-xs text-center'
						style={{ color: 'var(--text-light)' }}>
						Contact the Alumni Affairs Office if you need admin access.
					</p>
				</div>
			</div>
		</div>
	);
}
