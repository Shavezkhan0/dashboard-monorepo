'use client';

import React, { useEffect, useState, use } from "react";
import { CanvasProvider, useCanvasHook } from "../../Context/CanvasContext";
import CanvasViewer from "../../Components/CanvasViewer";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiClient } from '@dashboard/api-client';
import { FaChartLine, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const ViewerHeader = () => {
    const { dashboard, widgets } = useCanvasHook();

    return (
        <nav className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-4 shadow-sm">
            {/* Back button */}
            <Link
                href="/dashboards"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Back to dashboards"
            >
                <FaArrowLeft className="text-gray-600 dark:text-gray-300" size={18} />
            </Link>

            {/* Dashboard icon */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center">
                <FaChartLine className="text-purple-600 dark:text-purple-400" size={20} />
            </div>

            {/* Dashboard title */}
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {dashboard?.title || dashboard?.name || 'Dashboard View'}
            </h1>

            {/* Widget count badge */}
            <div className="ml-auto flex items-center gap-2">
                <span className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                    {widgets.length} {widgets.length !== 1 ? 'widgets' : 'widget'}
                </span>
                {dashboard?.isPublic && (
                    <span className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full font-medium">
                        Public
                    </span>
                )}
            </div>
        </nav>
    );
};

export default function ViewerPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const dashboardId = resolvedParams.id;

    const { token } = useAuthContext();
    const [client, setClient] = useState<ApiClient | null>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        // Create client with token if available (for private dashboards)
        // or without token (for public dashboards)
        setClient(new ApiClient(API_URL, () => token || null));
    }, [token, API_URL]);

    if (!client) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <CanvasProvider dashboardId={dashboardId} client={client}>
            <main className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
                <ViewerHeader />
                <div className="flex flex-1 overflow-hidden">
                    <CanvasViewer />
                </div>
            </main>
        </CanvasProvider>
    );
}
