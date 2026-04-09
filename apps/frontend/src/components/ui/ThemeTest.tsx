'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeTest() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  return (
    <div className="p-4 bg-card border rounded-lg">
      <h2 className="text-lg font-semibold text-foreground mb-2">
        Theme Debug
      </h2>
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">
          Current theme: <strong className="text-foreground">{theme}</strong>
        </p>
        <p className="text-muted-foreground">
          Resolved theme: <strong className="text-foreground">{resolvedTheme}</strong>
        </p>
        <p className="text-muted-foreground">
          HTML class: <strong className="text-foreground">{typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'no dark'}</strong>
        </p>
        <p className="text-muted-foreground">
          System preference: <strong className="text-foreground">{typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}</strong>
        </p>
        <p className="text-muted-foreground">
          localStorage: <strong className="text-foreground">{typeof localStorage !== 'undefined' ? localStorage.getItem('dashboard-theme') || 'null' : 'N/A'}</strong>
        </p>
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => setTheme('light')}
            className="px-3 py-1 bg-muted text-foreground rounded"
          >
            Light
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className="px-3 py-1 bg-muted text-foreground rounded"
          >
            Dark
          </button>
          <button 
            onClick={() => setTheme('system')}
            className="px-3 py-1 bg-muted text-foreground rounded"
          >
            System
          </button>
        </div>
      </div>
    </div>
  );
}