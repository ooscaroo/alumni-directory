export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AlumniForm from '@/components/AlumniForm';

export async function generateMetadata({
	params,
}: {
	params: { id: string };
}) {
	const { id } = params;
	const supabase = await createClient();
	const { data } = await supabase
		.from('alumni')
		.select('full_name')
		.eq('id', id)
		.single();
	return { title: data ? `Edit · ${data.full_name}` : 'Edit Alumni' };
}

export default async function EditAlumniPage({
	params,
}: {
	params: { id: string };
}) {
	const { id } = params;
	const supabase = await createClient();
	const { data: alumni, error } = await supabase
		.from('alumni')
		.select('*')
		.eq('id', id)
		.single();

	if (error || !alumni) notFound();

	return <AlumniForm mode='edit' initial={alumni} />;
}

