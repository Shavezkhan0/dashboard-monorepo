'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiClient } from '@dashboard/api-client';
import { useDashboards, useDeleteDashboard } from '@dashboard/api-client';
import type { Dashboard } from '@dashboard/shared-types';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function DashboardsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token } = useAuthContext();
  const [client, setClient] = useState<ApiClient | null>(null);

  useEffect(() => {
    if (token) {
      setClient(new ApiClient(API_URL, () => token));
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const { data: dashboards, isLoading } = useDashboards(client!, {
    enabled: !!client && isAuthenticated,
  });

  const deleteMutation = useDeleteDashboard(client!);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Failed to delete dashboard');
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Dashboards</h1>
          <Link
            href="/design"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Create New Dashboard
          </Link>
        </div>

        {dashboards && dashboards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No dashboards yet</p>
            <Link
              href="/design"
              className="text-indigo-600 hover:text-indigo-700"
            >
              Create your first dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards?.map((dashboard: Dashboard) => (
              <div
                key={dashboard.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold mb-2">{dashboard.name}</h2>
                <p className="text-sm text-gray-600 mb-4">
                  {dashboard.widgets.length} widgets
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(dashboard.updatedAt).toLocaleDateString()}
                  </span>
                  {dashboard.isPublic && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Public
                    </span>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/design/${dashboard.id}`}
                    className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(dashboard.id)}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
