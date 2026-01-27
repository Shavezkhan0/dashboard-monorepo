'use client';
'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Minus, ChevronDown, X } from 'lucide-react';

const BubbleChartSetting = ({ initialData, onUpdate, onClose }) => {
    const [draftData, setDraftData] = useState(initialData);
    const [expandedSections, setExpandedSections] = useState({
        details: true,
        datasets: true,
        xaxis: true,
        yaxis: true,
    });

    useEffect(() => {
        setDraftData(initialData);
    }, [initialData]);

    const handlePropChange = (field, value) => {
        setDraftData(prev => ({ ...prev, [field]: value }));
    };

    const handleDatasetPropChange = (datasetIndex, field, value) => {
        const newDatasets = JSON.parse(JSON.stringify(draftData.datasets));
        newDatasets[datasetIndex][field] = value;
        setDraftData(prev => ({ ...prev, datasets: newDatasets }));
    };

    const handleDataPointChange = (datasetIndex, pointIndex, field, value) => {
        const newDatasets = JSON.parse(JSON.stringify(draftData.datasets));
        newDatasets[datasetIndex].data[pointIndex][field] = parseFloat(value);
        setDraftData(prev => ({ ...prev, datasets: newDatasets }));
    };

    const addDataPoint = (datasetIndex) => {
        const newDatasets = JSON.parse(JSON.stringify(draftData.datasets));
        newDatasets[datasetIndex].data.push({ x: 50, y: 50, r: 10 });
        setDraftData(prev => ({ ...prev, datasets: newDatasets }));
    };

    const removeDataPoint = (datasetIndex, pointIndex) => {
        const newDatasets = JSON.parse(JSON.stringify(draftData.datasets));
        if (newDatasets[datasetIndex].data.length <= 1) return;
        newDatasets[datasetIndex].data.splice(pointIndex, 1);
        setDraftData(prev => ({ ...prev, datasets: newDatasets }));
    };

    const handleSave = () => {
        if (onUpdate) onUpdate(draftData);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!draftData) return <div className="p-4">Loading...</div>;

    return (
        <div className="pr-2 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold">Edit Bubble Chart</h2>
                <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><X size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Details Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('details')}>
                        <h3 className="text-sm font-medium text-gray-700">Details</h3>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.details ? 'rotate-180' : ''}`} />
                    </div>
                    {expandedSections.details && (
                        <div className="mt-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Show Title</span>
                                <button onClick={() => handlePropChange('showTitle', !draftData.showTitle)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${draftData.showTitle ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${draftData.showTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            {draftData.showTitle && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Title Text</label>
                                    <input type="text" value={draftData.title} onChange={(e) => handlePropChange('title', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Data Section */}
                {draftData.datasets.map((dataset, datasetIndex) => (
                    <div key={dataset.id || datasetIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(`dataset-${datasetIndex}`)}>
                            <h3 className="text-sm font-medium text-gray-700">Dataset: {dataset.name}</h3>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections[`dataset-${datasetIndex}`] ? 'rotate-180' : ''}`} />
                        </div>
                        {expandedSections[`dataset-${datasetIndex}`] && (
                            <div className="mt-3 space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                                    <input type="text" value={dataset.name} onChange={(e) => handleDatasetPropChange(datasetIndex, 'name', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Color</label>
                                    <input type="color" value={dataset.color} onChange={(e) => handleDatasetPropChange(datasetIndex, 'color', e.target.value)} className="w-full h-8 p-0 border-none rounded cursor-pointer" />
                                </div>
                                <hr className="my-2" />
                                <h4 className="text-sm font-medium mb-2">Bubbles ({dataset.data.length})</h4>
                                <div className="space-y-2">
                                    {dataset.data.map((point, pointIndex) => (
                                        <div key={pointIndex} className="flex items-center gap-2 p-2 border border-gray-200 rounded-md">
                                            <div className="flex-1 grid grid-cols-3 gap-2">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">X</label>
                                                    <input type="number" value={point.x} onChange={(e) => handleDataPointChange(datasetIndex, pointIndex, 'x', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Y</label>
                                                    <input type="number" value={point.y} onChange={(e) => handleDataPointChange(datasetIndex, pointIndex, 'y', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Radius (r)</label>
                                                    <input type="number" value={point.r} onChange={(e) => handleDataPointChange(datasetIndex, pointIndex, 'r', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded text-sm" />
                                                </div>
                                            </div>
                                            <button onClick={() => removeDataPoint(datasetIndex, pointIndex)} className="p-2 text-gray-400 hover:text-red-500 rounded">
                                                <Minus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => addDataPoint(datasetIndex)} className="w-full py-2 px-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm font-medium flex items-center justify-center space-x-1">
                                    <Plus className="w-4 h-4" /><span>Add Bubble</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-4 border-t bg-gray-50">
                <button onClick={handleSave} className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default BubbleChartSetting;

