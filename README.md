# THE ARENA — web app

Real Next.js + Supabase + API-Sports app, derived from the design prototype in this project.

What this gives you out of the box:
- Live scores grid (football + cricket) on the home page
- Match detail page with live score + status
- Email/password auth via Supabase
- "Follow team" API endpoints (UI to be built later)
- Server-side data fetching — your API-Sports key never reaches the browser
- 30-second caching so you don't burn through your free quota

You will be the one who deploys it. This README is the step-by-step.

---

## STEP 0 — Install the tools you need (one-time, ~30 min)

You need these on your computer:

1. **Node.js 20+** — https://nodejs.org/  → click "LTS"
2. **Git** — https://git-scm.com/downloads
3. **A code editor** — https://code.visualstudio.com/ (VS Code, free)

Verify it worked. Open a terminal (Mac: Terminal app · Windows: PowerShell) and run:

```bash
node --version    # should print v20.x.x or higher
npm --version     # should print 10.x.x or higher
git --version     # should print git version 2.x.x
```

If any of those fail, fix that one before moving on.

---

## STEP 1 — Get this code onto your computer

Copy the `webapp/` folder out of this project (download it, drag it onto your Desktop). Open a terminal and `cd` into it:

```bash
cd ~/Desktop/webapp
```

Install dependencies (this downloads ~300MB into `node_modules/` — first time takes a few minutes):

```bash
npm install
```

---

## STEP 2 — Create your accounts (~15 min)

You need three accounts. All three have a free tier that's enough for v1.

### 2a. Supabase (database + login)
1. Go to https://supabase.com → "Start your project" → sign up with GitHub or email
2. Click "New project"
3. Pick any name (e.g. `the-arena`), set a database password (**save it**), pick a region near your users (Mumbai for India)
4. Wait ~2 min for it to provision
5. Once it's ready, go to **Settings → API**. Copy these two values into a notepad:
   - `Project URL` (looks like `https://xxxxx.supabase.co`)
   - `anon public` key (a long string starting with `eyJ...`)

### 2b. API-Sports (live data)
1. Go to https://dashboard.api-football.com/register → sign up
2. After verifying your email, go to your dashboard → "My Account" → copy your **API key**

The free tier gives you 100 requests/day, which is enough to test. Each page load uses ~2 requests (1 football, 1 cricket).

### 2c. GitHub + Vercel (for deployment, later)
You don't need these yet — we'll get them in Step 6.

---

## STEP 3 — Configure your local copy

In the `webapp/` folder, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

(On Windows PowerShell: `Copy-Item .env.example .env.local`)

Open `.env.local` in VS Code and paste your three values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
API_SPORTS_KEY=abc123...
```

Save the file.

---

## STEP 4 — Set up the database schema

1. Go to your Supabase project → **SQL Editor** → **New query**
2. Open `webapp/supabase/schema.sql` in VS Code, copy the whole file
3. Paste it into the Supabase SQL editor → click **Run**
4. You should see "Success. No rows returned." — your `followed_teams` and `user_prefs` tables are now live with row-level security

You can confirm by going to **Table Editor** → both tables should appear in the left sidebar.

---

## STEP 5 — Run it locally

Back in your terminal, in the `webapp/` folder:

```bash
npm run dev
```

You should see:
```
   ▲ Next.js 14.2.15
   - Local:        http://localhost:3000
   ✓ Ready in 2s
```

Open http://localhost:3000 in your browser.

You should see the live scores grid. If no matches are currently live in football or cricket, the page will say "No matches are live right now." That's expected — try again during a match window.

**Test the auth flow:**
1. Click "Sign in" (top right) → "No account? Create one"
2. Sign up with any email + password (min 6 chars)
3. Check your email — Supabase sends a confirmation link
4. Click the link, come back, sign in
5. Your email should appear in the top right

---

## STEP 6 — Deploy to the internet

### 6a. Push to GitHub
1. Sign up at https://github.com if you haven't
2. Create a new repository — name it `the-arena`, **Private**, don't add a README
3. In your terminal, in the `webapp/` folder:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/the-arena.git
git push -u origin main
```

(If git asks you to log in, GitHub now wants a "Personal Access Token" instead of a password — generate one at https://github.com/settings/tokens, give it `repo` scope.)

### 6b. Deploy via Vercel
1. Go to https://vercel.com → "Sign up with GitHub"
2. Click "Add New… → Project"
3. Pick your `the-arena` repo → "Import"
4. Before clicking Deploy, expand **Environment Variables** and paste in the same three values from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `API_SPORTS_KEY`
5. Click **Deploy**. Wait ~2 min.

You'll get a public URL like `https://the-arena-abc123.vercel.app`. Open it. Your app is live.

### 6c. Tell Supabase about your live URL
Auth confirmation links need to know where to redirect. In Supabase:
- **Authentication → URL Configuration**
- Set "Site URL" to your Vercel URL (e.g. `https://the-arena-abc123.vercel.app`)
- Add the same URL to "Redirect URLs"

---

## STEP 7 — From here, what to add next

This v1 is intentionally lean. The next features (in priority order):

| What | Where to start |
|---|---|
| Cricket match detail page | `lib/sportsApi.ts` → add `getCricketGame(id)`, then update `app/match/[id]/page.tsx` |
| "Follow" button on match cards | New client component → calls `POST /api/follow` |
| News feed | New page `app/news/page.tsx` — pick a news API (NewsData.io has a free tier) |
| Standings table | `lib/sportsApi.ts` → `getStandings(leagueId)` → new `app/standings/page.tsx` |
| Push notifications for goals | Supabase Edge Function + Web Push API |
| Custom domain | Vercel → Project → Settings → Domains |

When you're ready for any of these, ask me — I'll write the code.

---

## Common issues

**`npm run dev` says "API_SPORTS_KEY undefined"**
→ You forgot to create `.env.local`, or you didn't restart the dev server after editing it. Stop with Ctrl+C and run `npm run dev` again.

**"Couldn't load live data" on the home page**
→ Either your API-Sports key is wrong, or you've hit the 100 req/day cap. Check your usage at dashboard.api-football.com.

**Email confirmation never arrives**
→ Check spam. Supabase free tier sends through a low-priority pool. Or in Supabase → Authentication → Providers → Email → temporarily disable "Confirm email" while testing.

**Vercel deploy fails with type errors**
→ Run `npm run build` locally first to see the same error in your terminal. Fix it there, push again.
