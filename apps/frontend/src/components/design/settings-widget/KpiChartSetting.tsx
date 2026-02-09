'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, X, Database, RefreshCw } from 'lucide-react';
import { useCanvasHook } from '@/contexts/CanvasContext';

const KpiChartSetting = ({ initialData, onUpdate, onClose }) => {
    const { storedDataSets } = useCanvasHook();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({
        details: false,
        display: true,
        comparison: false,
        colors: false
    });
    const [kpiData, setKpiData] = useState(initialData);

    // Data selection states
    const [selectedDataSet, setSelectedDataSet] = useState(null);
    const [availableColumns, setAvailableColumns] = useState([]);
    const [primaryColumn, setPrimaryColumn] = useState('');
    const [aggregationType, setAggregationType] = useState('sum');
    const [isUsingStoredData, setIsUsingStoredData] = useState(false);

    // Function to detect if a column contains numeric data
    const isNumericColumn = (columnName) => {
        if (!selectedDataSet || !selectedDataSet.data) return false;

        const sampleSize = Math.min(10, selectedDataSet.data.length);
        const samples = selectedDataSet.data.slice(0, sampleSize);

        let numericCount = 0;
        for (const row of samples) {
            const value = row[columnName];
            if (value !== null && value !== undefined && value !== '') {
                const numValue = Number(value);
                if (!isNaN(numValue) && isFinite(numValue)) {
                    numericCount++;
                }
            }
        }

        return numericCount / sampleSize > 0.7;
    };

    useEffect(() => {
        setMounted(true);
        if (initialData) {
            setKpiData(initialData);
            // Check if this KPI was created from stored data
            if (initialData.dataSourceId) {
                const dataSet = storedDataSets.find(ds => ds.id === initialData.dataSourceId);
                if (dataSet) {
                    setSelectedDataSet(dataSet);
                    setAvailableColumns(dataSet.headers);
                    setPrimaryColumn(initialData.primaryMetric?.column || '');
                    setAggregationType(initialData.primaryMetric?.aggregation || 'sum');
                    setIsUsingStoredData(true);
                }
            }
        }
    }, [initialData, storedDataSets]);

    const handleDataSetSelect = (dataSet) => {
        setSelectedDataSet(dataSet);
        setAvailableColumns(dataSet.headers);
        // Automatically select the first numeric column
        const firstNumericCol = dataSet.headers.find(h => isNumericColumn(h));
        setPrimaryColumn(firstNumericCol || dataSet.headers[0]);
        setIsUsingStoredData(true);
    };

    const calculateValue = () => {
        if (!selectedDataSet || !primaryColumn) return 0;
        
        const values = selectedDataSet.data
            .map(row => Number(row[primaryColumn]) || 0)
            .filter(val => !isNaN(val));
        
        switch (aggregationType) {
            case 'sum':
                return values.reduce((sum, val) => sum + val, 0);
            case 'average':
                return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            case 'count':
                return values.length;
            case 'max':
                return values.length > 0 ? Math.max(...values) : 0;
            case 'min':
                return values.length > 0 ? Math.min(...values) : 0;
            default:
                return 0;
        }
    };

    const handleRegenerateKpi = () => {
        if (!selectedDataSet || !primaryColumn) {
            alert('Please select data source and configure primary metric first.');
            return;
        }

        const calculatedValue = calculateValue();
        const updatedKpiData = {
            ...kpiData,
            primaryValue: calculatedValue,
            dataSourceId: selectedDataSet.id,
            primaryMetric: {
                column: primaryColumn,
                aggregation: aggregationType
            }
        };

        setKpiData(updatedKpiData);
        onUpdate && onUpdate(updatedKpiData);
    };

    const handleTitleChange = (e) => {
        if (!mounted) return;
        setKpiData(prev => ({ ...prev, title: e.target.value }));
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!mounted || !kpiData) {
        return (
            <div className="w-80 h-full bg-white border-r border-gray-200 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="pr-2 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold text-black">Edit KPI Widget</h2>
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
                    <div className="p-4 space-y-4">
                        {/* KPI Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">KPI Title</label>
                            <input
                                type="text"
                                value={kpiData.title}
                                onChange={handleTitleChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                placeholder="Enter KPI title"
                            />
                        </div>

                        {/* Data Source Selection */}
                        <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                            <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                                <Database size={16} className="text-indigo-600" />
                                <span>Data Source</span>
                            </h4>

                            {storedDataSets.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedDataSet && (
                                        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-green-800 text-sm">{selectedDataSet.name}</div>
                                                    <div className="text-xs text-green-600">
                                                        {selectedDataSet.rowCount} rows • {selectedDataSet.headers.length} columns
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedDataSet(null);
                                                        setIsUsingStoredData(false);
                                                        setPrimaryColumn('');
                                                    }}
                                                    className="text-green-600 hover:text-green-800 text-sm underline"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!selectedDataSet && (
                                        <div className="space-y-2 max-h-50 overflow-y-auto">
                                            {storedDataSets.map(dataSet => (
                                                <button
                                                    key={dataSet.id}
                                                    onClick={() => handleDataSetSelect(dataSet)}
                                                    className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                                                >
                                                    <div className="font-medium text-gray-800">{dataSet.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {dataSet.rowCount} rows • {dataSet.headers.join(', ').substring(0, 30)}...
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    <Database size={24} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No datasets available</p>
                                    <p className="text-xs">Import data using the "Data" tab first</p>
                                </div>
                            )}
                        </div>

                        {/* Primary Metric Configuration */}
                        {selectedDataSet && (
                            <div className="space-y-4">
                                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                    <h5 className="font-medium text-gray-700 mb-3">Primary Metric</h5>
                                    
                                    {/* Field Selection in Grid Layout */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Value Column</label>
                                            <select
                                                value={primaryColumn}
                                                onChange={(e) => setPrimaryColumn(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black"
                                            >
                                                <option value="">Select column...</option>
                                                {availableColumns.map(column => {
                                                    const isNumeric = isNumericColumn(column);
                                                    return (
                                                        <option key={column} value={column}>
                                                            {isNumeric ? 'Σ ' : ''}{column}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">Calculation Method</label>
                                            <select
                                                value={aggregationType}
                                                onChange={(e) => setAggregationType(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black"
                                            >
                                                <option value="sum">Sum</option>
                                                <option value="average">Average</option>
                                                <option value="count">Count</option>
                                                <option value="max">Maximum</option>
                                                <option value="min">Minimum</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Value Preview */}
                                    {primaryColumn && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                                            <div className="text-sm font-medium text-blue-800">Calculated Value</div>
                                            <div className="text-2xl font-bold text-blue-900 mt-1">
                                                {kpiData.primaryValuePrefix || ''}{calculateValue().toLocaleString()}{kpiData.primaryValueSuffix || ''}
                                            </div>
                                            <div className="text-xs text-blue-600 mt-1">
                                                From {selectedDataSet.rowCount} rows
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Generate KPI Button */}
                                <button
                                    onClick={handleRegenerateKpi}
                                    disabled={!primaryColumn}
                                    className="flex items-center justify-center gap-2 w-full py-2 px-4 border-2 border-indigo-300 text-indigo-600 bg-blue-50 rounded-md text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw size={16} />
                                    <span>Update KPI Data</span>
                                </button>
                            </div>
                        )}

                        {/* Current Configuration Summary */}
                        {isUsingStoredData && kpiData.primaryValue !== undefined && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <h5 className="font-medium text-blue-800 text-sm mb-2">Current Configuration</h5>
                                <div className="text-xs text-blue-700 space-y-1">
                                    <div>📊 Data Source: {selectedDataSet?.name}</div>
                                    <div>📈 Value Column: {primaryColumn}</div>
                                    <div>🔢 Calculation: {aggregationType}</div>
                                    <div>💰 Current Value: {kpiData.primaryValuePrefix || ''}{kpiData.primaryValue?.toLocaleString()}{kpiData.primaryValueSuffix || ''}</div>
                                </div>
                            </div>
                        )}
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
                                            onClick={() => setKpiData(prev => ({ ...prev, showTitle: !prev.showTitle }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${kpiData.showTitle !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${kpiData.showTitle !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    {kpiData.showTitle !== false && (
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Edit Text</label>
                                            <input
                                                type="text"
                                                value={kpiData.title}
                                                onChange={handleTitleChange}
                                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                                placeholder="KPI title"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Display Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('display')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">Display</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.display ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.display && (
                                <div className="mt-3 space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Prefix</label>
                                            <input
                                                type="text"
                                                value={kpiData.primaryValuePrefix || ''}
                                                onChange={e => setKpiData(prev => ({ ...prev, primaryValuePrefix: e.target.value }))}
                                                className="w-full p-2 border border-gray-300 rounded-md text-sm text-black"
                                                placeholder="$"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Suffix</label>
                                            <input
                                                type="text"
                                                value={kpiData.primaryValueSuffix || ''}
                                                onChange={e => setKpiData(prev => ({ ...prev, primaryValueSuffix: e.target.value }))}
                                                className="w-full p-2 border border-gray-300 rounded-md text-sm text-black"
                                                placeholder="%"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Comparison Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('comparison')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">Comparison</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.comparison ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.comparison && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Comparison</span>
                                        <button
                                            onClick={() => setKpiData(prev => ({ ...prev, showComparison: !prev.showComparison }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${kpiData.showComparison !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${kpiData.showComparison !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    {kpiData.showComparison !== false && (
                                        <div className="space-y-2">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Comparison Label</label>
                                                <input
                                                    type="text"
                                                    value={kpiData.comparisonLabel || ''}
                                                    onChange={e => setKpiData(prev => ({ ...prev, comparisonLabel: e.target.value }))}
                                                    className="w-full p-2 border border-gray-300 rounded-md text-sm text-black"
                                                    placeholder="vs last month"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Value (%)</label>
                                                    <input
                                                        type="number"
                                                        value={kpiData.comparisonValue || ''}
                                                        onChange={e => setKpiData(prev => ({ ...prev, comparisonValue: parseFloat(e.target.value) || 0 }))}
                                                        className="w-full p-2 border border-gray-300 rounded text-sm text-black"
                                                        step="0.1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Direction</label>
                                                    <select
                                                        value={kpiData.comparisonDirection || 'neutral'}
                                                        onChange={e => setKpiData(prev => ({ ...prev, comparisonDirection: e.target.value }))}
                                                        className="w-full p-2 border border-gray-300 rounded text-sm text-black"
                                                    >
                                                        <option value="increase">Increase</option>
                                                        <option value="decrease">Decrease</option>
                                                        <option value="neutral">Neutral</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Colors Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('colors')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">Colors</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.colors ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.colors && (
                                <div className="mt-3 space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Background</label>
                                            <input
                                                type="color"
                                                value={kpiData.backgroundColor || '#ffffff'}
                                                onChange={e => setKpiData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                                className="w-full h-8 border border-gray-300 rounded"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Title Color</label>
                                            <input
                                                type="color"
                                                value={kpiData.titleColor || '#6B7280'}
                                                onChange={e => setKpiData(prev => ({ ...prev, titleColor: e.target.value }))}
                                                className="w-full h-8 border border-gray-300 rounded"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Value Color</label>
                                        <input
                                            type="color"
                                            value={kpiData.valueColor || '#1F2937'}
                                            onChange={e => setKpiData(prev => ({ ...prev, valueColor: e.target.value }))}
                                            className="w-full h-8 border border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button onClick={() => onUpdate && onUpdate(kpiData)} className="w-full py-2 px-3 bg-blue-50 border-2 border-indigo-300 text-indigo-600 rounded-md text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default KpiChartSetting;