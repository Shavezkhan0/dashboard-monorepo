'use client';

import React from "react";
import DesignHeader from "../Components/DesignHeader";
import { CanvasProvider } from "../Context/CanvasContext";
import Sidebar from "../Components/Sidebar";
import CanvasEditor from "../Components/CanvasEditor";

interface DesignPageProps {
    params: {
        id: string;
    };
}

export default function DesignPage({ params }: DesignPageProps) {
    const dashboardId = params.id;

    return (
        <CanvasProvider dashboardId={dashboardId}>
            <main className="flex flex-col h-screen ">
                <DesignHeader />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <CanvasEditor />
                </div>
            </main>
        </CanvasProvider>
    );
}
