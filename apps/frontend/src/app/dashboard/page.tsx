'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiClient, useDashboards, useDeleteDashboard } from '@dashboard/api-client';
import { FaPlus } from 'react-icons/fa';
import DashboardCard from '@/components/dashboard/DashboardCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, token, user } = useAuthContext();
  const [client, setClient] = useState<ApiClient | null>(null);

  useEffect(() => {
    if (token) {
      setClient(new ApiClient(API_URL, () => token));
    }
  }, [token]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const deleteMutation = useDeleteDashboard(client!);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      deleteMutation.mutate(id);
    }
  };

  const { data: dashboards, isLoading } = useDashboards(client!, {
    enabled: !!client && isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/design')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <FaPlus size={14} />
            New Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <h2 className="text-xl font-semibold mb-6">Recent Dashboards</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : dashboards && dashboards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => (
              <DashboardCard
                key={dashboard.id}
                dashboard={dashboard}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No dashboards yet</p>
            <button
              onClick={() => router.push('/design')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Create Your First Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}