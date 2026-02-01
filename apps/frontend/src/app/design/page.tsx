'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiClient } from '@dashboard/api-client';
import { useCreateDashboard } from '@dashboard/api-client';
import DesignHeader from "./Components/DesignHeader";
import { CanvasProvider } from "./Context/CanvasContext";
import Sidebar from "./Components/Sidebar";
import CanvasEditor from "./Components/CanvasEditor";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function NewDesignPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, token } = useAuthContext();
    const [client, setClient] = useState<ApiClient | null>(null);
    const [dashboardId, setDashboardId] = useState<string | null>(null);
    const createMutation = useCreateDashboard(client!);
    const dashboardCreationRef = useRef(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (token) {
            setClient(new ApiClient(API_URL, () => token));
        }
    }, [token]);

    // Create a new dashboard when component mounts
    useEffect(() => {
        if (client && !dashboardId && isAuthenticated && !dashboardCreationRef.current) {
            dashboardCreationRef.current = true;
            createMutation.mutate(
                { name: 'New Dashboard', widgets: [] },
                {
                    onSuccess: (dashboard) => {
                        setDashboardId(dashboard.id);
                        // Update URL without navigation
                        if (typeof window !== 'undefined') {
                            window.history.replaceState(null, '', `/design/${dashboard.id}`);
                        }
                    },
                }
            );
        }
    }, [client, dashboardId, isAuthenticated, createMutation]);

    if (authLoading || !dashboardId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-300">Creating dashboard...</p>
            </div>
        );
    }

    return (
        <CanvasProvider dashboardId={dashboardId} client={client}>
            <main className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
                <DesignHeader />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <CanvasEditor />
                </div>
            </main>
        </CanvasProvider>
    );
}
