'use client';
'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Minus, ChevronDown, X } from 'lucide-react';

const WaterfallChartSetting = ({ initialData, onUpdate, onClose }) => {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({
        details: false,
        xaxis: false,
        yaxis: false,
        properties: false
    });
    const [graphData, setGraphData] = useState(initialData);

    useEffect(() => {
        setMounted(true);
        if (initialData) {
            setGraphData(initialData);
        }
    }, [initialData]);

    const handleTitleChange = (e) => {
        if (!mounted) return;
        setGraphData(prev => ({ ...prev, title: e.target.value }));
    };

    const handleLabelChange = (index, value) => {
        if (!mounted) return;
        const newLabels = [...graphData.labels];
        newLabels[index] = value;
        setGraphData(prev => ({ ...prev, labels: newLabels }));
    };

    const handleDataPointChange = (index, value) => {
        if (!mounted) return;
        const newDataPoints = [...graphData.dataPoints];
        newDataPoints[index] = parseFloat(value) || 0;
        setGraphData(prev => ({ ...prev, dataPoints: newDataPoints }));
    };

    const addDataPoint = () => {
        if (!mounted) return;
        const newLabels = [...graphData.labels, `Point ${graphData.labels.length + 1}`];
        const newDataPoints = [...graphData.dataPoints, 0];
        setGraphData(prev => ({ ...prev, labels: newLabels, dataPoints: newDataPoints }));
    };

    const removeDataPoint = (index) => {
        if (!mounted || graphData.labels.length <= 1) return;
        const newLabels = graphData.labels.filter((_, i) => i !== index);
        const newDataPoints = graphData.dataPoints.filter((_, i) => i !== index);
        setGraphData(prev => ({ ...prev, labels: newLabels, dataPoints: newDataPoints }));
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!mounted || !graphData) {
        return (
            <div className="w-80 h-full bg-white border-r border-gray-200 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="pr-2 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold">Edit Waterfall Chart</h2>
                <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                    <X size={16} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('data')}
                    className={`relative flex-1 py-3 px-4 text-sm font-medium transition-all
                        ${activeTab === 'data'
                            ? 'text-blue-600 bg-blue-50 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-800 after:via-indigo-700 after:to-purple-600 after:content-[""]'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                    `}
                >
                    Data
                </button>

                <button
                    onClick={() => setActiveTab('customize')}
                    className={`relative flex-1 py-3 px-4 text-sm font-medium transition-all
                        ${activeTab === 'customize'
                            ? 'text-blue-600 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-800 bg-blue-50 after:via-indigo-700 after:to-purple-600 after:content-[""]'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                    `}
                >
                    Customize
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'data' && (
                    <div className="p-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title</label>
                            <input 
                                type="text" 
                                value={graphData.title} 
                                onChange={handleTitleChange} 
                                className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Initial Value</label>
                            <input 
                                type="number" 
                                value={graphData.initialValue || 0} 
                                onChange={(e) => setGraphData(prev => ({ ...prev, initialValue: parseFloat(e.target.value) || 0 }))} 
                                className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                                placeholder="Starting value"
                            />
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-700">Data Points</h3>
                                <span className="text-xs text-gray-500">{graphData.labels?.length} points</span>
                            </div>
                            <div className="space-y-3 mb-3">
                                {graphData.labels?.map((label, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Point {index + 1}</span>
                                            {graphData.labels.length > 1 && (
                                                <button 
                                                    onClick={() => removeDataPoint(index)} 
                                                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Label</label>
                                                <input 
                                                    type="text" 
                                                    value={label} 
                                                    onChange={(e) => handleLabelChange(index, e.target.value)} 
                                                    className="w-full p-2 border border-gray-300 rounded text-sm" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Value Change</label>
                                                <input 
                                                    type="number" 
                                                    value={graphData.dataPoints[index]} 
                                                    onChange={(e) => handleDataPointChange(index, e.target.value)} 
                                                    className="w-full p-2 border border-gray-300 rounded text-sm" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={addDataPoint} 
                                className="w-full py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium flex items-center justify-center space-x-1"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Data Point</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'customize' && (
                    <div className="p-4 space-y-4">
                        {/* Details Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('details')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">Details</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.details ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.details && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Title</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showTitle: !prev.showTitle }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showTitle !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showTitle !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    {graphData.showTitle !== false && (
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Edit Text</label>
                                            <input
                                                type="text"
                                                value={graphData.title}
                                                onChange={handleTitleChange}
                                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Title goes here"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Legend</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showLegend: !prev.showLegend }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showLegend !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showLegend !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* X Axis Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('xaxis')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">X Axis</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.xaxis ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.xaxis && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Axis</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showXAxis: !prev.showXAxis }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showXAxis !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showXAxis !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    {graphData.showXAxis !== false && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Title</span>
                                                <button
                                                    onClick={() => setGraphData(prev => ({ ...prev, showXAxisTitle: !prev.showXAxisTitle }))}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showXAxisTitle ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showXAxisTitle ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                            </div>
                                            {graphData.showXAxisTitle && (
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Edit Text</label>
                                                    <input
                                                        type="text"
                                                        value={graphData.xAxisTitle || ''}
                                                        onChange={e => setGraphData(prev => ({ ...prev, xAxisTitle: e.target.value }))}
                                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="X label"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Y Axis Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('yaxis')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">Y Axis</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.yaxis ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.yaxis && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Axis</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showYAxis: !prev.showYAxis }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showYAxis !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showYAxis !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    {graphData.showYAxis !== false && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Title</span>
                                                <button
                                                    onClick={() => setGraphData(prev => ({ ...prev, showYAxisTitle: !prev.showYAxisTitle }))}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showYAxisTitle ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showYAxisTitle ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                            </div>
                                            {graphData.showYAxisTitle && (
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Edit Text</label>
                                                    <input
                                                        type="text"
                                                        value={graphData.yAxisTitle || ''}
                                                        onChange={e => setGraphData(prev => ({ ...prev, yAxisTitle: e.target.value }))}
                                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Y label"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-2 mt-2">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Min</label>
                                                    <input
                                                        type="number"
                                                        value={graphData.yMin ?? 0}
                                                        onChange={e => setGraphData(prev => ({ ...prev, yMin: parseFloat(e.target.value) }))}
                                                        className="w-16 p-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Max</label>
                                                    <input
                                                        type="number"
                                                        value={graphData.yMax ?? 100}
                                                        onChange={e => setGraphData(prev => ({ ...prev, yMax: parseFloat(e.target.value) }))}
                                                        className="w-16 p-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Step Size</label>
                                                    <input
                                                        type="number"
                                                        value={graphData.yStep ?? 10}
                                                        onChange={e => setGraphData(prev => ({ ...prev, yStep: parseFloat(e.target.value) }))}
                                                        className="w-16 p-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Properties Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('properties')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">Properties</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.properties ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.properties && (
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Positive Color</label>
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="color" 
                                                value={graphData.positiveColor || '#10B981'} 
                                                onChange={(e) => setGraphData(prev => ({ ...prev, positiveColor: e.target.value }))} 
                                                className="w-8 h-8 border rounded cursor-pointer" 
                                            />
                                            <input 
                                                type="text" 
                                                value={graphData.positiveColor || '#10B981'} 
                                                onChange={(e) => setGraphData(prev => ({ ...prev, positiveColor: e.target.value }))} 
                                                className="flex-1 p-1.5 border border-gray-300 rounded text-sm" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Negative Color</label>
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="color" 
                                                value={graphData.negativeColor || '#EF4444'} 
                                                onChange={(e) => setGraphData(prev => ({ ...prev, negativeColor: e.target.value }))} 
                                                className="w-8 h-8 border rounded cursor-pointer" 
                                            />
                                            <input 
                                                type="text" 
                                                value={graphData.negativeColor || '#EF4444'} 
                                                onChange={(e) => setGraphData(prev => ({ ...prev, negativeColor: e.target.value }))} 
                                                className="flex-1 p-1.5 border border-gray-300 rounded text-sm" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Total/Cumulative Color</label>
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="color" 
                                                value={graphData.totalColor || '#3B82F6'} 
                                                onChange={(e) => setGraphData(prev => ({ ...prev, totalColor: e.target.value }))} 
                                                className="w-8 h-8 border rounded cursor-pointer" 
                                            />
                                            <input 
                                                type="text" 
                                                value={graphData.totalColor || '#3B82F6'} 
                                                onChange={(e) => setGraphData(prev => ({ ...prev, totalColor: e.target.value }))} 
                                                className="flex-1 p-1.5 border border-gray-300 rounded text-sm" 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Values on Bars</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showValues: !prev.showValues }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showValues !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showValues !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Connectors</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showConnectors: !prev.showConnectors }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showConnectors !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showConnectors !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button 
                    onClick={() => onUpdate && onUpdate(graphData)} 
                    className="w-full py-2 px-3 bg-blue-50 border-2 border-indigo-300 text-indigo-600 rounded-md text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 transition-colors"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default WaterfallChartSetting;
