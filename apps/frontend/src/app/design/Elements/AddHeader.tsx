'use client';

import React from 'react';
import { LuRectangleHorizontal } from 'react-icons/lu';
import { useCanvasHook } from '../Context/CanvasContext';

// This component is the button/icon you'll place in your sidebar.
export default function AddHeader({ onClose }) {
    const { addWidget } = useCanvasHook();

    const handleAddHeader = () => {
        // Defines the initial state and properties for a new header widget.
        const newHeaderProps = {
            title: 'DASHBOARD TITLE',
            logoUrl: '', // Initially empty, to be set in settings
            metrics: [
                { id: 'metric1', title: 'Title 1', value: 'Metric 1' },
                { id: 'metric2', title: 'Title 2', value: 'Metric 2' },
            ]
        };
        
        // Adds the new widget to the canvas via the context.
        addWidget({
            type: 'header',
            props: newHeaderProps
        });
        
        if (onClose) onClose();
    };

    return (
        <div className="space-y-4">
            {/* Preview */}
            <div className="h-[60px] w-full rounded-lg shadow-inner relative border border-gray-200 overflow-hidden bg-white">
                <div className="w-full h-full bg-white flex items-center px-3 py-2 border-b border-gray-200 text-black">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="h-5 w-12 bg-gray-100 flex items-center justify-center text-gray-400 rounded text-[10px]">
                            Logo
                        </div>
                        <h1 className="text-sm font-bold text-gray-800 whitespace-nowrap">
                            DASHBOARD TITLE
                        </h1>
                    </div>

                    {/* Spacer */}
                    <div className="flex-grow"></div>

                    {/* Metrics Section */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-medium text-gray-500">Title 1:</span>
                            <div className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded text-[10px] text-gray-800 font-semibold">
                                Metric 1
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-medium text-gray-500">Title 2:</span>
                            <div className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded text-[10px] text-gray-800 font-semibold">
                                Metric 2
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">Header Widget</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                    Add a customizable header with logo, title, and key metrics to your dashboard.
                </p>
            </div>

            {/* Add Button */}
            <button
                onClick={handleAddHeader}
                className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white border-2 border-indigo-300 rounded-md font-medium transition-all duration-200 hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer"
            >
                Add Header to Canvas
            </button>
        </div>
    );
}