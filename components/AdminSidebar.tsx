'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { AdminProfile } from '@/lib/types';
import { getInitials } from '@/lib/utils';
import {
	GraduationCap,
	Users,
	PlusCircle,
	LogOut,
	ExternalLink,
	ChevronRight,
} from 'lucide-react';

interface AdminSidebarProps {
	user: User;
	adminProfile: AdminProfile;
}

const NAV_ITEMS = [
	{ href: '/admin/alumni', label: 'All Alumni', icon: Users },
	{ href: '/admin/alumni/new', label: 'Add Alumni', icon: PlusCircle },
];

export default function AdminSidebar({
	user,
	adminProfile,
}: AdminSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const supabase = createClient();

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.push('/admin/login');
	};

	return (
		<aside
			className='w-64 flex-shrink-0 flex flex-col h-full'
			style={{
				background: 'var(--navy)',
				borderRight: '1px solid rgba(255,255,255,0.06)',
			}}>
			{/* Gold top bar */}
			<div
				className='h-0.5 w-full'
				style={{
					background: 'linear-gradient(90deg, var(--gold), var(--gold-light))',
				}}
			/>

			{/* Logo */}
			<div
				className='px-6 py-6 border-b'
				style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
				<div className='flex items-center gap-3'>
					<div
						className='w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0'
						style={{
							background: 'rgba(201,149,60,0.15)',
							border: '1px solid rgba(201,149,60,0.25)',
						}}>
						<GraduationCap size={18} style={{ color: 'var(--gold)' }} />
					</div>
					<div>
						<p
							className='text-xs font-semibold tracking-wider uppercase'
							style={{ color: 'var(--gold-light)' }}>
							Sibale Academy of the Immaculate Concepcion
						</p>
						<p className='text-xs' style={{ color: 'rgba(255,255,255,0.35)' }}>
							Admin Portal
						</p>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className='flex-1 px-4 py-6 space-y-1'>
				<p
					className='text-xs font-semibold tracking-widest uppercase px-3 mb-3'
					style={{ color: 'rgba(255,255,255,0.25)' }}>
					Management
				</p>
				{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
					const isActive =
						pathname === href ||
						(href !== '/admin/alumni' && pathname.startsWith(href));
					return (
						<Link
							key={href}
							href={href}
							className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group'
							style={{
								background: isActive ? 'rgba(201,149,60,0.15)' : 'transparent',
								color: isActive
									? 'var(--gold-light)'
									: 'rgba(255,255,255,0.55)',
								border: isActive
									? '1px solid rgba(201,149,60,0.2)'
									: '1px solid transparent',
							}}
							onMouseEnter={(e) => {
								if (!isActive) {
									(e.currentTarget as HTMLElement).style.background =
										'rgba(255,255,255,0.05)';
									(e.currentTarget as HTMLElement).style.color =
										'rgba(255,255,255,0.85)';
								}
							}}
							onMouseLeave={(e) => {
								if (!isActive) {
									(e.currentTarget as HTMLElement).style.background =
										'transparent';
									(e.currentTarget as HTMLElement).style.color =
										'rgba(255,255,255,0.55)';
								}
							}}>
							<Icon size={16} />
							{label}
							{isActive && <ChevronRight size={14} className='ml-auto' />}
						</Link>
					);
				})}

				{/* View public site */}
				<div className='pt-4'>
					<p
						className='text-xs font-semibold tracking-widest uppercase px-3 mb-3'
						style={{ color: 'rgba(255,255,255,0.25)' }}>
						Public
					</p>
					<Link
						href='/batch'
						target='_blank'
						className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200'
						style={{ color: 'rgba(255,255,255,0.45)' }}
						onMouseEnter={(e) => {
							(e.currentTarget as HTMLElement).style.background =
								'rgba(255,255,255,0.05)';
							(e.currentTarget as HTMLElement).style.color =
								'rgba(255,255,255,0.75)';
						}}
						onMouseLeave={(e) => {
							(e.currentTarget as HTMLElement).style.background = 'transparent';
							(e.currentTarget as HTMLElement).style.color =
								'rgba(255,255,255,0.45)';
						}}>
						<ExternalLink size={16} />
						View Public Directory
					</Link>
				</div>
			</nav>

			{/* User profile & logout */}
			<div
				className='px-4 py-4 border-t'
				style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
				<div
					className='flex items-center gap-3 px-3 py-3 rounded-xl mb-2'
					style={{ background: 'rgba(255,255,255,0.04)' }}>
					<div
						className='w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0'
						style={{
							background: 'rgba(201,149,60,0.2)',
							color: 'var(--gold-light)',
						}}>
						{getInitials(adminProfile.full_name || user.email || 'A')}
					</div>
					<div className='flex-1 min-w-0'>
						<p
							className='text-xs font-semibold truncate'
							style={{ color: 'rgba(255,255,255,0.8)' }}>
							{adminProfile.full_name || 'Administrator'}
						</p>
						<p
							className='text-xs truncate'
							style={{ color: 'rgba(255,255,255,0.35)' }}>
							{user.email}
						</p>
					</div>
				</div>
				<button
					onClick={handleSignOut}
					className='flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all'
					style={{ color: 'rgba(255,255,255,0.4)' }}
					onMouseEnter={(e) => {
						(e.currentTarget as HTMLElement).style.background =
							'rgba(184,49,47,0.15)';
						(e.currentTarget as HTMLElement).style.color = '#f87171';
					}}
					onMouseLeave={(e) => {
						(e.currentTarget as HTMLElement).style.background = 'transparent';
						(e.currentTarget as HTMLElement).style.color =
							'rgba(255,255,255,0.4)';
					}}>
					<LogOut size={15} />
					Sign Out
				</button>
			</div>
		</aside>
	);
}
