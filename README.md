📌 Smart Bookmark App

A simple, secure, real-time bookmark manager built as part of the Abstrabit Fullstack Internship Micro-Challenge.

Users can sign in using Google OAuth, add and delete bookmarks, and see updates in real time across multiple tabs.

🚀 Live Demo

👉 Live URL: https://<your-vercel-url>.vercel.app
👉 GitHub Repo: https://github.com/Manoj5621/Smart-Bookmark-App.gitsmart-bookmark-app

🛠 Tech Stack

Frontend: Next.js 16 (App Router)

Styling: Tailwind CSS

Backend / Database: Supabase (PostgreSQL)

Authentication: Supabase Auth (Google OAuth only)

Realtime: Supabase Realtime (Postgres Changes)

Deployment: Vercel

✨ Features

🔐 Google OAuth login (no email/password)

➕ Add bookmarks (title + URL)

❌ Delete your own bookmarks

🔒 Bookmarks are private to each user (RLS enforced)

🔄 Realtime updates across multiple tabs

🚪 Logout support

📱 Responsive, clean UI

📁 Project Structure
smart-bookmark-app/
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── server.ts
├── public/
│   └── logo.png
├── .env.local
├── tailwind.config.ts
└── README.md

⚙️ Local Setup Instructions

1️⃣ Clone the repository
git clone https://github.com/Manoj5621/Smart-Bookmark-App.gitgit
cd smart-bookmark-app

2️⃣ Install dependencies
npm install
3️⃣ Setup environment variables

Create a .env.local file in the root:

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

⚠️ .env.local is ignored by Git for security reasons.

4️⃣ Run the app locally
npm run dev

App will run at:

http://localhost:3000
🗄 Database Schema
bookmarks table
Column   	Type
id	        uuid (PK)
title	    text
url	        text
user_id  	uuid (FK)
created_at	timestamp

🔐 Row Level Security (RLS)

RLS ensures:

Users can only read their own bookmarks

Users can only insert/delete their own bookmarks

Example policy:

create policy "Read own bookmarks"
on public.bookmarks
for select
using (auth.uid() = user_id);

🔄 Realtime Implementation

Subscribed to postgres_changes on the bookmarks table

Handles:

INSERT → adds bookmark in all tabs

DELETE → removes bookmark in all tabs

Uses client-side user filtering for safety

❗ Problems Faced & How I Solved Them

1️⃣ Google OAuth redirect error (redirect_uri_mismatch)

Problem: Login failed after deployment
Solution:
Updated Supabase Auth → URL Configuration with the Vercel domain and redirect URLs.

2️⃣ RLS blocking inserts

Problem: Bookmarks were not being added
Solution:
Explicitly passed user_id during insert to satisfy RLS policies.

3️⃣ Realtime DELETE not updating across tabs

Problem: Deleted bookmarks didn’t disappear in other tabs
Solution:

Enabled table replication

Set REPLICA IDENTITY FULL

Subscribed to postgres_changes DELETE events

Added proper user filtering in realtime listener

4️⃣ TypeScript error in realtime payload

Problem: payload showed red underline in VS Code
Solution:
Defined a proper payload type and safely casted the realtime event payload.

📦 Deployment

Pushed project to GitHub

Connected repository to Vercel

Added environment variables in Vercel

Updated Supabase Auth redirect URLs

✅ Final Result

Fully working Google login

Secure private bookmarks

Real-time sync

Production-ready deployment

🙌 Acknowledgements

This project was built as part of the Abstrabit Technologies Internship Screening Task.

📧 Contact

Manoj G
Email: manoj@gmail.com

GitHub: https://github.com/Manoj5621
