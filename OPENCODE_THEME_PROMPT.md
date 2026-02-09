# Theme Toggle Integration - OpenCode Implementation Prompt

## Objective
Move the theme toggle (Dark/Light/System mode switcher) from the top navbar into the ProfileDropdown menu, fix toggle functionality, and ensure theme works across all pages and widgets throughout the application.

## Current Implementation

### Theme Context (Already Working ✅)
**File:** `apps/frontend/src/contexts/ThemeContext.tsx`

The theme system is already implemented with:
- ✅ Three modes: `light`, `dark`, `system`
- ✅ LocalStorage persistence (`dashboard-theme` key)
- ✅ System theme detection via `matchMedia`
- ✅ Automatic dark class toggle on `<html>` element
- ✅ `toggleTheme()` cycles through: light → dark → system → light

**Context API:**
```typescript
{
  theme: 'light' | 'dark' | 'system',
  resolvedTheme: 'light' | 'dark',
  setTheme: (theme) => void,
  toggleTheme: () => void
}
```

### Current ThemeToggle Component
**File:** `apps/frontend/src/components/ThemeToggle.tsx`

**Current Behavior:**
- Button with icon (Sun/Moon/Monitor)
- Calls `toggleTheme()` on click
- Cycles: Light → Dark → System → Light
- Shows tooltip for next mode

**Current Locations (REMOVE FROM THESE):**
1. ❌ `apps/frontend/src/app/page.tsx` - Line 118
2. ❌ `apps/frontend/src/app/dashboards/page.tsx` - Line 121
3. ❌ `apps/frontend/src/app/design/Components/DesignHeader.tsx` - Line 414
4. ❌ Referenced in `apps/frontend/src/app/design/Components/Sidebar.tsx` - Line 25

### ProfileDropdown Component
**File:** `apps/frontend/src/components/ProfileDropdown.tsx`

**Current Structure:**
- Circular avatar with initials
- Dropdown with user info (name, email)
- Menu items:
  - "Account Settings" (no action)
  - "Logout" (calls `logout()`)

**Need to Add:**
- Theme selector menu items (3 options: Light, Dark, System)
- Visual indicator for currently selected theme
- Icons for each theme option

## Required Changes

### 1. Update ProfileDropdown Component

**File:** `apps/frontend/src/components/ProfileDropdown.tsx`

**Add Theme Menu Section:**

```typescript
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, User, Sun, Moon, Monitor, Check } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext'; // ← ADD THIS

interface ProfileDropdownProps {
  userName?: string;
  userEmail?: string;
}

export default function ProfileDropdown({ userName, userEmail }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuthContext();
  const { theme, setTheme } = useTheme(); // ← ADD THIS

  // ... existing code ...

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} { /* avatar button */ }>
        {/* ... existing avatar ... */}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              {/* ... existing user info ... */}
            </div>

            {/* Theme Selection Section - ADD THIS */}
            <div className="py-1 border-b border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Theme
              </div>
              
              <button
                onClick={() => setTheme('light')}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <Sun size={16} className="mr-3" />
                  Light
                </div>
                {theme === 'light' && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
              </button>

              <button
                onClick={() => setTheme('dark')}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <Moon size={16} className="mr-3" />
                  Dark
                </div>
                {theme === 'dark' && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
              </button>

              <button
                onClick={() => setTheme('system')}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <Monitor size={16} className="mr-3" />
                  System
                </div>
                {theme === 'system' && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
              </button>
            </div>

            {/* Menu Items - EXISTING */}
            <div className="py-1">
              <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <User size={16} className="mr-3" />
                Account Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={16} className="mr-3" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

### 2. Remove ThemeToggle from All Pages

**Files to Update:**

#### `apps/frontend/src/app/page.tsx`
- **Remove:** Line 13 - `import ThemeToggle from '@/components/ThemeToggle';`
- **Remove:** Line 118 - `<ThemeToggle />` component

#### `apps/frontend/src/app/dashboards/page.tsx`
- **Remove:** Line 14 - `import ThemeToggle from '@/components/ThemeToggle';`
- **Remove:** Line 121 - `<ThemeToggle />` component

#### `apps/frontend/src/app/design/Components/DesignHeader.tsx`
- **Remove:** Line 13 - `import ThemeToggle from '@/components/ThemeToggle';`
- **Remove:** Line 414 - `<ThemeToggle />` component

#### `apps/frontend/src/app/design/Components/Sidebar.tsx`
- **Remove:** Line 25 - `import ThemeToggle from '@/components/ThemeToggle';`
- **Remove:** Any `<ThemeToggle />` usage

### 3. Optional: Delete ThemeToggle Component

**File:** `apps/frontend/src/components/ThemeToggle.tsx`

Since we're moving the functionality to ProfileDropdown, you can optionally delete this file entirely. However, you can keep it if you think it might be useful elsewhere.

### 4. Verify ThemeProvider is Wrapped Around App

**File:** `apps/frontend/src/app/layout.tsx` (or wherever providers are set up)

**Ensure this structure exists:**

```typescript
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Key Points:**
- `suppressHydrationWarning` on `<html>` to prevent hydration warnings from theme changes
- ThemeProvider should wrap the entire app

### 5. Ensure All Pages/Widgets Support Dark Mode

**Tailwind Dark Mode Classes:**

Every page and widget should use Tailwind's dark mode utility classes:

```typescript
// Background colors
className="bg-white dark:bg-gray-900"
className="bg-gray-50 dark:bg-gray-800"

// Text colors
className="text-gray-900 dark:text-gray-100"
className="text-gray-600 dark:text-gray-400"

// Borders
className="border-gray-200 dark:border-gray-700"

// Hover states
className="hover:bg-gray-100 dark:hover:bg-gray-700"
```

**Files to Audit for Dark Mode Support:**

1. **All pages in `apps/frontend/src/app/`**
   - `page.tsx`
   - `dashboards/page.tsx`
   - `design/page.tsx`
   - `design/[id]/page.tsx`
   - `auth/login/page.tsx`
   - `auth/signup/page.tsx`

2. **All components in `apps/frontend/src/components/`**
   - `DashboardCard.tsx`
   - `ConfirmDialog.tsx`
   - `SaveDialog.tsx`
   - All other components

3. **Design components in `apps/frontend/src/app/design/Components/`**
   - `DesignHeader.tsx`
   - `Sidebar.tsx`
   - `CanvasEditor.tsx`
   - All widget components in `Elements/`

4. **Chart/Widget Elements**
   - All files in `apps/frontend/src/app/design/Elements/`
   - Each chart widget should support dark theme colors

**Chart Dark Mode Pattern:**

For chart libraries (Chart.js, ApexCharts, Recharts):

```typescript
const { resolvedTheme } = useTheme();

// Chart.js
const options = {
  color: resolvedTheme === 'dark' ? '#fff' : '#000',
  scales: {
    x: {
      ticks: { color: resolvedTheme === 'dark' ? '#9ca3af' : '#4b5563' }
    }
  }
};

// ApexCharts
const chartOptions = {
  theme: { mode: resolvedTheme },
  chart: {
    background: 'transparent'
  }
};
```

## Implementation Checklist

### Phase 1: Move Theme Toggle ✅
- [ ] Update `ProfileDropdown.tsx` - Add theme selection menu
- [ ] Import `useTheme` hook
- [ ] Add 3 theme buttons (Light, Dark, System) with icons
- [ ] Add check mark indicator for selected theme
- [ ] Add border separator above and below theme section

### Phase 2: Remove Old ThemeToggle ✅
- [ ] Remove `<ThemeToggle />` from `page.tsx`
- [ ] Remove `<ThemeToggle />` from `dashboards/page.tsx`
- [ ] Remove `<ThemeToggle />` from `DesignHeader.tsx`
- [ ] Remove `<ThemeToggle />` from `Sidebar.tsx`
- [ ] Remove all `import ThemeToggle` statements
- [ ] (Optional) Delete `components/ThemeToggle.tsx` file

### Phase 3: Verify Theme Provider ✅
- [ ] Check `layout.tsx` has `<ThemeProvider>` wrapping app
- [ ] Ensure `suppressHydrationWarning` on `<html>` tag
- [ ] Verify ThemeProvider is outside AuthProvider

### Phase 4: Dark Mode Support ✅
- [ ] Audit all pages for dark mode classes
- [ ] Audit all components for dark mode classes
- [ ] Update chart widgets to support dark theme
- [ ] Test theme changes on all pages
- [ ] Ensure transitions are smooth

## Testing Steps

1. **Test Theme Selection:**
   - Click on profile avatar
   - Dropdown should open
   - Click "Light" → Page should switch to light mode
   - Click "Dark" → Page should switch to dark mode
   - Click "System" → Should match OS theme
   - Check mark should appear next to selected theme

2. **Test Persistence:**
   - Change theme to Dark
   - Reload page (F5)
   - ✅ Theme should stay Dark

3. **Test Across Pages:**
   - Change theme on home page → Theme changes
   - Navigate to `/dashboards` → Same theme applied
   - Navigate to `/design` → Same theme applied
   - All pages should respect the selected theme

4. **Test Charts/Widgets:**
   - Open design page
   - Add a bar chart widget
   - Toggle theme to dark
   - ✅ Chart should have dark theme colors
   - Toggle back to light
   - ✅ Chart should have light theme colors

5. **Test System Theme:**
   - Set theme to "System"
   - Change OS dark mode setting
   - ✅ App should automatically follow OS theme

## Expected UI Structure

**ProfileDropdown Menu (New):**

```
┌─────────────────────────────┐
│ [Avatar] John Doe           │
│          john@example.com   │
├─────────────────────────────┤
│ THEME                       │
│ ☀️  Light              ✓    │
│ 🌙 Dark                     │
│ 💻 System                   │
├─────────────────────────────┤
│ 👤 Account Settings         │
│ 🚪 Logout                   │
└─────────────────────────────┘
```

## Dark Mode Color Palette

For consistency across the app:

```css
/* Light Mode */
--bg-primary: #ffffff
--bg-secondary: #f9fafb
--text-primary: #111827
--text-secondary: #6b7280
--border: #e5e7eb

/* Dark Mode */
--bg-primary: #1f2937
--bg-secondary: #111827
--text-primary: #f9fafb
--text-secondary: #9ca3af
--border: #374151
```

## Common Issues to Watch For

1. **Hydration Mismatch:** Add `suppressHydrationWarning` to `<html>`
2. **Flash of Wrong Theme:** ThemeProvider should load theme from localStorage on mount
3. **Charts Not Updating:** Charts need to re-render when theme changes (use `resolvedTheme` in dependency array)
4. **Dropdown Closes on Click:** Add `e.stopPropagation()` if needed
5. **Missing Dark Classes:** Search for `bg-white` and ensure `dark:bg-gray-900` is added

## Implementation Order

1. ✅ Update `ProfileDropdown.tsx` with theme menu
2. ✅ Test theme selection works
3. ✅ Remove `<ThemeToggle />` from all pages
4. ✅ Remove import statements
5. ✅ Verify no errors in console
6. ✅ Test theme persistence on reload
7. ✅ Audit pages for dark mode support
8. ✅ Update charts for dark theme
9. ✅ Final testing across all pages

---

**Use this prompt with OpenCode to implement the theme toggle move to ProfileDropdown and ensure complete dark mode support across the application.**
