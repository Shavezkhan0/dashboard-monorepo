'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, ImageUp } from 'lucide-react';

// This component provides the UI to edit the header's properties.
export default function HeaderSetting({ initialData, onUpdate, onClose }) {
    const [headerData, setHeaderData] = useState(initialData);
    const [expandedSections, setExpandedSections] = useState({
        general: true,
        metrics: true,
    });

    useEffect(() => {
        setHeaderData(initialData);
    }, [initialData]);

    const handleDataChange = (field, value) => {
        const updatedData = { ...headerData, [field]: value };
        setHeaderData(updatedData);
        onUpdate(updatedData);
    };

    const handleMetricChange = (index, field, value) => {
        const newMetrics = [...(headerData.metrics || [])];
        newMetrics[index] = { ...newMetrics[index], [field]: value };
        handleDataChange('metrics', newMetrics);
    };

    const addMetric = () => {
        const newMetric = {
            id: `metric${Date.now()}`,
            title: 'New Title',
            value: 'New Metric'
        };
        const newMetrics = [...(headerData.metrics || []), newMetric];
        handleDataChange('metrics', newMetrics);
    };

    const removeMetric = (index) => {
        const newMetrics = (headerData.metrics || []).filter((_, i) => i !== index);
        handleDataChange('metrics', newMetrics);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleDataChange('logoUrl', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!headerData) return <div className="p-4 text-gray-500">Loading settings...</div>;

    return (
        <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg text-black">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold">Edit Header</h2>
                <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><X size={16} /></button>
            </div>

            {/* Settings Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* General Settings */}
                <div className="border border-gray-200 rounded-lg">
                    <button className="flex items-center justify-between w-full p-3" onClick={() => toggleSection('general')}>
                        <h3 className="text-sm font-medium text-gray-700">General</h3>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.general ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedSections.general && (
                        <div className="p-4 border-t border-gray-200 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Header Title</label>
                                <input
                                    type="text"
                                    value={headerData.title || ''}
                                    onChange={(e) => handleDataChange('title', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                                        {headerData.logoUrl ? (
                                            <img src={headerData.logoUrl} alt="logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <ImageUp size={24} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                        />
                                        <label htmlFor="logo-upload" className="px-3 py-1.5 bg-white border border-gray-300 text-sm font-medium rounded-md cursor-pointer hover:bg-gray-50">
                                            Upload
                                        </label>
                                         <button onClick={() => handleDataChange('logoUrl', '')} className="text-xs text-red-500 hover:underline mt-2 text-left">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Metrics Settings */}
                <div className="border border-gray-200 rounded-lg">
                    <button className="flex items-center justify-between w-full p-3" onClick={() => toggleSection('metrics')}>
                        <h3 className="text-sm font-medium text-gray-700">Metrics</h3>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.metrics ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedSections.metrics && (
                        <div className="p-4 border-t border-gray-200 space-y-3">
                            {(headerData.metrics || []).map((metric, index) => (
                                <div key={metric.id || index} className="p-3 bg-gray-50 rounded-md border border-gray-200 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Metric {index + 1}</span>
                                        <button onClick={() => removeMetric(index)} className="p-1 text-red-500 hover:bg-red-100 rounded">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={metric.title}
                                        onChange={(e) => handleMetricChange(index, 'title', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={metric.value}
                                        onChange={(e) => handleMetricChange(index, 'value', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                            ))}
                            <button
                                onClick={addMetric}
                                className="w-full flex items-center justify-center gap-2 mt-2 p-2 text-sm text-indigo-600 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-md hover:bg-indigo-100"
                            >
                                <Plus size={16} /> Add Metric
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}