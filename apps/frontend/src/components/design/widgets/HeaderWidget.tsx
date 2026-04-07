'use client';

import React from 'react';
import { ImageUp } from 'lucide-react';

// This component renders the actual header on the canvas.
export default function HeaderWidget({ title, logoUrl, metrics }) {

    // Default values to prevent errors if props are missing.
    const displayTitle = title || "DASHBOARD TITLE";
    const displayMetrics = metrics || [];

    return (
        <div className="w-full h-full bg-card flex items-center p-4 border-b-2 border-border text-card-foreground">
            {/* Logo Section */}
            <div className="flex items-center gap-4 flex-shrink-0">
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
                ) : (
                    <div className="h-10 w-28 bg-muted flex items-center justify-center text-muted-foreground rounded-md">
                        <ImageUp size={18} className="mr-2" />
                        <span className="text-xs">Logo</span>
                    </div>
                )}
                <h1 className="text-2xl font-bold text-card-foreground whitespace-nowrap">
                    {displayTitle}
                </h1>
            </div>

            {/* Spacer */}
            <div className="flex-grow"></div>

            {/* Metrics Section */}
            <div className="flex items-center gap-4">
                {displayMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{metric.title}:</span>
                        <div className="px-3 py-1.5 bg-muted border border-border rounded-md text-sm text-card-foreground font-semibold">
                            {metric.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

