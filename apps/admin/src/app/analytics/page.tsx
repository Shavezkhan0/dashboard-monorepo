'use client';

import { useState } from 'react';
import { ApiClient } from '@dashboard/api-client';
import { useAdminStats } from '@dashboard/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AnalyticsPage() {
  const [client] = useState(() => {
    return new ApiClient(API_URL, () => localStorage.getItem('token'));
  });

  const { data: stats, isLoading, error } = useAdminStats(client);

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Analytics</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Analytics</h1>
          <p className="text-red-500">Error loading stats: {String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Platform Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">
              Total Users
            </h2>
            <p className="text-4xl font-bold">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">
              Total Dashboards
            </h2>
            <p className="text-4xl font-bold">
              {stats?.totalDashboards || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">
              Total Data Sources
            </h2>
            <p className="text-4xl font-bold">
              {stats?.totalDataSources || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
