'use client';

import { useState } from 'react';
import { ApiClient } from '@dashboard/api-client';
import { useAllDashboards } from '@dashboard/api-client';
import type { Dashboard } from '@dashboard/shared-types';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function DashboardsPage() {
  const [client] = useState(() => {
    return new ApiClient(API_URL, () => localStorage.getItem('token'));
  });

  const { data: dashboards, isLoading, error } = useAllDashboards(client);

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">All Dashboards</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">All Dashboards</h1>
          <p className="text-red-500">
            Error loading dashboards: {String(error)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">All Dashboards</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
