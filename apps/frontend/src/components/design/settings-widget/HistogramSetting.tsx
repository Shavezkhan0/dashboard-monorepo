'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, X, Database, RefreshCw, BarChart3 } from 'lucide-react';
import { useCanvasHook } from '@/contexts/CanvasContext';

const HistogramSetting = ({ initialData, onUpdate, onClose }) => {
    const { storedDataSets } = useCanvasHook();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({
        details: true,
        binning: true,
        appearance: true,
        axes: false,
        colors: false
    });
    const [graphData, setGraphData] = useState(initialData);
    
    // Data mapping states
    const [selectedDataSet, setSelectedDataSet] = useState(null);
    const [dataField, setDataField] = useState('');
    const [numberOfBins, setNumberOfBins] = useState(5);
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
                    setDataField(initialData.dataField || '');
                    setNumberOfBins(initialData.numberOfBins || 5);
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
        setDataField(firstNumeric || dataSet.headers[0] || '');
        setNumberOfBins(5);
    }, []);

    const handleRegenerateHistogram = useCallback(() => {
        if (!selectedDataSet || !dataField) return;
        
        try {
            const rawData = selectedDataSet.data
                .map(row => Number(row[dataField]))
                .filter(n => !isNaN(n) && isFinite(n));

            if (rawData.length === 0) {
                alert('No valid numeric data found. Please check your column mapping.');
                return;
            }

            const updatedGraphData = {
                ...graphData,
                dataset: {
                    ...graphData.dataset,
                    rawData
                },
                numberOfBins,
                dataSourceId: selectedDataSet.id,
                dataField
            };
            
            setGraphData(updatedGraphData);
            onUpdate && onUpdate(updatedGraphData);
            
            // Show success message
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (error) {
            console.error('Error regenerating histogram:', error);
            alert('Error processing data.');
        }
    }, [selectedDataSet, dataField, numberOfBins, graphData, onUpdate]);

    const handleBackToDataSelection = useCallback(() => {
        setIsUsingStoredData(false);
        setSelectedDataSet(null);
        setDataField('');
        setNumberOfBins(5);
    }, []);

    const toggleSection = useCallback((section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    }, []);

    const dataStats = useMemo(() => {
        if (!selectedDataSet || !dataField) return null;
        const values = selectedDataSet.data
            .map(row => Number(row[dataField]))
            .filter(n => !isNaN(n) && isFinite(n));
        
        if (values.length === 0) return null;
        
        return {
            count: values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length
        };
    }, [selectedDataSet, dataField]);

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
                <h2 className="text-lg font-semibold text-foreground">Edit Histogram</h2>
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
                                    <h5 className="font-medium text-foreground mb-3">Histogram Configuration</h5>
                                    
                                    {/* Data Column Selection */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            <BarChart3 size={16} className="inline mr-1" />
                                            Data Column (Numeric)
                                        </label>
                                        <select
                                            value={dataField}
                                            onChange={(e) => setDataField(e.target.value)}
                                            className="w-full p-2 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Select column...</option>
                                            {selectedDataSet.headers.map(column => (
                                                <option key={column} value={column}>
                                                    {isNumericColumn(column) ? 'Σ ' : ''}{column}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-muted-foreground mt-1">Select a numeric column to create the histogram</p>
                                    </div>

                                    {/* Data Statistics */}
                                    {dataStats && (
                                        <div className="bg-muted border border-border rounded-lg p-3 mb-4">
                                            <h5 className="text-xs font-medium text-foreground mb-2">Data Statistics</h5>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-muted-foreground">Count:</span>
                                                    <span className="ml-1 font-medium text-gray-900">{dataStats.count}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Min:</span>
                                                    <span className="ml-1 font-medium text-gray-900">{dataStats.min.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Average:</span>
                                                    <span className="ml-1 font-medium text-gray-900">{dataStats.avg.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Max:</span>
                                                    <span className="ml-1 font-medium text-gray-900">{dataStats.max.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Number of Bins */}
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Number of Bins: <span className="text-indigo-600 font-bold">{numberOfBins}</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="3"
                                            max="20"
                                            value={numberOfBins}
                                            onChange={(e) => setNumberOfBins(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Number of intervals to group the data</p>
                                    </div>
                                </div>

                                {/* Update Button */}
                                <button
                                    onClick={handleRegenerateHistogram}
                                    disabled={!dataField}
                                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw size={16} />
                                    <span>Update Histogram Data</span>
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
                        {isUsingStoredData && dataField && (
                            <div className="bg-muted border border-border rounded-lg p-3">
                                <h5 className="text-sm font-medium text-foreground mb-2">Current Configuration</h5>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div><span className="font-medium">Data Column:</span> {dataField}</div>
                                    <div><span className="font-medium">Bins:</span> {numberOfBins}</div>
                                    <div><span className="font-medium">Data Points:</span> {graphData.dataset?.rawData?.length || 0}</div>
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
                                        <label className="text-sm text-muted-foreground">Bar Color</label>
                                        <input
                                            type="color"
                                            value={graphData.dataset?.color || '#118DFF'}
                                            onChange={(e) => setGraphData(prev => ({ 
                                                ...prev, 
                                                dataset: { ...prev.dataset, color: e.target.value }
                                            }))}
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
                                    {graphData.showXAxis !== false && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Show X Axis Title</span>
                                                <button
                                                    onClick={() => setGraphData(prev => ({ ...prev, showXAxisTitle: !prev.showXAxisTitle }))}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showXAxisTitle ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showXAxisTitle ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                            </div>
                                            {graphData.showXAxisTitle && (
                                                <div>
                                                    <label className="block text-xs text-muted-foreground mb-1">X-Axis Title</label>
                                                    <input
                                                        type="text"
                                                        value={graphData.xAxisTitle || ''}
                                                        onChange={e => setGraphData(prev => ({ ...prev, xAxisTitle: e.target.value }))}
                                                        className="w-full p-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-foreground"
                                                        placeholder="X Axis Label"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

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
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Show Y Axis Title</span>
                                                <button
                                                    onClick={() => setGraphData(prev => ({ ...prev, showYAxisTitle: !prev.showYAxisTitle }))}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showYAxisTitle ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showYAxisTitle ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                            </div>
                                            {graphData.showYAxisTitle && (
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

export default HistogramSetting;
