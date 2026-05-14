# AI-Powered Business Intelligence (BI) Dashboard Builder

## 📋 Project Overview

**Dashboard Builder** is a modern, full-stack web application built as a monorepo that allows users to create interactive data visualization dashboards with drag-and-drop widgets, real-time chart editing, and data source integrations. The application provides a powerful canvas editor similar to Canva/Figma but specifically designed for building analytical dashboards.

### Key Features

✅ **Interactive Dashboard Editor**
- Drag-and-drop canvas with grid layout
- Real-time widget positioning and resizing
- 14+ chart types (Bar, Line, Pie, Donut, Area, Scatter, Bubble, Funnel, Gauge, KPI, Treemap, Waterfall, Histogram)
- AI-powered chart generation sidebar
- Data source integration (CSV, SQL databases)

✅ **Authentication & User Management**
- JWT-based authentication with 5-day token expiration
- Auto-refresh tokens (refreshes 1 hour before expiration)
- User roles (user, admin)
- Secure session management with localStorage
- Protected routes with `ProtectedRoute` component
- Auth dialog for seamless login/signup

✅ **Dashboard Management**
- Create, edit, delete, and view dashboards
- Save dashboard configurations to Supabase
- Public/private dashboard sharing
- Dashboard preview cards with metadata
- Multiple dashboard views: `/dashboards` (list), `/design` (edit), `/preview` (view)

✅ **Modern UI/UX**
- Dark/Light/System theme support with persistent storage
- Fully responsive design (mobile-friendly)
- Custom Radix UI dialogs (ConfirmDialog, SaveDialog, AuthDialog)
- Profile dropdown menu with logout
- Theme toggle component
- Canva-inspired dashboard listing page

---

## 🏗️ Tech Stack

### Frontend (`apps/frontend`)
- **Framework**: [Next.js 15.4.4](https://nextjs.org/) with App Router (React 19.1)
- **Language**: TypeScript 5.3+
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: 
  - [Zustand](https://github.com/pmndrs/zustand) v5.0.7 (Canvas state)
  - [TanStack Query](https://tanstack.com/query) v5.17 (Server state, data fetching)
  - React Context (Auth, Theme)
- **UI Components**:
  - [Radix UI](https://www.radix-ui.com/) (Dialogs, primitives)
  - [Lucide React](https://lucide.dev/) v0.532 (Icons)
  - [React Icons](https://react-icons.github.io/react-icons/) v5.5 (Additional icons)
- **Charts & Visualization**:
  - [Chart.js](https://www.chartjs.org/) v4.5 + React-ChartJS-2 v5.3
  - [ApexCharts](https://apexcharts.com/) v5.3 + React-ApexCharts v1.7
  - [Recharts](https://recharts.org/) v3.1
  - [Nivo](https://nivo.rocks/) v0.99 (Scatterplot)
  - React Gauge Chart v0.5
  - chartjs-chart-funnel v4.2 (Funnel charts)
  - chartjs-plugin-datalabels v2.2 (Chart labels)
- **Canvas & Layout**:
  - [Fabric.js](http://fabricjs.com/) v6.7 (Canvas manipulation)
  - [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout) v1.5 (Grid system)
  - React Resizable v3.0
  - React SizeMe v3.0 (Component sizing)
- **Utilities**:
  - [date-fns](https://date-fns.org/) v4.1 (Date formatting)
  - [clsx](https://github.com/lukeed/clsx) v2.1 (Conditional classnames)
  - [uuid](https://github.com/uuidjs/uuid) v11.1 (ID generation)
  - [PapaParse](https://www.papaparse.com/) v5.5 (CSV parsing)
  - [JSZip](https://stuk.github.io/jszip/) v3.10 (ZIP file handling)
  - [react-hot-toast](https://react-hot-toast.com/) v2.6 (Notifications)

### Backend (`apps/api`)
- **Framework**: [Hono](https://hono.dev/) v4.0 (Fast web framework)
- **Runtime**: Node.js with [tsx](https://github.com/esbuild-kit/tsx) v4.7 (TypeScript execution)
- **Language**: TypeScript 5.3+
- **HTTP Server**: [@hono/node-server](https://github.com/honojs/node-server) v1.19.9
- **API Architecture**: RESTful API
- **CORS**: Built-in Hono CORS middleware
- **Environment**: Node.js `--env-file` flag for environment variables

### Database & Authentication
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth (JWT tokens)
- **ORM/Client**: [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) v2.39
- **Auth Helpers**: @supabase/auth-helpers-nextjs v0.8.7

### Shared Packages
- **`packages/shared-types`**: TypeScript type definitions shared across frontend and backend (User, Dashboard, Widget, DataSource, API types)
- **`packages/api-client`**: Type-safe API client with TanStack Query hooks for all API operations

---

## 📁 Folder Structure

```
dashboard-monorepo/
├── apps/                          # Applications
│   ├── frontend/                  # Next.js frontend application
│   │   └── src/                   # Source code (app, components, contexts)
│   │
│   └── api/                       # Hono backend API
│       └── src/                   # Source code (routes, middleware)
│
├── packages/                      # Shared packages
│   ├── shared-types/              # TypeScript types
│   └── api-client/                # API client with React Query hooks
│
├── supabase/                      # Database migrations
├── scripts/                       # Build/deployment scripts
├── package.json                   # Root package.json
└── pnpm-workspace.yaml            # pnpm workspace config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- [pnpm](https://pnpm.io/) 8+
- Supabase account (free tier works fine)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dashboard-monorepo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   **Frontend** (`apps/frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **Backend** (`apps/api/.env`):
   ```env
   PORT=4000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run database migrations**
   - Go to your Supabase Dashboard → SQL Editor
   - Run migrations from `supabase/migrations/` in order (001, 002, 003)
   - Alternatively, use Supabase CLI if installed

5. **Start development servers**

   **All services (parallel - recommended):**
   ```bash
   pnpm dev
   ```
   This starts both frontend (http://localhost:3000) and API (http://localhost:4000)

   **Individual services:**
   ```bash
   # Frontend only
   pnpm frontend-dev

   # API only
   pnpm api-dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - API Health Check: http://localhost:4000/health

---

## 🛠️ Development

### Available Scripts

**Root level (pnpm workspace):**
```bash
pnpm dev              # Start all services in parallel (frontend + api)
pnpm frontend-dev     # Start frontend only (port 3000)
pnpm api-dev          # Start API server only (port 4000)
pnpm build            # Build all packages
pnpm lint             # Lint all packages
```

---

## 🐛 Troubleshooting

### Port Already in Use
If you see `Error: listen EADDRINUSE: address already in use :::3000`, it means a process is already using port 3000.

**Fix (Windows/PowerShell):**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /F /PID <PID>
```

### Supabase Connection Issues
- Verify `.env` and `.env.local` files have correct Supabase credentials
- Check Supabase project is active and not paused
- Verify RLS (Row Level Security) policies allow your operations
- Ensure you're using the correct keys (anon key for frontend, service role for backend)

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
# Build for production
pnpm --filter @dashboard/frontend build

# Start production server
pnpm --filter @dashboard/frontend start
```

### Backend (Any Node.js hosting)
```bash
# Build TypeScript
pnpm --filter @dashboard/api build

# Start production server
pnpm --filter @dashboard/api start
```
