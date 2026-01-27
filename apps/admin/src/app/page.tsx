'use client';

import Link from 'next/link';

export default function AdminHome() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/users"
            className="p-6 border rounded-lg hover:bg-gray-100 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Users</h2>
            <p className="text-gray-600">Manage users and permissions</p>
          </Link>
          <Link
            href="/dashboards"
            className="p-6 border rounded-lg hover:bg-gray-100 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Dashboards</h2>
            <p className="text-gray-600">View and manage all dashboards</p>
          </Link>
          <Link
            href="/analytics"
            className="p-6 border rounded-lg hover:bg-gray-100 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Analytics</h2>
            <p className="text-gray-600">Platform statistics and insights</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
