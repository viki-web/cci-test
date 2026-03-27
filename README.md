# User Management Dashboard

A responsive admin dashboard for managing users — built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**. Deployable to **Cloudflare Pages** as a static SPA.

---

## Features

- **User table** — Name, Email, Role, Status, Last Login, Activity Level, Groups/Permissions
- **Expandable row panel** — Recent activity logs, group assignments, security settings (2FA, password age, session timeout)
- **Search & filter** — Live search by name or email; filter by role and status
- **Add / Edit user modal** — Card-based role selector, status toggle, group checkbox grid, form validation
- **Stats bar** — Total users, active count, admin count (reactive)
- **Unit tests** — 46 tests across all UserForm scenarios via Vitest + Testing Library

---

## Tech Stack

| Layer | Library |
|---|---|
| UI Framework | React 19 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Testing | Vitest + @testing-library/react |
| Deployment | Cloudflare Pages |

---

## Project Structure

```
src/
├── components/
│   ├── Modal.tsx            # Accessible modal wrapper (ESC + backdrop close)
│   ├── StatusBadge.tsx      # Active / Inactive pill badge
│   ├── UserDetailPanel.tsx  # Expandable row panel (activity, groups, security)
│   ├── UserForm.tsx         # Add / Edit form with validation
│   └── UserTable.tsx        # Table with expand/collapse rows
├── data/
│   └── mockUsers.ts         # Seed data + ALL_GROUPS constant
├── test/
│   ├── setup.ts             # jest-dom matchers
│   └── UserForm.test.tsx    # 46 unit tests
├── types/
│   └── user.ts              # User, UserFormData, Role, Status, ActivityLevel types
├── App.tsx                  # Dashboard shell — state, filters, modal orchestration
└── main.tsx                 # Entry point
public/
├── _redirects               # Cloudflare Pages SPA fallback
└── _headers                 # Security + cache headers
wrangler.toml                # Cloudflare Pages build config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

### Start dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
```

Output goes to `dist/`. Preview the production build locally:

```bash
npm run preview
```

---

## Running Tests

```bash
# Watch mode (re-runs on file changes)
npm test

# Single run with coverage report
npm run test:coverage
```

The test suite covers **UserForm** across 8 describe blocks:

| Suite | Tests |
|---|---|
| Rendering (add / edit mode) | 5 |
| Edit mode pre-fill | 6 |
| Validation — empty submission | 3 |
| Validation — invalid email (4 formats) | 5 |
| Validation — valid submission | 2 |
| Role selection | 5 |
| Status selection | 3 |
| Groups & Permissions | 10 |
| Activity Level | 4 |
| Cancel button | 2 |
| Error clearing on input | 1 |

---

## Deploying to Cloudflare Pages

### Option A — Wrangler CLI

1. Install Wrangler globally (if not already):
   ```bash
   npm install -g wrangler
   ```

2. Authenticate:
   ```bash
   wrangler login
   ```

3. Build and deploy:
   ```bash
   npm run build
   wrangler pages deploy dist
   ```

### Option B — Cloudflare Dashboard (Git integration)

1. Push this repo to GitHub / GitLab.
2. Go to [Cloudflare Pages](https://pages.cloudflare.com) → **Create a project** → **Connect to Git**.
3. Select your repository and set:

   | Setting | Value |
   |---|---|
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node.js version | `18` (set in Environment Variables: `NODE_VERSION = 18`) |

4. Click **Save and Deploy**.

Every push to the default branch triggers a new deployment. Pull requests get automatic preview URLs.

---

## How It Works

### SPA routing (`public/_redirects`)

Cloudflare Pages serves static files. Without a redirect rule, any URL other than `/` returns a 404. The `_redirects` file routes all requests back to `index.html`, letting React handle navigation client-side:

```
/*  /index.html  200
```

### Security & caching (`public/_headers`)

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  ...

/assets/*
  Cache-Control: public, max-age=31536000, immutable   ← Vite hashed assets cached forever

/*.html
  Cache-Control: no-cache, no-store, must-revalidate   ← HTML always revalidated
```

### `wrangler.toml`

Stores the project name and build output directory so `wrangler pages deploy` works without flags:

```toml
name = "cci-test"
pages_build_output_dir = "dist"
compatibility_date = "2026-03-27"
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest in watch mode |
| `npm run test:coverage` | Run tests with V8 coverage report |
