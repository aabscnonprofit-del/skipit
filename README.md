# SkipIt ⚡

> Real-time signal system for delivery drivers.  
> Know where **NOT** to go. Skip the bad stops. Protect your time.

---

## What It Does

SkipIt is a crowdsourced, anonymous signal board for delivery drivers. Drivers file quick reports about problem stops — closed restaurants, 30-minute waits, oversized items, unsafe areas — and every other driver nearby sees the warning in real time.

Reports auto-expire after **8 hours**. No accounts. No bloat.

---
## Prerequisites

- Node.js 18+
- npm
- Supabase account
- Vercel account (recommended for deployment)

## How It Works (1 minute)

1. A driver sees a problem: long wait, closed store, unsafe stop, bad order, road issue.
2. The driver files a quick report.
3. Other drivers see the signal in the live feed.
4. Reports expire automatically after 8 hours.
5. The result: less wasted time, fewer bad stops, better decisions.


## Tech Stack

| Layer      | Choice                          |
|------------|---------------------------------|
| Framework  | Next.js 14 (App Router)         |
| Database   | Supabase (PostgreSQL)           |
| Styling    | Tailwind CSS + IBM Plex Mono    |
| Auth       | None (anonymous MVP)            |
| Hosting    | Vercel (recommended)            |

---

## Project Structure

```
skipit/
├── app/
│   ├── layout.tsx          # Root layout + Header
│   ├── globals.css         # Dark theme, fonts
│   ├── page.tsx            # Home — live signal feed
│   ├── report/
│   │   └── page.tsx        # Create report page
│   └── api/
│       └── reports/
│           └── route.ts    # GET + POST /api/reports
├── components/
│   ├── Header.tsx          # Sticky nav
│   ├── ReportCard.tsx      # Signal card with TTL colors
│   └── ReportForm.tsx      # 5-step report wizard
├── lib/
│   ├── supabase.ts         # Supabase client
│   └── utils.ts            # TTL logic, risk levels, labels
├── types/
│   └── index.ts            # All TypeScript types + enums
├── supabase/
│   └── schema.sql          # Full DB schema + RLS + sample data
└── public/
    └── manifest.json       # PWA manifest
```

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/skipit.git
cd skipit
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name, set a strong password, pick a region close to your users
3. Wait ~2 minutes for the project to provision

### 3. Run the database schema

1. In your Supabase dashboard → **SQL Editor** → **New Query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

This creates:
- All ENUM types (`app_source`, `report_type`, `issue_tag`, `status`)
- The `reports` table with all columns
- Performance indexes
- Row Level Security policies (public read/insert, no delete from client)
- 5 sample reports in Hawaii so you have data to look at immediately

### 4. Get your API keys

In Supabase dashboard → **Project Settings** → **API**:

- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the signal feed with 5 sample reports already populated.

---

## How the TTL System Works

Every report is created with `expires_at = created_at + 8 hours`.

The API filters out expired reports server-side (`expires_at > now()`).  
The frontend also applies visual risk coloring based on age:

| Age          | Risk Level | Color  | Behavior              |
|--------------|------------|--------|-----------------------|
| 0 – 2 hours  | HIGH       | 🔴 Red  | Pulsing dot animation |
| 2 – 6 hours  | MEDIUM     | 🟡 Amber | Standard display      |
| 6 – 8 hours  | LOW        | ⚫ Gray  | Faded display         |
| 8+ hours     | HIDDEN     | —      | Not returned by API   |

Content also affects risk — a `closed` report or `wait_time > 20` always escalates to higher severity.

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option B — Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. In **Environment Variables**, add both Supabase keys
4. Click **Deploy**

Vercel auto-detects Next.js — no build config needed.

---

## API Reference

### `GET /api/reports`

Returns all non-expired reports, newest first.

**Response:**
```json
{
  "reports": [
    {
      "id": "uuid",
      "created_at": "2024-01-01T10:00:00Z",
      "location_name": "Chipotle Kapolei",
      "lat": 21.3355,
      "lng": -158.0536,
      "app_source": "doordash",
      "report_type": "delay",
      "wait_time": 25,
      "issue_tags": ["order_not_ready", "long_wait"],
      "description": "Kitchen way behind.",
      "status": "likely",
      "expires_at": "2024-01-01T18:00:00Z"
    }
  ]
}
```

### `POST /api/reports`

Creates a new report.

**Request body:**
```json
{
  "location_name": "Starbucks Ala Moana",
  "lat": 21.2876,
  "lng": -157.8432,
  "app_source": "uber_eats",
  "report_type": "closed",
  "wait_time": null,
  "issue_tags": ["store_closed"],
  "description": "Doors locked, app shows open."
}
```

**Required fields:** `location_name`, `app_source`, `report_type`

**Response:** `201` with the created report object.

---

## Valid Enum Values

### `app_source`
`uber_eats` · `doordash` · `instacart` · `roadie` · `other`

### `report_type`
`delay` · `order_issue` · `road_issue` · `closed` · `mismatch` · `safety`

### `issue_tags` (multi-select)
`order_not_ready` · `order_not_found` · `store_closed` · `long_wait` · `oversized_item` · `assembled_item` · `cannot_fit_vehicle` · `duplicate_drivers` · `unsafe` · `dog` · `dark_area` · `hard_access`

---

## MVP Success Checklist

- [ ] You open the site and see active reports
- [ ] You file a report in under 10 seconds
- [ ] The report appears on the feed immediately
- [ ] Risk colors change as reports age
- [ ] Reports disappear after 8 hours
- [ ] Works on your phone, one-handed

---

## What's NOT in MVP (by design)

- No authentication
- No user profiles
- No push notifications
- No map view (list is faster to build and use)
- No AI processing of voice
- No payments or PRO features

These are all documented in the spec for v2.

---

## Roadmap (Post-MVP)

| Feature | Priority |
|---------|----------|
| Map view with signal clusters | High |
| PRO alerts (push / radius) | High |
| Signal aggregation engine | Medium |
| Voice → Whisper transcription | Medium |
| Trust score system | Medium |
| Driver flow detection | Low |
| Supabase Realtime subscription | Low |

---

## License

MIT
