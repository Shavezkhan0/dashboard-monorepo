# Dashboard Monorepo

This documentation explains how to setup, install, and run the projects within this monorepo.

## Prerequisites

- [pnpm](https://pnpm.io/) (version 8 or later recommended)
- Node.js (compatible with Next.js 14+)

## Installation

Install dependencies for all projects in the workspace:

```bash
pnpm install
```

## Running the Project

### Quick Start (Frontend)

To start the main dashboard frontend:

```bash
pnpm dev
# OR
pnpm --filter @dashboard/frontend dev
```

The application will be available at `http://localhost:3000`.

### Running Individual Projects

This monorepo uses `pnpm` filtering to run scripts for specific packages.

#### Frontend Application
**Package Name:** `@dashboard/frontend`

```bash
# Development
pnpm --filter @dashboard/frontend dev

# Build
pnpm --filter @dashboard/frontend build

# Start Production Server
pnpm --filter @dashboard/frontend start
```

#### API Service
**Package Name:** `@dashboard/api`

```bash
# Development
pnpm --filter @dashboard/api dev

# Build
pnpm --filter @dashboard/api build
```

The API service runs on `http://localhost:3000` (by default, may conflict if running both; verify port config).

## Project Structure

- **apps/**: Application source code
  - `frontend`: Next.js dashboard application
  - `api`: Hono/Node.js API service
  - `admin`: Admin panel
- **packages/**: Shared libraries
  - `shared-types`: TypeScript definitions shared between apps
  - `api-client`: Typed API client

## Troubleshooting

### Port Conflicts (EADDRINUSE)
If you see `Error: listen EADDRINUSE: address already in use :::3000`, it means a process is already using port 3000.

**Fix:**
1. Find the process ID (PID):
   ```powershell
   netstat -ano | findstr :3000
   ```
2. Kill the process:
   ```powershell
   taskkill /F /PID <PID>
   ```
