-- ============================================================
-- Sibale Academy of the Immaculate Concepcion High School Alumni Directory - Supabase Schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- ALUMNI TABLE
-- ============================================================
create table public.alumni (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Required fields
  full_name text not null,
  gender text not null check (gender in ('Male', 'Female', 'Non-binary', 'Prefer not to say')),
  birthdate date not null,
  graduation_year integer not null check (graduation_year >= 1950 and graduation_year <= 2100),

  -- High school track/strand (stored in "course" column for DB compatibility)
  course text not null,   -- e.g. "STEM — Science, Technology, Engineering & Mathematics"

  address text not null,
  current_occupation text not null,
  company text not null,
  email text not null unique,

  -- Optional fields
  phone text,
  profile_photo_url text,
  facebook_url text,
  linkedin_url text,
  achievements text,
  motto text
);

-- ============================================================
-- ADMIN PROFILES TABLE
-- ============================================================
create table public.admin_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  full_name text,
  is_active boolean default true
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.alumni enable row level security;

create policy "Alumni are publicly viewable"
  on public.alumni for select using (true);

create policy "Admins can insert alumni"
  on public.alumni for insert to authenticated
  with check (
    exists (select 1 from public.admin_profiles where id = auth.uid() and is_active = true)
  );

create policy "Admins can update alumni"
  on public.alumni for update to authenticated
  using (
    exists (select 1 from public.admin_profiles where id = auth.uid() and is_active = true)
  );

create policy "Admins can delete alumni"
  on public.alumni for delete to authenticated
  using (
    exists (select 1 from public.admin_profiles where id = auth.uid() and is_active = true)
  );

alter table public.admin_profiles enable row level security;

create policy "Admins can view own profile"
  on public.admin_profiles for select to authenticated using (id = auth.uid());

-- ============================================================
-- STORAGE BUCKET FOR PROFILE PHOTOS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('alumni-photos', 'alumni-photos', true)
on conflict do nothing;

create policy "Profile photos are publicly viewable"
  on storage.objects for select using (bucket_id = 'alumni-photos');

create policy "Admins can upload profile photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'alumni-photos'
    and exists (select 1 from public.admin_profiles where id = auth.uid() and is_active = true)
  );

create policy "Admins can delete profile photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'alumni-photos'
    and exists (select 1 from public.admin_profiles where id = auth.uid() and is_active = true)
  );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_alumni_updated
  before update on public.alumni
  for each row execute procedure public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  if new.raw_user_meta_data->>'role' = 'admin' then
    insert into public.admin_profiles (id, email, full_name)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.email)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- BATCH COUNTS (AGGREGATION)
-- ============================================================

create or replace function public.get_alumni_counts_by_year()
returns table (graduation_year integer, alumni_count bigint)
language sql
stable
as $$
  select graduation_year, count(*) as alumni_count
  from public.alumni
  group by graduation_year
  order by graduation_year desc;
$$;

-- ============================================================
-- SEED FIRST ADMIN (run manually after setup)
-- ============================================================
-- After creating your first admin user in Supabase Auth → Users,
-- copy their UUID and run:
--
-- insert into public.admin_profiles (id, email, full_name)
-- values ('YOUR-AUTH-USER-UUID', 'admin@lakeviewacademy.edu', 'Admin Name');

-- ============================================================
-- SAMPLE HIGH SCHOOL ALUMNI DATA (optional — remove if not needed)
-- ============================================================
insert into public.alumni (
  full_name, gender, birthdate, graduation_year, course,
  address, current_occupation, company, email, bio, achievements
) values
  (
    'Maria Santos', 'Female', '2000-03-15', 2018,
    'STEM — Science, Technology, Engineering & Mathematics',
    'Quezon City, Metro Manila',
    'Software Engineer', 'Google Philippines',
    'maria.santos@example.com',
    'Passionate software engineer and Lakeview STEM alumna. Loves building products that help Filipinos access information faster.',
    'Best in Research Award (Grade 12), Google Women Techmakers Scholar 2022, Magna Cum Laude – BS Computer Science UP Diliman'
  ),
  (
    'Jose Reyes', 'Male', '1998-07-22', 2016,
    'ABM — Accountancy, Business & Management',
    'Makati City, Metro Manila',
    'Marketing Manager', 'Jollibee Foods Corporation',
    'jose.reyes@example.com',
    'ABM batch of 2016. Currently managing brand campaigns for one of the Philippines'' most iconic fast-food brands.',
    'Student Council President 2015–2016, Top 3 – CPA Board Exams 2021, JFC Employee of the Year 2023'
  ),
  (
    'Ana Cruz', 'Female', '2002-11-08', 2020,
    'HUMSS — Humanities & Social Sciences',
    'Pasig City, Metro Manila',
    'Content Strategist', 'GMA Network',
    'ana.cruz@example.com',
    'HUMSS alumna who turned her passion for storytelling into a career in broadcast media and digital content.',
    'Best in Journalism – Division Press Conference 2019, Dean''s Lister, National Media Award (Young Journalists) 2023'
  ),
  (
    'Carlo Mendoza', 'Male', '1997-01-30', 2015,
    'STEM — Science, Technology, Engineering & Mathematics',
    'Cebu City, Cebu',
    'Civil Engineer', 'DPWH Region VII',
    'carlo.mendoza@example.com',
    'Proud Lakeview STEM alumni now helping build bridges and roads across Visayas for the Department of Public Works.',
    'Science Fair Champion 2014, PRC Civil Engineering Board Passer – Top 5, DPWH Outstanding Young Engineer 2022'
  ),
  (
    'Isabela Gonzalez', 'Female', '2003-05-14', 2021,
    'TVL — Information & Communications Technology',
    'Davao City, Davao del Sur',
    'Junior Web Developer', 'Freelance / Remote',
    'isabela.gonzalez@example.com',
    'TVL–ICT graduate who built her first website at age 17 and now works with international clients as a freelance developer.',
    'Best Capstone Project (TVL–ICT strand), Google Developer Student Club Lead 2022, Completed AWS Cloud Practitioner 2023'
  ),
  (
    'Miguel Torres', 'Male', '2001-09-03', 2019,
    'Arts & Design Track',
    'Taguig City, Metro Manila',
    'Graphic Designer', 'TBWA\\SMP',
    'miguel.torres@example.com',
    'Arts & Design alumnus now creating award-winning visual campaigns for one of the Philippines'' top advertising agencies.',
    'Best in Visual Arts – Regional Competition 2018, UAP Student Design Excellence Award 2022, Cannes Lions Shortlist 2024'
  )
on conflict do nothing;
