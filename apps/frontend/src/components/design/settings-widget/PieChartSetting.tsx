'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, X, Database, Info } from 'lucide-react';
import { useCanvasHook } from '@/contexts/CanvasContext';

const PieChartSetting = ({ initialData, onUpdate, onClose }) => {
    const { storedDataSets } = useCanvasHook();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({ details: true, display: true });
    const [graphData, setGraphData] = useState(initialData);
    const [parsedData, setParsedData] = useState(null); // Used to show the DataMapper

    useEffect(() => {
        setMounted(true);
        if (initialData) {
            setGraphData(initialData);
        }
    }, [initialData]);

    const handleDataSetSelect = (dataSet) => {
        const dataForMapper = {
            data: dataSet.data,
            meta: { fields: dataSet.headers }
        };
        setParsedData(dataForMapper);
    };

    const handleDataMapped = ({ labels, dataPoints, generatedTitle }) => {
        const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#FBBF24', '#F87171'];
        const generatedColors = labels.map((_, i) => colors[i % colors.length]);

        const updatedGraphData = {
            ...graphData,
            title: generatedTitle, // Use the generated title
            labels,
            datasets: [{ ...graphData.datasets[0], dataPoints, colors: generatedColors }],
        };
        setGraphData(updatedGraphData);
        onUpdate && onUpdate(updatedGraphData);
        // Don't hide the mapper - keep it visible for re-selection
        // setParsedData(null);
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
            <div className="w-80 h-full bg-white dark:bg-gray-800 border-r border-gray-200 flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className=" pr-2 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold text-black dark:text-white">Edit Pie Chart</h2>
                <button onClick={onClose} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-700 rounded-md"><X size={16} /></button>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('data')}
                    className={`relative flex-1 py-3 px-4 text-sm font-medium transition-all
                    ${activeTab === 'data'
                            ? 'text-blue-600 bg-blue-50 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-800 after:via-indigo-700 after:to-purple-600 after:content-[""]'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-700'}
                    `}
                >
                    Data
                </button>

                <button
                    onClick={() => setActiveTab('customize')}
                    className={`relative flex-1 py-3 px-4 text-sm font-medium transition-all
                    ${activeTab === 'customize'
                            ? 'text-blue-600 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-800 bg-blue-50 after:via-indigo-700 after:to-purple-600 after:content-[""]'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-700'}
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Chart Title</label>
                            <input
                                type="text"
                                value={graphData.title}
                                onChange={handleTitleChange}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black dark:text-white"
                                placeholder="Enter chart title"
                            />
                        </div>

                        {/* Data Source Selection */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
                            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3 flex items-center space-x-2">
                                <Database size={16} className="text-indigo-600" />
                                <span>Data Source</span>
                            </h4>

                            {storedDataSets.length > 0 ? (
                                <div className="space-y-2 max-h-50 overflow-y-auto">
                                    {storedDataSets.map(dataSet => (
                                        <button
                                            key={dataSet.id}
                                            onClick={() => handleDataSetSelect(dataSet)}
                                            className="w-full text-left p-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 transition-colors"
                                        >
                                            <div className="font-medium text-gray-800 dark:text-gray-100">{dataSet.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                📊 {dataSet.rowCount} rows • {dataSet.headers.length} columns
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Columns: {dataSet.headers.slice(0, 3).join(', ')}
                                                {dataSet.headers.length > 3 && ` +${dataSet.headers.length - 3} more`}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
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
                        {/* Details Section */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('details')}>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Details</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.details ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.details && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Show Title</span>
                                        <button onClick={() => setGraphData(prev => ({ ...prev, showTitle: !prev.showTitle }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showTitle ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    {graphData.showTitle && (
                                        <div>
                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Title Text</label>
                                            <input type="text" value={graphData.title} onChange={handleTitleChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-black dark:text-white" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Display Options Section */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('display')}>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Display Options</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.display ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.display && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-gray-600 dark:text-gray-300">Show Legend</span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Display legend on the right side of chart</p>
                                        </div>
                                        <button 
                                            onClick={() => setGraphData(prev => ({ 
                                                ...prev, 
                                                showLegend: !prev.showLegend
                                            }))} 
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showLegend ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showLegend ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t bg-gray-50 dark:bg-gray-700">
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

// Enhanced DataMapper with Aggregation Logic and Dynamic Title Generation
const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields;
    const [aggregationType, setAggregationType] = useState('sum');

    const isNumericColumn = (columnName) => {
        const sampleSize = Math.min(10, data.data.length);
        if (sampleSize === 0) return false;
        const samples = data.data.slice(0, sampleSize);
        let numericCount = 0;
        for (const row of samples) {
            const value = row[columnName];
            if (value !== null && value !== undefined && value !== '') {
                if (!isNaN(Number(value))) numericCount++;
            }
        }
        return (numericCount / sampleSize) > 0.7;
    };

    const [labelField, setLabelField] = useState(headers.find(h => !isNumericColumn(h)) || headers[0]);
    const [valueField, setValueField] = useState(headers.find(h => isNumericColumn(h)) || headers[1] || headers[0]);

    // Function to generate dynamic title
    const generateTitle = (legend, value, aggregation) => {
        const aggregationLabels = {
            'sum': 'Sum',
            'count': 'Count',
            'average': 'Average',
            'min': 'Minimum',
            'max': 'Maximum',
            'distinct_count': 'Distinct Count'
        };

        // Format: Legend - Values - Value Calculation
        // Example: "Region - Sales - Sum" or "Category - Revenue - Average"
        return `${legend} - ${value} - ${aggregationLabels[aggregation]}`;
    };

    const handleGenerate = () => {
        const aggregationMap = new Map();

        data.data.forEach(row => {
            const category = row[labelField];
            const value = row[valueField];

            if (category == null || category === '') return;

            if (!aggregationMap.has(category)) {
                switch (aggregationType) {
                    case 'average': aggregationMap.set(category, { sum: 0, count: 0 }); break;
                    case 'min': aggregationMap.set(category, Infinity); break;
                    case 'max': aggregationMap.set(category, -Infinity); break;
                    case 'distinct_count': aggregationMap.set(category, new Set()); break;
                    default: aggregationMap.set(category, 0); break;
                }
            }

            const numericValue = Number(value) || 0;

            switch (aggregationType) {
                case 'sum':
                    aggregationMap.set(category, aggregationMap.get(category) + numericValue);
                    break;
                case 'count':
                    if (value != null) aggregationMap.set(category, aggregationMap.get(category) + 1);
                    break;
                case 'average':
                    const avgData = aggregationMap.get(category);
                    avgData.sum += numericValue;
                    avgData.count++;
                    break;
                case 'min':
                    aggregationMap.set(category, Math.min(aggregationMap.get(category), numericValue));
                    break;
                case 'max':
                    aggregationMap.set(category, Math.max(aggregationMap.get(category), numericValue));
                    break;
                case 'distinct_count':
                    if (value != null) aggregationMap.get(category).add(value);
                    break;
            }
        });

        const labels = Array.from(aggregationMap.keys());
        let dataPoints = [];

        switch (aggregationType) {
            case 'average':
                dataPoints = labels.map(label => {
                    const { sum, count } = aggregationMap.get(label);
                    return count > 0 ? sum / count : 0;
                });
                break;
            case 'distinct_count':
                dataPoints = labels.map(label => aggregationMap.get(label).size);
                break;
            case 'min':
                dataPoints = labels.map(label => (aggregationMap.get(label) === Infinity ? 0 : aggregationMap.get(label)));
                break;
            case 'max':
                dataPoints = labels.map(label => (aggregationMap.get(label) === -Infinity ? 0 : aggregationMap.get(label)));
                break;
            default:
                dataPoints = Array.from(aggregationMap.values());
        }
        
        // Generate the dynamic title
        const generatedTitle = generateTitle(labelField, valueField, aggregationType);
        
        onMap({ labels, dataPoints, generatedTitle });
    };

    return (
        <div className="space-y-4 p-4 border-2 border-dashed bg-gray-50 dark:bg-gray-700 border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-xs text-gray-700 dark:text-gray-200">Configure Chart Data</h4>
                <button onClick={onBack} className="text-xs text-indigo-600 hover:text-indigo-800 underline">
                    ← Change Data Source
                </button>
            </div>
            
            {/* Preview of generated title */}
            {labelField && valueField && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <Info size={16} className="text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-800">Generated Title Preview</span>
                    </div>
                    <p className="text-sm text-indigo-700 mt-1 font-medium">
                        "{generateTitle(labelField, valueField, aggregationType)}"
                    </p>
                </div>
            )}
            
            <div className="grid grid-row-2 md:grid-row-2 gap-4">
                <div>
                    <label className="block font-medium text-gray-600 dark:text-gray-300 mb-2">Category Column (Labels)</label>
                    <div className="max-h-32 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white">
                        {headers.map(header => (
                            <ColumnSelector 
                                key={`label-${header}`} 
                                header={header} 
                                checked={labelField === header} 
                                onChange={setLabelField} 
                                name="labelField" 
                                isNumeric={isNumericColumn(header)} 
                            />
                        ))}
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Value Column (Slice Sizes)</label>
                    <div className="max-h-32 overflow-y-auto p-2 border bg-white dark:bg-gray-800 rounded-md space-y-1">
                        {headers.map(header => (
                            <ColumnSelector 
                                key={`value-${header}`} 
                                header={header} 
                                checked={valueField === header} 
                                onChange={setValueField} 
                                name="valueField" 
                                isNumeric={isNumericColumn(header)} 
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Aggregation Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Value Calculation</label>
                <select
                    value={aggregationType}
                    onChange={(e) => setAggregationType(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white text-black dark:text-white"
                >
                    <option value="sum">Sum</option>
                    <option value="count">Count</option>
                    <option value="average">Average</option>
                    <option value="min">Minimum</option>
                    <option value="max">Maximum</option>
                    <option value="distinct_count">Distinct Count</option>
                </select>
            </div>

            <button
                onClick={handleGenerate}
                disabled={!labelField || !valueField}
                className="w-full flex items-center justify-center gap-1 px-[4px] py-[4px] border-2 border-indigo-300 text-indigo-600 bg-blue-50 rounded-sm text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Update Chart
            </button>

            {/* Add option to go back to data selection if needed */}
            <button
                onClick={onBack}
                className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                Change Data Source
            </button>
        </div>
    );
};

const ColumnSelector = ({ header, checked, onChange, name, isNumeric }) => (
    <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:bg-gray-700 px-1 py-0.5 rounded">
        <input
            type="checkbox"
            name={name}
            value={header}
            checked={checked}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 border-gray-300 dark:border-gray-600 mr-3 text-indigo-600 focus:ring-indigo-500"
        />
        <div className="flex items-center space-x-2 min-w-0 flex-1">
            {isNumeric ? (
                <>
                    <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>
                    <span className="text-sm text-gray-900 truncate">{header}</span>
                </>
            ) : (
                <span className="text-sm text-gray-900 truncate pl-4">{header}</span>
            )}
        </div>
    </label>
);

export default PieChartSetting;