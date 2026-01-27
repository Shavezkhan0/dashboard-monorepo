'use client';
'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, X, Database } from 'lucide-react';
import { useCanvasHook } from '../../Context/CanvasContext';

const PieChartSetting = ({ initialData, onUpdate, onClose }) => {
    const { storedDataSets } = useCanvasHook();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({ details: true });
    const [graphData, setGraphData] = useState(initialData);
    const [parsedData, setParsedData] = useState(null); // Used to show the DataMapper

    useEffect(() => {
        setMounted(true);
        if (initialData) {
            setGraphData(initialData);
        }
    }, [initialData]);

    const handleDataSetSelect = (dataSet) => {
        // Prepare data for the DataMapper component
        const dataForMapper = {
            data: dataSet.data,
            meta: { fields: dataSet.headers }
        };
        setParsedData(dataForMapper);
    };

    const handleDataMapped = ({ labels, dataPoints }) => {
        const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#FBBF24', '#F87171'];
        const generatedColors = labels.map((_, i) => colors[i % colors.length]);

        const updatedGraphData = {
            ...graphData,
            labels,
            datasets: [{ ...graphData.datasets[0], dataPoints, colors: generatedColors }],
            // You might want to store the original dataSourceId if needed later
            // dataSourceId: parsedData.id 
        };
        setGraphData(updatedGraphData);
        onUpdate && onUpdate(updatedGraphData);
        setParsedData(null); // Hide mapper and return to main view
    };
    
    const handleBackToDataSelection = () => {
        setParsedData(null);
    };

    const handleTitleChange = (e) => {
        if (!mounted) return;
        setGraphData(prev => ({ ...prev, title: e.target.value }));
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
        <div className=" pr-2 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold">Edit Pie Chart</h2>
                <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><X size={16} /></button>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'data' && (
                     parsedData ? (
                        <DataMapper 
                            data={parsedData} 
                            onMap={handleDataMapped} 
                            onBack={handleBackToDataSelection} 
                        />
                    ) : (
                    <>
                        {/* Chart Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title</label>
                            <input
                                type="text"
                                value={graphData.title}
                                onChange={handleTitleChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                placeholder="Enter chart title"
                            />
                        </div>

                        {/* Data Source Selection */}
                        <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                            <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                                <Database size={16} className="text-indigo-600" />
                                <span>Data Source</span>
                            </h4>

                            {storedDataSets.length > 0 ? (
                                <div className="space-y-2 max-h-50 overflow-y-auto">
                                    {storedDataSets.map(dataSet => (
                                        <button
                                            key={dataSet.id}
                                            onClick={() => handleDataSetSelect(dataSet)}
                                            className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                                        >
                                            <div className="font-medium text-gray-800">{dataSet.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {dataSet.rowCount} rows • {dataSet.headers.length} columns
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    <Database size={24} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No datasets available</p>
                                    <p className="text-xs">Import data using the "Data" tab first</p>
                                </div>
                            )}
                        </div>
                    </>
                    )
                )}
                {activeTab === 'customize' && (
                    <div className="space-y-2">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('details')}>
                                <h3 className="text-sm font-medium text-gray-700">Details</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.details ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.details && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Title</span>
                                        <button onClick={() => setGraphData(prev => ({ ...prev, showTitle: !prev.showTitle }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showTitle ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    {graphData.showTitle && (
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Title Text</label>
                                            <input type="text" value={graphData.title} onChange={handleTitleChange} className="w-full p-2 border border-gray-300 rounded-md text-sm text-black" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t bg-gray-50">
                <button onClick={() => onUpdate && onUpdate(graphData)} className="w-full py-2 px-3 bg-blue-50 border-2 border-indigo-300
    text-indigo-600 rounded-md
    text-sm font-medium
    transition-all duration-200
    hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields;
    const [categoryField, setCategoryField] = useState(headers[0]);
    const [uniqueCategories, setUniqueCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    useEffect(() => {
        if (!categoryField || !data.data) return;
        const allValues = data.data.map(row => row[categoryField]);
        const unique = [...new Set(allValues)].filter(val => val != null && val !== '');
        setUniqueCategories(unique);
        setSelectedCategories(unique); // Select all by default
    }, [categoryField, data.data]);

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev => prev.includes(category) ? prev.filter(item => item !== category) : [...prev, category]);
    };

    const handleGenerate = () => {
        const columnData = data.data.map(row => row[categoryField]);
        const counts = {};
        for (const item of columnData) {
            if (selectedCategories.includes(item)) {
                counts[item] = (counts[item] || 0) + 1;
            }
        }
        onMap({ labels: Object.keys(counts), dataPoints: Object.values(counts) });
    };

    return (
        <div className="space-y-4 p-4 border-2 border-dashed bg-gray-50 border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-700">Configure Chart Data</h4>
                <button onClick={onBack} className="text-xs text-indigo-600 hover:text-indigo-800 underline">
                    ← Back to Data Selection
                </button>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Select Column to Count</label>
                <select value={categoryField} onChange={(e) => setCategoryField(e.target.value)} className="w-full text-black p-2 border border-gray-300 rounded text-sm">
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
            </div>
            {uniqueCategories.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-gray-700">Filter Categories</label>
                        <div className="space-x-3">
                            <button onClick={() => setSelectedCategories(uniqueCategories)} className="text-xs font-medium text-indigo-600 hover:underline">Select All</button>
                            <button onClick={() => setSelectedCategories([])} className="text-xs font-medium text-indigo-600 hover:underline">Unselect All</button>
                        </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto p-2 border bg-white rounded-md space-y-1">
                        {uniqueCategories.map(category => (
                            <div key={category} className="flex items-center">
                                <input id={`cb-cat-edit-${category}`} type="checkbox" checked={selectedCategories.includes(category)} onChange={() => handleCategoryToggle(category)} className="h-4 w-4 rounded border-gray-300" />
                                <label htmlFor={`cb-cat-edit-${category}`} className="ml-2 block text-sm text-gray-900">{String(category)}</label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <button onClick={handleGenerate} className="w-full flex items-center justify-center gap-1
    px-[4px] py-[4px]
    border-2 border-indigo-300
    text-indigo-600
    bg-blue-50
    rounded-sm
    text-sm font-medium
    transition-all duration-200
    hover:text-white
    hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600
    hover:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed">
                Update Chart
            </button>
        </div>
    );
};

export default PieChartSetting;
