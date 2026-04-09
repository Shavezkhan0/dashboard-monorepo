'use client';

import React, { useEffect, useState } from "react";
import DesignHeader from "@/components/design/header/DesignHeader";
import { CanvasProvider } from "@/contexts/CanvasContext";
import Sidebar from "@/components/design/sidebar/Sidebar";
import CanvasEditor from "@/components/design/canvas/CanvasEditor";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiClient } from '@dashboard/api-client';

interface DesignPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function DesignPage({ params }: DesignPageProps) {
    const { id: dashboardId } = React.use(params);
    const { token } = useAuthContext();
    const [client, setClient] = useState<ApiClient | null>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        if (token) {
            setClient(new ApiClient(API_URL, () => token));
        }
    }, [token]);

    return (
        <CanvasProvider dashboardId={dashboardId} client={client}>
            <main className="flex flex-col h-screen bg-background text-foreground">
                <DesignHeader />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <CanvasEditor />
                </div>
            </main>
        </CanvasProvider>
    );
}
