'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, X, Database, RefreshCw, TrendingUp } from 'lucide-react';
import { useCanvasHook } from '@/contexts/CanvasContext';

const WaterfallChartSetting = ({ initialData, onUpdate, onClose }) => {
    const { storedDataSets } = useCanvasHook();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({
        details: true,
        appearance: true,
        colors: true,
        axes: false
    });
    const [graphData, setGraphData] = useState(initialData);
    
    // Data mapping states
    const [selectedDataSet, setSelectedDataSet] = useState(null);
    const [labelField, setLabelField] = useState('');
    const [valueField, setValueField] = useState('');
    const [aggregationType, setAggregationType] = useState('sum');
    const [initialValue, setInitialValue] = useState(0);
    const [isUsingStoredData, setIsUsingStoredData] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (initialData) {
            setGraphData(initialData);
            
            // Load existing data source if available
            if (initialData.dataSourceId) {
                const dataSet = storedDataSets.find(ds => ds.id === initialData.dataSourceId);
                if (dataSet) {
                    setSelectedDataSet(dataSet);
                    setLabelField(initialData.labelField || '');
                    setValueField(initialData.valueField || '');
                    setAggregationType(initialData.aggregationType || 'sum');
                    setInitialValue(initialData.initialValue || 0);
                    setIsUsingStoredData(true);
                }
            }
        }
    }, [initialData, storedDataSets]);

    const handleTitleChange = useCallback((e) => {
        if (!mounted) return;
        setGraphData(prev => ({ ...prev, title: e.target.value }));
    }, [mounted]);

    const isNumericColumn = useCallback((columnName) => {
        if (!selectedDataSet) return false;
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
    }, [selectedDataSet]);

    const handleDataSetSelect = useCallback((dataSet) => {
        setSelectedDataSet(dataSet);
        setIsUsingStoredData(true);
        
        // Smart defaults - detect first numeric column
        const isNumeric = (columnName) => {
            const sampleSize = Math.min(10, dataSet.data.length);
            const samples = dataSet.data.slice(0, sampleSize);
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
        
        const firstNumeric = dataSet.headers.find(h => isNumeric(h));
        setLabelField(dataSet.headers[0] || '');
        setValueField(firstNumeric || dataSet.headers[1] || dataSet.headers[0] || '');
        setAggregationType('sum'); // Reset to default
        setInitialValue(0); // Reset initial value
    }, []);

    const handleRegenerateWaterfall = useCallback(() => {
        if (!selectedDataSet || !labelField || !valueField) return;
        
        try {
            let labels, dataPoints;

            if (aggregationType === 'none') {
                // No aggregation - use raw data
                labels = selectedDataSet.data
                    .map(row => String(row[labelField] || 'Unknown'))
                    .filter(label => label.trim() !== '');

                dataPoints = selectedDataSet.data
                    .map(row => {
                        const value = Number(row[valueField]);
                        return isNaN(value) ? 0 : value;
                    })
                    .slice(0, labels.length);
            } else {
                // Group by labelField and aggregate valueField
                const grouped = {};
                
                selectedDataSet.data.forEach(row => {
                    const label = String(row[labelField] || 'Unknown');
                    const value = Number(row[valueField]);
                    
                    if (!grouped[label]) {
                        grouped[label] = {
                            values: [],
                            count: 0
                        };
                    }
                    
                    if (!isNaN(value) && isFinite(value)) {
                        grouped[label].values.push(value);
                    }
                    grouped[label].count++;
                });

                // Calculate aggregated values
                labels = Object.keys(grouped);
                dataPoints = labels.map(label => {
                    const group = grouped[label];
                    
                    if (aggregationType === 'sum') {
                        return group.values.reduce((acc, val) => acc + val, 0);
                    } else if (aggregationType === 'average') {
                        return group.values.length > 0 
                            ? group.values.reduce((acc, val) => acc + val, 0) / group.values.length 
                            : 0;
                    } else if (aggregationType === 'count') {
                        return group.count;
                    } else if (aggregationType === 'min') {
                        return group.values.length > 0 ? Math.min(...group.values) : 0;
                    } else if (aggregationType === 'max') {
                        return group.values.length > 0 ? Math.max(...group.values) : 0;
                    }
                    return 0;
                });
            }

            if (labels.length === 0 || dataPoints.length === 0) {
                alert('No valid data found. Please check your column mappings.');
                return;
            }

            const updatedGraphData = {
                ...graphData,
                labels,
                dataPoints,
                initialValue,
                dataSourceId: selectedDataSet.id,
                labelField,
                valueField,
                aggregationType
            };
            
            setGraphData(updatedGraphData);
            onUpdate && onUpdate(updatedGraphData);
            
            // Show success message
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000);
            
            // Don't close the data selection - keep it visible for easy changes
        } catch (error) {
            console.error('Error regenerating waterfall:', error);
            alert('Error processing data.');
        }
    }, [selectedDataSet, labelField, valueField, aggregationType, initialValue, graphData, onUpdate]);

    const handleBackToDataSelection = useCallback(() => {
        setIsUsingStoredData(false);
        setSelectedDataSet(null);
        setLabelField('');
        setValueField('');
        setAggregationType('sum');
        setInitialValue(0);
    }, []);

    const toggleSection = useCallback((section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    }, []);

    if (!mounted || !graphData) {
        return (
            <div className="w-80 h-full bg-background border-r border-gray-200 flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="pr-2 h-full bg-background border-r border-gray-200 flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold text-foreground">Edit Waterfall Chart</h2>
                <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-md">
                    <X size={16} />
                </button>
            </div>

            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('data')}
                    className={`relative flex-1 py-3 px-4 text-sm font-medium transition-all ${activeTab === 'data' ? 'text-blue-600 bg-blue-50 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 after:content-[""]' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                    Data
                </button>
                <button
                    onClick={() => setActiveTab('customize')}
                    className={`relative flex-1 py-3 px-4 text-sm font-medium transition-all ${activeTab === 'customize' ? 'text-blue-600 bg-blue-50 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 after:content-[""]' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                    Customize
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'data' && (
                    <div className="p-4 space-y-4">
                        {/* Chart Title */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Chart Title</label>
                                    <input
                                        type="text"
                                        value={graphData.title}
                                        onChange={handleTitleChange}
                                className="w-full p-2 border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                        {/* Data Source Selection */}
                        <div className="border border-border rounded-lg p-3 bg-muted">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-foreground flex items-center space-x-2">
                                        <Database size={16} className="text-indigo-600" />
                                        <span>Data Source</span>
                                    </h4>
                                {isUsingStoredData && selectedDataSet && (
                                    <button
                                        onClick={handleBackToDataSelection}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                                    >
                                        Change
                                    </button>
                                )}
                            </div>

                            {isUsingStoredData && selectedDataSet ? (
                                <div className="bg-background border border-indigo-200 rounded p-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-foreground">{selectedDataSet.name}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {selectedDataSet.rowCount} rows • {selectedDataSet.headers.length} columns
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {storedDataSets.length > 0 ? (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {storedDataSets.map(dataSet => (
                                                <button
                                                    key={dataSet.id}
                                                    onClick={() => handleDataSetSelect(dataSet)}
                                                    className="w-full text-left p-2 text-sm bg-background border border-border rounded hover:bg-indigo-500/10 hover:border-indigo-300 transition-colors"
                                                >
                                                    <div className="font-medium text-foreground">{dataSet.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {dataSet.rowCount} rows • {dataSet.headers.length} columns
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                    <Database size={24} className="mx-auto mb-2" />
                                    <p className="text-sm">No datasets available</p>
                                    <p className="text-xs">Import data using the "Data" tab first</p>
                                </div>
                            )}
                                </>
                            )}
                        </div>

                        {/* Enhanced Column Configuration */}
                        {selectedDataSet && (
                            <div className="space-y-4">
                                <div className="border border-border rounded-lg p-4 bg-muted">
                                    <h5 className="font-medium text-foreground mb-3">Waterfall Configuration</h5>
                                    
                                    {/* Initial Value */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Initial Starting Value
                                        </label>
                                        <input
                                            type="number"
                                            value={initialValue}
                                            onChange={(e) => setInitialValue(Number(e.target.value) || 0)}
                                            className="w-full p-2 border border-border rounded text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Enter starting value (e.g., 0, 100, 1000)"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">The beginning value for the waterfall</p>
                                    </div>

                                    {/* Field Selection in Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                Label Column
                                            </label>
                                            <select
                                                value={labelField}
                                                onChange={(e) => setLabelField(e.target.value)}
                                                className="w-full p-2 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="">Select column...</option>
                                                {selectedDataSet.headers.map(column => (
                                                    <option key={column} value={column}>
                                                        {isNumericColumn(column) ? 'Σ ' : ''}{column}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-muted-foreground mt-1">Categories for waterfall steps</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                <TrendingUp size={16} className="inline mr-1" />
                                                Value Column (Changes)
                                            </label>
                                            <select
                                                value={valueField}
                                                onChange={(e) => setValueField(e.target.value)}
                                                className="w-full p-2 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="">Select column...</option>
                                                {selectedDataSet.headers.map(column => (
                                                    <option key={column} value={column}>
                                                        {isNumericColumn(column) ? 'Σ ' : ''}{column}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-muted-foreground mt-1">Positive = increase, Negative = decrease</p>
                                        </div>
                                    </div>

                                    {/* Aggregation Type */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Aggregation Method
                                        </label>
                                        <select 
                                            value={aggregationType} 
                                            onChange={(e) => setAggregationType(e.target.value)} 
                                            className="w-full p-2 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="sum">Sum</option>
                                            <option value="average">Average</option>
                                            <option value="count">Count</option>
                                            <option value="min">Minimum</option>
                                            <option value="max">Maximum</option>
                                            <option value="none">None (Use Raw Data)</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            How to combine multiple rows with the same label
                                        </p>
                                    </div>
                                </div>

                                {/* Update Button */}
                                <button
                                    onClick={handleRegenerateWaterfall}
                                    disabled={!labelField || !valueField}
                                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw size={16} />
                                    <span>Update Waterfall Data</span>
                                </button>

                                {/* Success Message */}
                                {updateSuccess && (
                                <div className="bg-muted border border-border rounded-lg p-2 text-center animate-fadeIn">
                                    <p className="text-sm font-medium text-foreground">✓ Chart updated successfully!</p>
                                    <p className="text-xs text-muted-foreground mt-1">You can now change columns and update again</p>
                                </div>
                                )}
                            </div>
                        )}

                        {/* Current Configuration Summary */}
                        {isUsingStoredData && labelField && valueField && (
                            <div className="bg-muted border border-border rounded-lg p-3">
                                <h5 className="text-sm font-medium text-foreground mb-2">Current Configuration</h5>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div><span className="font-medium">Label:</span> {labelField}</div>
                                    <div><span className="font-medium">Value:</span> {valueField}</div>
                                    <div><span className="font-medium">Aggregation:</span> {aggregationType.charAt(0).toUpperCase() + aggregationType.slice(1)}</div>
                                    <div><span className="font-medium">Starting Value:</span> {initialValue}</div>
                                    <div><span className="font-medium">Data Points:</span> {graphData.dataPoints?.length || 0}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                 {activeTab === 'customize' && (
                                    <div className="p-4 space-y-4">
                                        {/* Details Section */}
                                        <div className="border border-border rounded-lg p-4">
                                            <div
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => toggleSection('details')}
                                            >
                                                <h3 className="text-sm font-medium text-foreground">Details</h3>
                                                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections.details ? 'rotate-180' : ''}`} />
                                            </div>
                                            {expandedSections.details && (
                                                <div className="mt-3 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Show Title</span>
                                                        <button
                                                            onClick={() => setGraphData(prev => ({ ...prev, showTitle: !prev.showTitle }))}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showTitle ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showTitle ? 'translate-x-6' : 'translate-x-1'}`}
                                                            />
                                                        </button>
                                                    </div>
                                                    {graphData.showTitle !== false && (
                                                        <div>
                                                            <label className="block text-xs text-muted-foreground mb-1">Title Text</label>
                                                            <input
                                                                type="text"
                                                                value={graphData.title}
                                                                onChange={handleTitleChange}
                                                                className="w-full p-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-foreground"
                                                                placeholder="Title goes here"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                
                                        {/* Appearance Section */}
                                        <div className="border border-border rounded-lg p-4">
                                            <div
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => toggleSection('appearance')}
                                            >
                                                <h3 className="text-sm font-medium text-foreground">Appearance</h3>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.appearance ? 'rotate-180' : ''}`} />
                                            </div>
                                            {expandedSections.appearance && (
                                                <div className="mt-3 space-y-3">
                                                    <div>
                                                        <label className="block text-xs text-muted-foreground mb-1">Value Format</label>
                                                        <select
                                                            value={graphData.valueFormat || 'default'}
                                                            onChange={(e) => setGraphData(prev => ({ ...prev, valueFormat: e.target.value }))}
                                                            className="w-full p-2 border border-border rounded text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        >
                                                            <option value="default">Default</option>
                                                            <option value="currency">Currency ($)</option>
                                                            <option value="percentage">Percentage (%)</option>
                                                            <option value="compact">Compact (K, M)</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Show Data Labels</span>
                                                        <button
                                                            onClick={() => setGraphData(prev => ({ ...prev, showDataLabels: !prev.showDataLabels }))}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showDataLabels ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showDataLabels ? 'translate-x-6' : 'translate-x-1'}`}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                
                                        {/* Colors Section */}
                                        <div className="border border-border rounded-lg p-4">
                                            <div
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => toggleSection('colors')}
                                            >
                                                <h3 className="text-sm font-medium text-foreground">Colors</h3>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.colors ? 'rotate-180' : ''}`} />
                                            </div>
                                            {expandedSections.colors && (
                                                <div className="mt-3 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm text-muted-foreground">Positive Color (Increases)</label>
                                                        <input
                                                            type="color"
                                                            value={graphData.positiveColor || '#10B981'}
                                                            onChange={(e) => setGraphData(prev => ({ ...prev, positiveColor: e.target.value }))}
                                                            className="w-10 h-10 p-1 border border-border rounded cursor-pointer"
                                                        />
                                                    </div>
                                                            <div className="flex items-center justify-between">
                                                        <label className="text-sm text-muted-foreground">Negative Color (Decreases)</label>
                                                                    <input
                                                            type="color"
                                                            value={graphData.negativeColor || '#EF4444'}
                                                            onChange={(e) => setGraphData(prev => ({ ...prev, negativeColor: e.target.value }))}
                                                            className="w-10 h-10 p-1 border border-border rounded cursor-pointer"
                                                                    />
                                                                </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm text-muted-foreground">Total Color (Start/End)</label>
                                                                    <input
                                                            type="color"
                                                            value={graphData.totalColor || '#3B82F6'}
                                                            onChange={(e) => setGraphData(prev => ({ ...prev, totalColor: e.target.value }))}
                                                            className="w-10 h-10 p-1 border border-border rounded cursor-pointer"
                                                                    />
                                                                </div>
                                                </div>
                                            )}
                                        </div>
                
                                        {/* Axes Section */}
                                        <div className="border border-border rounded-lg p-4">
                                            <div
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => toggleSection('axes')}
                                            >
                                                <h3 className="text-sm font-medium text-foreground">Axes</h3>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.axes ? 'rotate-180' : ''}`} />
                                            </div>
                                            {expandedSections.axes && (
                                                <div className="mt-3 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Show X Axis</span>
                                                        <button
                                                            onClick={() => setGraphData(prev => ({ ...prev, showXAxis: !prev.showXAxis }))}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showXAxis !== false ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showXAxis !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                                            />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Show Y Axis</span>
                                                        <button
                                                            onClick={() => setGraphData(prev => ({ ...prev, showYAxis: !prev.showYAxis }))}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showYAxis !== false ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showYAxis !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                                            />
                                                        </button>
                                                    </div>
                                                    {graphData.showYAxis !== false && (
                                                            <div>
                                                            <label className="block text-xs text-muted-foreground mb-1">Y-Axis Title</label>
                                                                <input
                                                                type="text"
                                                                value={graphData.yAxisTitle || ''}
                                                                onChange={e => setGraphData(prev => ({ ...prev, yAxisTitle: e.target.value }))}
                                                                className="w-full p-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-foreground"
                                                                placeholder="Y Axis Label"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-muted">
                <button
                    onClick={() => onUpdate && onUpdate(graphData)}
                    className="w-full py-2 px-3 bg-blue-50 border-2 border-indigo-300 text-indigo-600 rounded-md text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default WaterfallChartSetting;