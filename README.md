# 🎓 School Alumni Directory — Sibale Academy of the Immaculate Concepcion

A production-ready full-stack alumni directory built with **Next.js 16 (App Router)**, **Supabase**, **TailwindCSS**, and **TypeScript**.

Admins manage records through a protected dashboard. The public can browse, search, and view alumni profiles freely — no login required.

---

## ✨ Feature Overview

### 🌐 Public Directory (`/`)

- Responsive card grid of all alumni
- Live search by name, occupation, company, or degree
- Filter by graduation year, gender, and course
- View full individual alumni profile pages (`/alumni/[id]`)

### 🔐 Admin Dashboard (`/admin`)

- Secure email/password login via Supabase Auth
- Full alumni table with sortable columns
- Search + filter panel
- Create new alumni records with photo upload
- Edit existing records
- Delete records with confirmation modal
- View public directory link in sidebar
- Multiple admin accounts supported

---

## 🗂 Project Structure

```
alumni-directory/
├── app/
│   ├── layout.tsx                     ← Root layout, Google Fonts
│   ├── globals.css                    ← Design system, CSS variables, animations
│   ├── page.tsx                       ← Public alumni list + search/filter
│   ├── not-found.tsx                  ← Global 404 page
│   ├── alumni/
│   │   └── [id]/page.tsx             ← Public alumni profile page
│   └── admin/
│       ├── layout.tsx                 ← Admin shell (auth guard + sidebar)
│       ├── page.tsx                   ← Redirect → /admin/alumni
│       ├── login/page.tsx             ← Admin login (Supabase Auth UI)
│       └── alumni/
│           ├── page.tsx               ← Alumni management table
│           ├── new/page.tsx           ← Create alumni form
│           └── [id]/edit/page.tsx     ← Edit alumni form
├── components/
│   ├── AdminSidebar.tsx               ← Sidebar nav + user info + sign out
│   └── AlumniForm.tsx                 ← Shared create/edit form w/ photo upload
├── lib/
│   ├── types.ts                       ← TypeScript interfaces (Alumni, Admin, etc.)
│   ├── utils.ts                       ← Helpers: cn(), getInitials(), COURSES[], etc.
│   └── supabase/
│       ├── client.ts                  ← Browser Supabase client (createBrowserClient)
│       └── server.ts                  ← Server Supabase client (createServerClient)
├── proxy.ts                           ← Next.js 16 auth middleware (replaces middleware.ts)
├── supabase/
│   └── schema.sql                     ← Full DB schema, RLS policies, storage, seed data
├── .env.example                       ← Environment variable template
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Setup Guide

### Step 1 — Create a Supabase Project

1. Sign up at [supabase.com](https://supabase.com)
2. Click **New project**, choose a name and strong database password
3. Wait ~2 minutes for provisioning

### Step 2 — Run the Database Schema

1. In your Supabase dashboard → **SQL Editor → New Query**
2. Paste the full contents of `supabase/schema.sql`
3. Click **Run**

This sets up:

- `alumni` table with all required + optional fields
- `admin_profiles` table linked to Supabase Auth users
- Row Level Security (RLS) — public read, admin-only write
- `alumni-photos` storage bucket with access policies
- Auto `updated_at` trigger on alumni records
- 6 sample alumni records for testing (remove if desired)

### Step 3 — Register Your First Admin

The app has **no self-registration** — admins are invited manually.

1. Go to **Authentication → Users → Invite user** in Supabase
2. Enter the admin's email address
3. They'll receive an email to set their password
4. After they click the confirmation link, run this in SQL Editor:

```sql
-- Replace with actual UUID from Authentication → Users
INSERT INTO public.admin_profiles (id, email, full_name)
VALUES (
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  'admin@yourschool.edu',
  'Admin Full Name'
);
```

To find the UUID: **Authentication → Users → click the user → copy ID**

> **Adding more admins later**: repeat the same process — invite via Supabase Auth, then insert their `admin_profiles` row.

### Step 4 — Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values from **Supabase → Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5 — Install & Run

```bash
npm install
npm run dev
```

| URL                                  | Description             |
| ------------------------------------ | ----------------------- |
| `http://localhost:3000`              | Public alumni directory |
| `http://localhost:3000/admin/login`  | Admin login             |
| `http://localhost:3000/admin/alumni` | Admin dashboard         |

---

## 🏗 Deploying to Vercel

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

> **Supabase Auth redirect URLs**: After deploying, go to Supabase → **Authentication → URL Configuration** and add your Vercel production URL (e.g., `https://your-app.vercel.app`) to the **Redirect URLs** list.

---

## 🔒 Security Architecture

| Layer             | Mechanism                                                                        |
| ----------------- | -------------------------------------------------------------------------------- |
| Route protection  | `proxy.ts` intercepts all `/admin/*` requests, checks session cookie             |
| Server-side guard | `app/admin/layout.tsx` verifies user + `admin_profiles` row on every render      |
| Database          | Row Level Security: public SELECT, authenticated admin-only INSERT/UPDATE/DELETE |
| Storage           | Bucket policies: public GET, admin-only PUT/DELETE                               |
| No self-signup    | `showLinks={false}` on Auth UI; admin_profiles must be manually inserted         |

---

## 🎨 Design System

The UI uses a **Classic Academy** aesthetic — navy, cream, and gold palette with Playfair Display for headings and DM Sans for body text.

| Token          | Value     | Usage                           |
| -------------- | --------- | ------------------------------- |
| `--navy`       | `#0f2040` | Headers, buttons, sidebar       |
| `--cream`      | `#f6f0e4` | Page backgrounds                |
| `--gold`       | `#c9953c` | Accents, graduation year badges |
| `--text-muted` | `#6b5d4a` | Secondary text                  |
| `--border`     | `#ddd5c2` | Card borders, dividers          |

---

## 📋 Alumni Data Model

| Field                | Type    | Required | Notes                                          |
| -------------------- | ------- | -------- | ---------------------------------------------- |
| `full_name`          | text    | ✅       |                                                |
| `gender`             | enum    | ✅       | Male / Female / Non-binary / Prefer not to say |
| `birthdate`          | date    | ✅       |                                                |
| `graduation_year`    | integer | ✅       | 1900–2100                                      |
| `course`             | text    | ✅       | Degree program                                 |
| `address`            | text    | ✅       | City / Province                                |
| `current_occupation` | text    | ✅       |                                                |
| `company`            | text    | ✅       |                                                |
| `email`              | text    | ✅       | Unique                                         |
| `phone`              | text    | ☐        |                                                |
| `profile_photo_url`  | text    | ☐        | Supabase Storage URL                           |
| `facebook_url`       | text    | ☐        |                                                |
| `linkedin_url`       | text    | ☐        |                                                |
| `achievements`       | text    | ☐        | Free text                                      |
| `motto`                | text    | ☐        | Free text                                      |

---

## 🛣 Future Roadmap

- [ ] Alumni self-registration & login portal
- [ ] Events management module
- [ ] Alumni-to-alumni messaging
- [ ] Batch CSV import / export
- [ ] Admin statistics dashboard
- [ ] Print-friendly directory PDF

---

## 🧰 Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Framework  | Next.js 16 (App Router)                   |
| Database   | Supabase (PostgreSQL)                     |
| Auth       | Supabase Auth + Auth UI React             |
| Storage    | Supabase Storage                          |
| Styling    | TailwindCSS 4                             |
| Language   | TypeScript                                |
| Fonts      | Playfair Display + DM Sans (Google Fonts) |
| Deployment | Vercel (recommended)                      |
