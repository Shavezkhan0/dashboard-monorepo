'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiClient, useDashboards } from '@dashboard/api-client';
import { FaPlus } from 'react-icons/fa';
import DashboardPreviewCard from '@/components/dashboard/DashboardPreviewCard';

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
  
  const { data: dashboards, isLoading } = useDashboards(client!, {
    enabled: !!client && isAuthenticated,
  });
  
  if (!isAuthenticated) {
    router.push('/');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : dashboards && dashboards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => (
              <DashboardPreviewCard 
                key={dashboard.id} 
                dashboard={dashboard}
                onClick={() => router.push(`/design/${dashboard.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No dashboards yet</p>
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