'use client';

import React, { useEffect, useState, use } from "react";
import { CanvasProvider, useCanvasHook } from "../../Context/CanvasContext";
import CanvasViewer from "../../Components/CanvasViewer";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiClient } from '@dashboard/api-client';

const ViewerHeader = () => {
    const { dashboard, widgets } = useCanvasHook();

    // Safety check just in case
    if (!dashboard && widgets.length > 0) {
        // Loading or context not yet populated fully with dashboard metadata, 
        // but we have widgets.
    }

    return (
        <nav className="px-6 py-2 border-b-2 border-gray-300 bg-white flex items-center gap-4">
            {/* Logo placeholder - assuming logo.png is in public folder */}
            <img src="/logo.png" alt="Logo" width="35" height="35" />
            <h1 className="text-xl font-semibold text-black">
                {dashboard?.title || dashboard?.name || 'Dashboard View'}
            </h1>
            <div className="text-sm text-gray-600 ml-auto">
                {widgets.length} chart{widgets.length !== 1 ? 's' : ''}
            </div>
        </nav>
    );
};

export default function ViewerPage({ params }: { params: Promise<{ viewID: string }> }) {
    const resolvedParams = use(params);
    const dashboardId = resolvedParams.viewID;

    // We can use AuthContext if the viewer requires auth, 
    // OR we can allow public viewing if the API supports it.
    // The source code fetched via /view/[viewID] which might be public.
    // Here we use ApiClient which usually requires a token, BUT
    // standard users might be viewing it.
    // For now, let's assume we use the same Client generation as the editor.

    const { token } = useAuthContext();
    const [client, setClient] = useState<ApiClient | null>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        // If public viewing is allowed without token, we might instantiate Client without token?
        // Or maybe token is optional.
        // For now, let's try with token or fallback to no token if it handles public endpoints.
        setClient(new ApiClient(API_URL, () => token || ''));
    }, [token, API_URL]);

    if (!client) return <div className="p-10 flex justify-center text-black">Initializing...</div>;

    return (
        <CanvasProvider dashboardId={dashboardId} client={client}>
            <main className="flex flex-col h-screen bg-gray-100">
                <ViewerHeader />
                <div className="flex flex-1 overflow-hidden">
                    <CanvasViewer />
                </div>
            </main>
        </CanvasProvider>
    );
}
