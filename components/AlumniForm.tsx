'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Alumni, AlumniFormData } from '@/lib/types';
import { GENDERS, STRANDS } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Upload, X, Save, Loader2, User } from 'lucide-react';

interface AlumniFormProps {
	initial?: Alumni;
	mode: 'create' | 'edit';
}

function FormField({
	label,
	required,
	children,
	hint,
}: {
	label: string;
	required?: boolean;
	children: React.ReactNode;
	hint?: string;
}) {
	return (
		<div>
			<label
				className='block text-sm font-medium mb-1.5'
				style={{ color: 'var(--navy)' }}>
				{label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
			</label>
			{children}
			{hint && (
				<p className='mt-1 text-xs' style={{ color: 'var(--text-light)' }}>
					{hint}
				</p>
			)}
		</div>
	);
}

const inputStyle = {
	width: '100%',
	height: '40px',
	padding: '0 12px',
	borderRadius: '10px',
	border: '1.5px solid var(--border)',
	background: 'white',
	color: 'var(--text-dark)',
	fontSize: '14px',
	fontFamily: 'var(--font-body)',
	outline: 'none',
	transition: 'border-color 0.2s',
};

const textareaStyle = {
	...inputStyle,
	height: 'auto',
	padding: '10px 12px',
	resize: 'vertical' as const,
	minHeight: '80px',
};

function StyledInput({
	type = 'text',
	...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			type={type}
			{...props}
			style={inputStyle}
			onFocus={(e) => {
				e.target.style.borderColor = 'var(--gold)';
			}}
			onBlur={(e) => {
				e.target.style.borderColor = 'var(--border)';
			}}
		/>
	);
}

function StyledSelect({
	children,
	...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
	return (
		<select
			{...props}
			style={inputStyle}
			onFocus={(e) => {
				e.target.style.borderColor = 'var(--gold)';
			}}
			onBlur={(e) => {
				e.target.style.borderColor = 'var(--border)';
			}}>
			{children}
		</select>
	);
}

function StyledTextarea({
	...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			{...props}
			style={textareaStyle}
			onFocus={(e) => {
				e.target.style.borderColor = 'var(--gold)';
			}}
			onBlur={(e) => {
				e.target.style.borderColor = 'var(--border)';
			}}
		/>
	);
}

export default function AlumniForm({ initial, mode }: AlumniFormProps) {
	const router = useRouter();
	const supabase = createClient();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [form, setForm] = useState<Partial<AlumniFormData>>({
		full_name: initial?.full_name || '',
		gender: initial?.gender || 'Male',
		birthdate: initial?.birthdate || '',
		graduation_year: initial?.graduation_year || new Date().getFullYear(),
		course: initial?.course || '',
		address: initial?.address || '',
		current_occupation: initial?.current_occupation || '',
		company: initial?.company || '',
		email: initial?.email || '',
		phone: initial?.phone || '',
		profile_photo_url: initial?.profile_photo_url || '',
		facebook_url: initial?.facebook_url || '',
		linkedin_url: initial?.linkedin_url || '',
		achievements: initial?.achievements || '',
		motto: initial?.motto || '',
	});

	const [photoPreview, setPhotoPreview] = useState<string | null>(
		initial?.profile_photo_url || null,
	);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [toast, setToast] = useState<{
		msg: string;
		type: 'success' | 'error';
	} | null>(null);

	const showToast = (msg: string, type: 'success' | 'error') => {
		setToast({ msg, type });
		setTimeout(() => setToast(null), 3500);
	};

	const set = <K extends keyof AlumniFormData>(
		field: K,
		value: AlumniFormData[K],
	) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => {
			const n = { ...prev };
			delete n[field];
			return n;
		});
	};

	const validate = () => {
		const errs: Record<string, string> = {};
		if (!form.full_name?.trim()) errs.full_name = 'Full name is required';
		if (!form.gender) errs.gender = 'Gender is required';
		if (!form.birthdate) errs.birthdate = 'Birthdate is required';
		if (!form.graduation_year)
			errs.graduation_year = 'Graduation year is required';
		if (!form.course?.trim()) errs.course = 'Track / Strand is required';
		if (!form.address?.trim()) errs.address = 'Address is required';
		if (!form.current_occupation?.trim())
			errs.current_occupation = 'Occupation is required';
		if (!form.company?.trim()) errs.company = 'Company is required';
		if (!form.email?.trim()) errs.email = 'Email is required';
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
			errs.email = 'Invalid email address';
		setErrors(errs);
		return Object.keys(errs).length === 0;
	};

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			showToast('Photo must be under 5MB', 'error');
			return;
		}
		setPhotoFile(file);
		const reader = new FileReader();
		reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
		reader.readAsDataURL(file);
	};

	const uploadPhoto = async (alumniId: string): Promise<string | null> => {
		if (!photoFile) return form.profile_photo_url || null;
		const ext = photoFile.name.split('.').pop();
		const path = `${alumniId}/profile.${ext}`;
		const { error } = await supabase.storage
			.from('alumni-photos')
			.upload(path, photoFile, { upsert: true });
		if (error) {
			showToast('Photo upload failed', 'error');
			return null;
		}
		const { data } = supabase.storage.from('alumni-photos').getPublicUrl(path);
		return data.publicUrl;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;
		setSubmitting(true);

		try {
			if (mode === 'create') {
				const { data: newAlumni, error } = await supabase
					.from('alumni')
					.insert([{ ...form }])
					.select()
					.single();
				if (error) throw error;

				const photoUrl = await uploadPhoto(newAlumni.id);
				if (photoUrl) {
					await supabase
						.from('alumni')
						.update({ profile_photo_url: photoUrl })
						.eq('id', newAlumni.id);
				}
				showToast('Alumni record created successfully!', 'success');
				setTimeout(() => router.push('/admin/alumni'), 1200);
			} else {
				const photoUrl = await uploadPhoto(initial!.id);
				const { error } = await supabase
					.from('alumni')
					.update({ ...form, profile_photo_url: photoUrl })
					.eq('id', initial!.id);
				if (error) throw error;
				showToast('Record updated successfully!', 'success');
				setTimeout(() => router.push('/admin/alumni'), 1200);
			}
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : 'Something went wrong';
			showToast(message, 'error');
		} finally {
			setSubmitting(false);
		}
	};

	const currentYear = new Date().getFullYear();
	const years = Array.from(
		{ length: currentYear - 1960 + 1 },
		(_, i) => currentYear - i,
	);

	return (
		<div className='min-h-full p-8 max-w-5xl mx-auto'>
			{/* Toast */}
			{toast && (
				<div
					className='fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg animate-fade-in'
					style={{
						background:
							toast.type === 'success' ? 'var(--success)' : 'var(--danger)',
					}}>
					{toast.msg}
				</div>
			)}

			{/* Header */}
			<div className='mb-8'>
				<h1
					className='font-display text-3xl font-bold mb-1'
					style={{ color: 'var(--navy)' }}>
					{mode === 'create' ? 'Add New Alumni' : 'Edit Alumni Record'}
				</h1>
				<p className='text-sm' style={{ color: 'var(--text-muted)' }}>
					{mode === 'create'
						? 'Fill in the details to create a new alumni record.'
						: `Editing record for ${initial?.full_name}`}
				</p>
			</div>

			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Photo upload */}
				<div
					className='bg-white rounded-2xl p-6'
					style={{ boxShadow: 'var(--shadow-card)' }}>
					<h2
						className='font-display text-lg font-semibold mb-4'
						style={{ color: 'var(--navy)' }}>
						Profile Photo
					</h2>
					<div className='flex items-center gap-6'>
						<div className='relative shrink-0'>
							{photoPreview ? (
								<div className='relative'>
									{/* eslint-disable-next-line @next/next/no-img-element -- local preview (data URL) */}
									<img
										src={photoPreview}
										alt='Preview'
										className='w-24 h-24 rounded-2xl object-cover'
										style={{ border: '2px solid var(--border)' }}
									/>
									<button
										type='button'
										onClick={() => {
											setPhotoPreview(null);
											setPhotoFile(null);
											set('profile_photo_url', '');
										}}
										className='absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white'
										style={{ background: 'var(--danger)' }}>
										<X size={12} />
									</button>
								</div>
							) : (
								<div
									className='w-24 h-24 rounded-2xl flex items-center justify-center'
									style={{
										background: 'var(--cream)',
										border: '2px dashed var(--border)',
									}}>
									<User size={28} style={{ color: 'var(--text-light)' }} />
								</div>
							)}
						</div>
						<div>
							<button
								type='button'
								onClick={() => fileInputRef.current?.click()}
								className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors mb-2'
								style={{
									background: 'var(--cream)',
									color: 'var(--navy)',
									border: '1.5px solid var(--border)',
								}}>
								<Upload size={15} />{' '}
								{photoPreview ? 'Change Photo' : 'Upload Photo'}
							</button>
							<p className='text-xs' style={{ color: 'var(--text-light)' }}>
								JPG, PNG or WebP · Max 5MB
							</p>
							<input
								ref={fileInputRef}
								type='file'
								accept='image/jpeg,image/png,image/webp'
								className='hidden'
								onChange={handlePhotoChange}
							/>
						</div>
					</div>
				</div>

				{/* Personal Info */}
				<div
					className='bg-white rounded-2xl p-6'
					style={{ boxShadow: 'var(--shadow-card)' }}>
					<h2
						className='font-display text-lg font-semibold mb-5'
						style={{ color: 'var(--navy)' }}>
						Personal Information
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
						<div className='md:col-span-2'>
							<FormField label='Full Name' required>
								<StyledInput
									value={form.full_name || ''}
									onChange={(e) => set('full_name', e.target.value)}
									placeholder='e.g. Maria Santos'
								/>
								{errors.full_name && (
									<p
										className='mt-1 text-xs'
										style={{ color: 'var(--danger)' }}>
										{errors.full_name}
									</p>
								)}
							</FormField>
						</div>
						<FormField label='Gender' required>
							<StyledSelect
								value={form.gender || ''}
								onChange={(e) =>
									set('gender', e.target.value as AlumniFormData['gender'])
								}>
								{GENDERS.map((g) => (
									<option key={g} value={g}>
										{g}
									</option>
								))}
							</StyledSelect>
						</FormField>
						<FormField label='Birthdate' required>
							<StyledInput
								type='date'
								value={form.birthdate || ''}
								onChange={(e) => set('birthdate', e.target.value)}
							/>
							{errors.birthdate && (
								<p className='mt-1 text-xs' style={{ color: 'var(--danger)' }}>
									{errors.birthdate}
								</p>
							)}
						</FormField>
						<div className='md:col-span-2'>
							<FormField label='Address' required>
								<StyledInput
									value={form.address || ''}
									onChange={(e) => set('address', e.target.value)}
									placeholder='e.g. Quezon City, Metro Manila'
								/>
								{errors.address && (
									<p
										className='mt-1 text-xs'
										style={{ color: 'var(--danger)' }}>
										{errors.address}
									</p>
								)}
							</FormField>
						</div>
					</div>
				</div>

				{/* Academic Info */}
				<div
					className='bg-white rounded-2xl p-6'
					style={{ boxShadow: 'var(--shadow-card)' }}>
					<h2
						className='font-display text-lg font-semibold mb-5'
						style={{ color: 'var(--navy)' }}>
						Academic Information
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
						<FormField label='Graduation Year' required>
							<StyledSelect
								value={form.graduation_year || ''}
								onChange={(e) =>
									set('graduation_year', Number(e.target.value))
								}>
								{years.map((y) => (
									<option key={y} value={y}>
										{y}
									</option>
								))}
							</StyledSelect>
						</FormField>
						<div className='md:col-span-2'>
							<FormField label='Track / Strand' required>
								<StyledSelect
									value={form.course || ''}
									onChange={(e) => set('course', e.target.value)}>
									<option value=''>Select a track or strand...</option>
									{STRANDS.map((c) => (
										<option key={c} value={c}>
											{c}
										</option>
									))}
								</StyledSelect>
								{errors.course && (
									<p
										className='mt-1 text-xs'
										style={{ color: 'var(--danger)' }}>
										{errors.course}
									</p>
								)}
							</FormField>
						</div>
					</div>
				</div>

				{/* Career Info */}
				<div
					className='bg-white rounded-2xl p-6'
					style={{ boxShadow: 'var(--shadow-card)' }}>
					<h2
						className='font-display text-lg font-semibold mb-5'
						style={{ color: 'var(--navy)' }}>
						Career Information
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
						<FormField label='Current Occupation' required>
							<StyledInput
								value={form.current_occupation || ''}
								onChange={(e) => set('current_occupation', e.target.value)}
								placeholder='e.g. Software Engineer'
							/>
							{errors.current_occupation && (
								<p className='mt-1 text-xs' style={{ color: 'var(--danger)' }}>
									{errors.current_occupation}
								</p>
							)}
						</FormField>
						<FormField label='Company / Organization' required>
							<StyledInput
								value={form.company || ''}
								onChange={(e) => set('company', e.target.value)}
								placeholder='e.g. Acme Corp'
							/>
							{errors.company && (
								<p className='mt-1 text-xs' style={{ color: 'var(--danger)' }}>
									{errors.company}
								</p>
							)}
						</FormField>
					</div>
				</div>

				{/* Contact Info */}
				<div
					className='bg-white rounded-2xl p-6'
					style={{ boxShadow: 'var(--shadow-card)' }}>
					<h2
						className='font-display text-lg font-semibold mb-5'
						style={{ color: 'var(--navy)' }}>
						Contact Information
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
						<FormField label='Email Address' required>
							<StyledInput
								type='email'
								value={form.email || ''}
								onChange={(e) => set('email', e.target.value)}
								placeholder='alumnus@example.com'
							/>
							{errors.email && (
								<p className='mt-1 text-xs' style={{ color: 'var(--danger)' }}>
									{errors.email}
								</p>
							)}
						</FormField>
						<FormField label='Phone Number'>
							<StyledInput
								type='tel'
								value={form.phone || ''}
								onChange={(e) => set('phone', e.target.value)}
								placeholder='+63 9XX XXX XXXX'
							/>
						</FormField>
						<FormField label='Facebook Profile URL'>
							<StyledInput
								value={form.facebook_url || ''}
								onChange={(e) => set('facebook_url', e.target.value)}
								placeholder='https://facebook.com/...'
							/>
						</FormField>
						<FormField label='LinkedIn Profile URL'>
							<StyledInput
								value={form.linkedin_url || ''}
								onChange={(e) => set('linkedin_url', e.target.value)}
								placeholder='https://linkedin.com/in/...'
							/>
						</FormField>
					</div>
				</div>

				{/* Motto & Achievements */}
				<div
					className='bg-white rounded-2xl p-6'
					style={{ boxShadow: 'var(--shadow-card)' }}>
					<h2
						className='font-display text-lg font-semibold mb-5'
						style={{ color: 'var(--navy)' }}>
						Motto & Achievements
					</h2>
					<div className='space-y-5'>
						<FormField
							label='Motto'
							hint='A short description about the alumnus.'>
							<StyledTextarea
								rows={4}
								value={form.motto || ''}
								onChange={(e) => set('motto', e.target.value)}
								placeholder='Brief motto...'
							/>
						</FormField>
						<FormField
							label='Achievements'
							hint='Awards, recognitions, notable accomplishments.'>
							<StyledTextarea
								rows={4}
								value={form.achievements || ''}
								onChange={(e) => set('achievements', e.target.value)}
								placeholder='List achievements, awards, or recognitions...'
							/>
						</FormField>
					</div>
				</div>

				{/* Actions */}
				<div className='flex items-center justify-end gap-3 pb-6'>
					<button
						type='button'
						onClick={() => router.push('/admin/alumni')}
						className='px-6 h-10 rounded-xl text-sm font-medium transition-colors'
						style={{
							background: 'white',
							color: 'var(--text-dark)',
							border: '1.5px solid var(--border)',
						}}>
						Cancel
					</button>
					<button
						type='submit'
						disabled={submitting}
						className='flex items-center gap-2 px-6 h-10 rounded-xl text-sm font-semibold text-white transition-all active:scale-95'
						style={{
							background:
								'linear-gradient(135deg, var(--navy), var(--navy-light))',
							opacity: submitting ? 0.7 : 1,
						}}>
						{submitting ? (
							<Loader2 size={15} className='animate-spin' />
						) : (
							<Save size={15} />
						)}
						{submitting
							? 'Saving...'
							: mode === 'create'
								? 'Create Record'
								: 'Save Changes'}
					</button>
				</div>
			</form>
		</div>
	);
}
