# Dashboard Builder - About This Project

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

### Development Tools
- **Package Manager**: [pnpm](https://pnpm.io/) (Workspace management)
- **Build Tool**: Next.js built-in (Turbopack for dev, Webpack for production)
- **Linting**: ESLint with Next.js config
- **TypeScript**: Strict mode enabled with type checking
- **Monorepo**: pnpm workspaces
- **Dev Server**: Hot reload with watch mode

---

## 📁 Folder Structure

```
dashboard-monorepo/
├── apps/                          # Applications
│   ├── frontend/                  # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/               # Next.js App Router
│   │   │   │   ├── api/           # API route handlers
│   │   │   │   │   └── export-pbit/   # Power BI export endpoint
│   │   │   │   ├── auth/          # Authentication pages
│   │   │   │   │   ├── login/     # Login page
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── signup/    # Signup page
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── dashboard/     # Single dashboard view
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── dashboards/    # Dashboard listing page
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── design/        # Dashboard editor
│   │   │   │   │   ├── Components/    # Editor components
│   │   │   │   │   │   ├── Data/      # Data handling components
│   │   │   │   │   │   ├── Setting/   # Settings components
│   │   │   │   │   │   ├── AiGenerateSidebar.tsx
│   │   │   │   │   │   ├── CanvasEditor.tsx
│   │   │   │   │   │   ├── CanvasViewer.tsx
│   │   │   │   │   │   ├── DesignHeader.tsx
│   │   │   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   │   └── SideBarInportData.tsx
│   │   │   │   │   ├── Context/       # Canvas context
│   │   │   │   │   │   └── CanvasContext.tsx
│   │   │   │   │   ├── Elements/      # Chart/widget elements
│   │   │   │   │   │   ├── Widgets/   # 14+ widget components
│   │   │   │   │   │   ├── AddAreaChart.tsx
│   │   │   │   │   │   ├── AddBarChart.tsx
│   │   │   │   │   │   ├── AddBubbleChart.tsx
│   │   │   │   │   │   ├── AddDonutChart.tsx
│   │   │   │   │   │   ├── AddFunnelChart.tsx
│   │   │   │   │   │   ├── AddGaugeChart.tsx
│   │   │   │   │   │   ├── AddHeader.tsx
│   │   │   │   │   │   ├── AddHistogram.tsx
│   │   │   │   │   │   ├── AddKpiChart.tsx
│   │   │   │   │   │   ├── AddLineChart.tsx
│   │   │   │   │   │   ├── AddPieChart.tsx
│   │   │   │   │   │   ├── AddScatterChart.tsx
│   │   │   │   │   │   ├── AddTreemap.tsx
│   │   │   │   │   │   ├── AddWaterfallChart.tsx
│   │   │   │   │   │   └── SidebarList.tsx
│   │   │   │   │   ├── [id]/         # Edit existing dashboard
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── page.tsx      # New dashboard page
│   │   │   │   │   └── error.tsx     # Error boundary
│   │   │   │   ├── preview/       # Dashboard preview/view
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── favicon.ico
│   │   │   │   ├── globals.css    # Global styles + Tailwind
│   │   │   │   ├── layout.tsx     # Root layout with providers
│   │   │   │   ├── page.tsx       # Home page (redirects to /dashboards)
│   │   │   │   └── providers.tsx  # React Query provider
│   │   │   ├── components/        # Shared components
│   │   │   │   ├── AuthDialog.tsx     # Authentication modal
│   │   │   │   ├── ConfirmDialog.tsx  # Confirmation dialogs
│   │   │   │   ├── DashboardCard.tsx  # Dashboard preview card
│   │   │   │   ├── ProfileDropdown.tsx # User profile menu
│   │   │   │   ├── SaveDialog.tsx     # Save dashboard dialog
│   │   │   │   ├── ThemeToggle.tsx    # Theme switcher
│   │   │   │   └── dashboard/         # Dashboard-specific components
│   │   │   ├── contexts/          # React contexts
│   │   │   │   ├── AuthContext.tsx    # Authentication state + hooks
│   │   │   │   └── ThemeContext.tsx   # Theme state (dark/light/system)
│   │   │   └── types/             # TypeScript types
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   │
│   ├── api/                       # Hono backend API
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   └── supabase.ts    # Supabase client
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts        # JWT auth middleware
│   │   │   ├── routes/
│   │   │   │   ├── admin.ts       # Admin endpoints
│   │   │   │   ├── auth.ts        # Auth (login/register/me/refresh)
│   │   │   │   ├── dashboards.ts  # Dashboard CRUD
│   │   │   │   └── data-sources.ts    # Data source management
│   │   │   └── index.ts           # Main server entry + CORS
│   │   ├── .env                   # Environment variables
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── admin/                     # Admin panel (optional)
│       ├── package.json
│       └── ...
│
├── packages/                      # Shared packages
│   ├── shared-types/              # TypeScript types
│   │   ├── src/
│   │   │   ├── api.ts             # API response types
│   │   │   ├── dashboard.ts       # Dashboard types
│   │   │   ├── data-source.ts     # Data source types
│   │   │   ├── user.ts            # User types
│   │   │   ├── widget.ts          # Widget types
│   │   │   └── index.ts           # Exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api-client/                # API client with React Query hooks
│       ├── src/
│       │   └── index.ts           # ApiClient class + hooks
│       ├── package.json
│       └── tsconfig.json
│
├── supabase/                      # Database migrations
│   └── migrations/
│       ├── 001_create_users_table.sql
│       ├── 002_create_dashboards_table.sql
│       └── 003_create_data_sources_table.sql
│
├── scripts/                       # Build/deployment scripts
├── node_modules/                  # Dependencies (workspace root)
├── package.json                   # Root package.json
├── pnpm-workspace.yaml            # pnpm workspace config
├── pnpm-lock.yaml                 # Lock file
├── README.md                      # Quick start guide
└── AboutProject.md                # This file
```

---

## 🗄️ Database Schema

### Tables

#### `users`
Extends Supabase `auth.users` with additional profile information.

| Column       | Type          | Description                    |
|------------- |-------------- |------------------------------- |
| id           | UUID (PK)     | References auth.users(id)      |
| email        | TEXT          | User email (unique)            |
| name         | TEXT          | User display name              |
| role         | TEXT          | User role (user/admin)         |
| created_at   | TIMESTAMPTZ   | Account creation timestamp     |
| updated_at   | TIMESTAMPTZ   | Last update timestamp          |

#### `dashboards`
Stores dashboard configurations and widgets.

| Column       | Type          | Description                    |
|------------- |-------------- |------------------------------- |
| id           | UUID (PK)     | Dashboard ID                   |
| user_id      | UUID (FK)     | Owner user ID                  |
| name         | TEXT          | Dashboard name                 |
| widgets      | JSONB         | Array of widget configurations |
| is_public    | BOOLEAN       | Public visibility flag         |
| created_at   | TIMESTAMPTZ   | Creation timestamp             |
| updated_at   | TIMESTAMPTZ   | Last update timestamp          |

#### `data_sources`
Stores user data source connections.

| Column       | Type          | Description                    |
|------------- |-------------- |------------------------------- |
| id           | UUID (PK)     | Data source ID                 |
| user_id      | UUID (FK)     | Owner user ID                  |
| name         | TEXT          | Data source name               |
| type         | TEXT          | Type (csv, sql, api)           |
| config       | JSONB         | Connection configuration       |
| created_at   | TIMESTAMPTZ   | Creation timestamp             |
| updated_at   | TIMESTAMPTZ   | Last update timestamp          |

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- Users can read/update their own data
- Public dashboards are readable by anyone
- Service role (API) has full access
- Admin role has elevated permissions

---

## 🔐 Authentication Flow

1. **User Registration** (`POST /api/auth/register`)
   - Creates auth.users record via Supabase
   - Creates public.users record with profile data
   - Returns JWT access token + refresh token with 5-day expiration
   - Tokens automatically stored in localStorage

2. **User Login** (`POST /api/auth/login`)
   - Validates credentials via Supabase Auth
   - Returns JWT access token + refresh token + expiration timestamp
   - Frontend stores tokens in localStorage (`token`, `refreshToken`, `expiresAt`)
   - AuthContext automatically fetches user data using `/api/auth/me`

3. **Token Management**
   - Tokens stored in localStorage for persistence across sessions
   - Auto-refresh mechanism triggered 1 hour before token expiration
   - Refresh endpoint: `POST /api/auth/refresh` (uses refreshToken)
   - Invalid/expired tokens automatically cleared from storage
   - Token validation on app initialization

4. **Protected Routes**
   - Frontend: `AuthContext` provides authentication state and `isAuthenticated` flag
   - Backend: JWT auth middleware validates tokens via `Authorization: Bearer <token>` header
   - Protected components use `ProtectedRoute` wrapper
   - API client automatically injects token into all authenticated requests

---

## 📊 Chart/Widget Types

The application supports 14+ chart types:

1. **Bar Chart** - Horizontal/vertical bars
2. **Column Chart** - Vertical columns
3. **Line Chart** - Time series and trends
4. **Area Chart** - Filled line charts
5. **Pie Chart** - Circular proportions
6. **Donut Chart** - Hollow pie chart
7. **Scatter Plot** - X-Y point data
8. **Bubble Chart** - 3D scatter with size
9. **Funnel Chart** - Conversion funnels
10. **Gauge Chart** - Speedometer/KPI
11. **KPI Card** - Single metric display
12. **Treemap** - Hierarchical rectangles
13. **Waterfall Chart** - Cumulative changes
14. **Histogram** - Distribution analysis

Each widget supports:
- Custom data sources
- Color customization
- Label configuration
- Real-time updates
- Responsive sizing

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 8+
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

**Frontend:**
```bash
pnpm --filter @dashboard/frontend dev        # Development server (Next.js)
pnpm --filter @dashboard/frontend build      # Production build
pnpm --filter @dashboard/frontend start      # Start production server
pnpm --filter @dashboard/frontend lint       # Run ESLint
pnpm --filter @dashboard/frontend type-check # TypeScript type checking
```

**API:**
```bash
pnpm --filter @dashboard/api dev             # Development with watch mode (tsx)
pnpm --filter @dashboard/api build           # TypeScript build
pnpm --filter @dashboard/api start           # Start production server
pnpm --filter @dashboard/api type-check      # TypeScript type checking
```

### Project Conventions

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables, PascalCase for components/types
- **File Structure**: Feature-based organization
- **Styling**: Tailwind utility classes (avoid inline styles)
- **State**: Context for global state, local state for components
- **API**: RESTful conventions, JSON responses

---

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info (protected)

### Dashboards
- `GET /api/dashboards` - List user's dashboards (protected)
- `GET /api/dashboards/:id` - Get single dashboard (protected)
- `POST /api/dashboards` - Create new dashboard (protected)
- `PUT /api/dashboards/:id` - Update dashboard (protected)
- `DELETE /api/dashboards/:id` - Delete dashboard (protected)

### Data Sources
- `GET /api/data-sources` - List user's data sources (protected)
- `POST /api/data-sources` - Create data source (protected)
- `DELETE /api/data-sources/:id` - Delete data source (protected)

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `PUT /api/admin/users/:id/role` - Update user role (admin only)

---

## 🎨 UI Components

### Shared Components (`src/components/`)
- **AuthDialog** - Authentication modal for login/signup
- **ConfirmDialog** - Radix UI confirmation dialogs for destructive actions (delete, etc.)
- **SaveDialog** - Modal for saving dashboard with name input
- **ProfileDropdown** - User profile menu with logout functionality
- **ThemeToggle** - Dark/Light/System mode toggle button
- **DashboardCard** - Dashboard preview cards with metadata and actions

### Design/Editor Components (`src/app/design/Components/`)
- **CanvasEditor** - Main drag-drop canvas for editing dashboards
- **CanvasViewer** - Read-only dashboard viewer component
- **Sidebar** - Widget selection panel for adding elements
- **DesignHeader** - Editor toolbar with save, theme toggle, and navigation
- **AiGenerateSidebar** - AI-powered chart generation sidebar
- **ProtectedRoute** - Authentication wrapper for protected pages
- **SideBarInportData** - Data import/source management sidebar

### Chart Components (`src/app/design/Elements/`)
All chart components located in the Elements directory, each supporting full customization

---

## 📦 Dependencies

### Production Dependencies (Frontend)
- **React ecosystem**: react@19.1, react-dom@19.1, next@15.4.4
- **UI Libraries**: @radix-ui/react-dialog, @radix-ui/react-icons, lucide-react@0.532, react-icons@5.5
- **Charts**: chart.js@4.5, apexcharts@5.3, recharts@3.1, @nivo/scatterplot@0.99, react-gauge-chart@0.5, chartjs-chart-funnel@4.2, chartjs-plugin-datalabels@2.2
- **State Management**: zustand@5.0.7, @tanstack/react-query@5.17
- **Canvas/Layout**: fabric@6.7, react-grid-layout@1.5, react-resizable@3.0, react-sizeme@3.0
- **Utilities**: date-fns@4.1, clsx@2.1, uuid@11.1, papaparse@5.5, jszip@3.10, react-hot-toast@2.6
- **Supabase**: @supabase/supabase-js@2.39, @supabase/auth-helpers-nextjs@0.8.7

### Production Dependencies (Backend)
- **Server**: hono@4.0, @hono/node-server@1.19.9
- **Database**: @supabase/supabase-js@2.39

### Dev Dependencies
- TypeScript@5.3.3, ESLint@9
- Tailwind CSS@4, @tailwindcss/postcss@4
- @types/react@19.2.9, @types/node@20.10
- tsx@4.7 (TypeScript execution)

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Find process using port 3000 or 4000 (PowerShell)
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object OwningProcess
Get-NetTCPConnection -LocalPort 4000 -State Listen | Select-Object OwningProcess

# Kill the process (replace PID)
Stop-Process -Id <PID> -Force

# Alternative using netstat
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### Supabase Connection Issues
- Verify `.env` and `.env.local` files have correct Supabase credentials
- Check Supabase project is active and not paused
- Verify RLS (Row Level Security) policies allow your operations
- Ensure you're using the correct keys (anon key for frontend, service role for backend)
- Check Supabase dashboard for any rate limiting

### TypeScript/Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Clear Next.js cache
rm -rf apps/frontend/.next
rm -rf apps/frontend/.turbo

# Type check to see all errors
pnpm --filter @dashboard/frontend type-check
pnpm --filter @dashboard/api type-check
```

### Authentication Issues
- Clear localStorage: Open DevTools → Application → Local Storage → Clear
- Check token expiration in localStorage (`expiresAt`)
- Verify API_URL environment variable matches your backend URL
- Check Network tab in DevTools for 401 errors

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

### Environment Variables
Ensure all env vars are set in production:
- Supabase URL and keys
- API URL
- CORS origins

---

## 📝 License

[Add your license here]

---

## 👥 Team

[Add team members/contributors]

---

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact: [your-email]

---

## 🔄 Recent Updates

### **February 9, 2026**: Major UI Redesign & Stability Improvements
- **Canva-Inspired Dashboard UI**: Complete redesign of `/dashboards` page with gradient backgrounds, modern card layouts, and category-based organization
- **Custom Dialog System**: Replaced browser default dialogs with Radix UI-based custom dialogs (ConfirmDialog, SaveDialog, AuthDialog)
- **Theme System Enhancements**: Implemented comprehensive dark/light/system theme support with persistent storage and seamless toggling
- **Profile Management**: Added ProfileDropdown component with user menu and logout functionality
- **Dashboard Card Components**: Created reusable DashboardCard component with metadata display and action buttons

### **February 4, 2026**: Dashboard Import & Component Fixes
- Fixed `Module not found` errors for dashboard components
- Corrected import paths for `DashboardCard` and related components
- Ensured all dashboard-related components are properly exported and functional
- Resolved component naming inconsistencies

### **February 2, 2026**: Authentication Debugging
- Fixed 401 Unauthorized errors on `/api/auth/me` endpoint
- Debugged token validation and transmission issues
- Improved token refresh mechanism for persistent authentication
- Enhanced error handling for expired/invalid tokens

### **February 1, 2026**: Dashboard UI Modernization
- Implemented Canva-like design aesthetic for dashboard management
- Fixed hydration errors in Next.js components
- Improved date formatting using date-fns
- Added responsive layouts for mobile and desktop

### **January 29, 2026**: AI-Powered Features
- **AI Generate Sidebar**: Created `AiGenerateSidebar.tsx` for AI-powered chart generation
- Integrated AI capabilities into the design workflow

### **January 27, 2026**: Canvas Viewer & Type Safety
- **Dashboard Viewer Migration**: Migrated dashboard viewing functionality from legacy project to monorepo
- Created read-only `CanvasViewer` component for dashboard display
- Enhanced `CanvasContext` to expose dashboard metadata
- **TypeScript Improvements**: Resolved implicit 'any' type errors across the codebase
- Fixed missing property errors in `SidebarList.tsx`
- Refined dashboard types for better type safety
- Fixed all outstanding TypeScript compilation errors

### **January 27, 2026**: Project Foundation
- Initial monorepo setup with pnpm workspaces
- Configured Next.js 15 with App Router
- Set up Hono API server with JWT authentication
- Integrated Supabase for database and auth
- Created shared packages architecture (shared-types, api-client)
- Implemented dashboard CRUD operations
- Added 14+ chart/widget types
- Set up TanStack Query for server state management
- Configured parallel/individual dev server scripts
- Resolved `EADDRINUSE` port conflicts
- Fixed email rate limit issues with Supabase
- Implemented dashboard saving and listing functionality

---

**Last Updated**: February 9, 2026
