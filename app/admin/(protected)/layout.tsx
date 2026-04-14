import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect('/admin/login');

	// Verify admin profile
	const { data: adminProfile } = await supabase
		.from('admin_profiles')
		.select('*')
		.eq('id', user.id)
		.single();

	if (!adminProfile || !adminProfile.is_active) {
		redirect('/admin/login');
	}

	return (
		<div
			className='flex h-screen overflow-hidden'
			style={{ background: 'var(--cream)' }}>
			<AdminSidebar user={user} adminProfile={adminProfile} />
			<main className='flex-1 overflow-y-auto'>{children}</main>
		</div>
	);
}

