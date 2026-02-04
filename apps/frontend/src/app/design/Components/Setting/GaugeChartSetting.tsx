'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, X, Database, TrendingUp, RefreshCw } from 'lucide-react';
import { useCanvasHook } from '../../Context/CanvasContext';

const GaugeChartSetting = ({ initialData, onUpdate, onClose }) => {
    const { storedDataSets } = useCanvasHook();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({
        general: true,
        value: true,
        appearance: true,
        colors: true,
    });
    const [graphData, setGraphData] = useState(initialData);
    
    // Data mapping states
    const [selectedDataSet, setSelectedDataSet] = useState(null);
    const [valueField, setValueField] = useState('');
    const [targetField, setTargetField] = useState('manual');
    const [manualTarget, setManualTarget] = useState(50);
    const [isUsingStoredData, setIsUsingStoredData] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (initialData) {
            setGraphData(initialData);
            
            // Load existing data source if available
            if (initialData.dataSourceId) {
                const dataSet = storedDataSets.find(ds => ds.id === initialData.dataSourceId);
                if (dataSet) {
                    setSelectedDataSet(dataSet);
                    setValueField(initialData.valueField || '');
                    setTargetField(initialData.targetField || 'manual');
                    setIsUsingStoredData(true);
                }
            }
        }
    }, [initialData, storedDataSets]);

    const isNumericColumn = (columnName) => {
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
    };

    const handleDataSetSelect = (dataSet) => {
        setSelectedDataSet(dataSet);
        setIsUsingStoredData(true);
        
        // Smart defaults
        const firstNumeric = dataSet.headers.find(h => isNumericColumn(h));
        setValueField(firstNumeric || dataSet.headers[0]);
        setTargetField('manual');
    };

    const columnStats = useMemo(() => {
        if (!selectedDataSet || !valueField) return { min: 0, max: 100, avg: 0, values: [] };
        
        const values = selectedDataSet.data
            .map(row => Number(row[valueField]))
            .filter(val => !isNaN(val) && isFinite(val));
        
        if (values.length === 0) return { min: 0, max: 100, avg: 0, values: [] };
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        return { min, max, avg: Math.round(avg * 100) / 100, values };
    }, [selectedDataSet, valueField]);

    const handleRegenerateGauge = () => {
        if (!selectedDataSet || !valueField) return;
        
        const firstValue = columnStats.values[0] || 0;
        
        // Determine target value
        let targetValue;
        if (targetField === 'manual') {
            targetValue = manualTarget;
        } else if (targetField === 'average') {
            targetValue = columnStats.avg;
        } else if (targetField === 'max') {
            targetValue = columnStats.max;
        } else {
            const targetValues = selectedDataSet.data
                .map(row => Number(row[targetField]))
                .filter(val => !isNaN(val) && isFinite(val));
            targetValue = targetValues[0] || columnStats.avg;
        }
        
        const updatedGraphData = {
            ...graphData,
            value: firstValue,
            minValue: columnStats.min,
            maxValue: columnStats.max,
            target: targetValue,
            dataSourceId: selectedDataSet.id,
            valueField: valueField,
            targetField: targetField
        };
        
        setGraphData(updatedGraphData);
        onUpdate && onUpdate(updatedGraphData);
    };

    const handleBackToDataSelection = () => {
        setIsUsingStoredData(false);
        setSelectedDataSet(null);
    };

    const handlePropChange = (field, value) => {
        setGraphData(prev => ({ ...prev, [field]: value }));
    };

    const handleNumericPropChange = (field, value) => {
        setGraphData(prev => ({ ...prev, [field]: Number(value) }));
    };

    const handleColorChange = (index, newColor) => {
        setGraphData(prev => {
            const newColors = [...prev.colors];
            newColors[index] = newColor;
            return { ...prev, colors: newColors };
        });
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!mounted || !graphData) return <div className="p-4">Loading...</div>;

    return (
        <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 flex flex-col shadow-lg pr-2">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold text-black dark:text-white">Edit Gauge Chart</h2>
                <button onClick={onClose} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-700 rounded-md"><X size={16} /></button>
            </div>

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
                            ? 'text-blue-600 bg-blue-50 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-800 after:via-indigo-700 after:to-purple-600 after:content-[""]'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-700'}
                    `}
                >
                    Customize
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'data' && (
                    <div className="space-y-4">
                        {/* Gauge Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Gauge Title</label>
                            <input
                                type="text"
                                value={graphData.title}
                                onChange={(e) => handlePropChange('title', e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white text-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter gauge title"
                            />
                        </div>

                        {/* Data Source Selection */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-700 dark:text-gray-200 flex items-center space-x-2">
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
                                <div className="bg-white dark:bg-gray-800 border border-indigo-200 rounded p-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedDataSet.name}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                                                    className="w-full text-left p-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 transition-colors"
                                                >
                                                    <div className="font-medium text-gray-800 dark:text-gray-100">{dataSet.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {dataSet.rowCount} rows • {dataSet.headers.length} columns
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
                                </>
                            )}
                        </div>

                        {/* Enhanced Column Configuration */}
                        {selectedDataSet && (
                            <div className="space-y-4">
                                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white">
                                    <h5 className="font-medium text-gray-700 dark:text-gray-200 mb-3">Value Configuration</h5>
                                    
                                    {/* Value Field Selection */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                            <TrendingUp size={16} className="inline mr-1" />
                                            Value Column
                                        </label>
                                        <select
                                            value={valueField}
                                            onChange={(e) => setValueField(e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white text-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Select column...</option>
                                            {selectedDataSet.headers.map(column => {
                                                const isNumeric = isNumericColumn(column);
                                                return (
                                                    <option key={column} value={column}>
                                                        {isNumeric ? 'Σ ' : ''}{column}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The first value from this column will be displayed</p>
                                    </div>

                                    {/* Data Statistics */}
                                    {valueField && columnStats.values.length > 0 && (
                                        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 mb-4">
                                            <h6 className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">Column Statistics</h6>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-center bg-white dark:bg-gray-800 rounded p-2">
                                                    <div className="font-bold text-sm text-gray-800 dark:text-gray-100">{columnStats.min}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Min</div>
                                                </div>
                                                <div className="text-center bg-white dark:bg-gray-800 rounded p-2">
                                                    <div className="font-bold text-sm text-indigo-600">{columnStats.avg}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg</div>
                                                </div>
                                                <div className="text-center bg-white dark:bg-gray-800 rounded p-2">
                                                    <div className="font-bold text-sm text-gray-800 dark:text-gray-100">{columnStats.max}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Target Configuration */}
                                    {valueField && columnStats.values.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Target Configuration</label>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <label className={`flex items-center p-2 border-2 rounded cursor-pointer transition-all ${
                                                    targetField === 'manual' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-700'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="targetField"
                                                        value="manual"
                                                        checked={targetField === 'manual'}
                                                        onChange={(e) => setTargetField(e.target.value)}
                                                        className="h-3 w-3 border-gray-300 dark:border-gray-600 mr-2 text-indigo-600"
                                                    />
                                                    <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">Manual</span>
                                                </label>
                                                <label className={`flex items-center p-2 border-2 rounded cursor-pointer transition-all ${
                                                    targetField === 'average' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-700'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="targetField"
                                                        value="average"
                                                        checked={targetField === 'average'}
                                                        onChange={(e) => setTargetField(e.target.value)}
                                                        className="h-3 w-3 border-gray-300 dark:border-gray-600 mr-2 text-indigo-600"
                                                    />
                                                    <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">Avg ({columnStats.avg})</span>
                                                </label>
                                                <label className={`flex items-center p-2 border-2 rounded cursor-pointer transition-all ${
                                                    targetField === 'max' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-700'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="targetField"
                                                        value="max"
                                                        checked={targetField === 'max'}
                                                        onChange={(e) => setTargetField(e.target.value)}
                                                        className="h-3 w-3 border-gray-300 dark:border-gray-600 mr-2 text-indigo-600"
                                                    />
                                                    <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">Max ({columnStats.max})</span>
                                                </label>
                                                <div>
                                                    <select
                                                        value={targetField !== 'manual' && targetField !== 'average' && targetField !== 'max' ? targetField : ''}
                                                        onChange={(e) => setTargetField(e.target.value)}
                                                        className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        <option value="">From Column...</option>
                                                        {selectedDataSet.headers.filter(h => isNumericColumn(h) && h !== valueField).map(h => (
                                                            <option key={h} value={h}>Σ {h}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {targetField === 'manual' && (
                                                <input
                                                    type="number"
                                                    value={manualTarget}
                                                    onChange={(e) => setManualTarget(Number(e.target.value))}
                                                    placeholder="Enter target value"
                                                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Update Button */}
                                <button
                                    onClick={handleRegenerateGauge}
                                    disabled={!valueField}
                                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw size={16} />
                                    <span>Update Gauge Data</span>
                                </button>
                            </div>
                        )}

                        {/* Current Configuration Summary */}
                        {isUsingStoredData && valueField && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <h5 className="text-sm font-medium text-blue-900 mb-2">Current Configuration</h5>
                                <div className="text-xs text-blue-700 space-y-1">
                                    <div><span className="font-medium">Value:</span> {valueField}</div>
                                    <div><span className="font-medium">Target:</span> {
                                        targetField === 'manual' ? `Manual (${manualTarget})` :
                                        targetField === 'average' ? `Average (${columnStats.avg})` :
                                        targetField === 'max' ? `Maximum (${columnStats.max})` :
                                        targetField
                                    }</div>
                                    <div><span className="font-medium">Range:</span> {columnStats.min} to {columnStats.max}</div>
                                    <div><span className="font-medium">Current Value:</span> {columnStats.values[0] || 0}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'customize' && (
                    <div className="space-y-4">
                        {/* General Section */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('general')}>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">General</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.general ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.general && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Show Title</span>
                                        <button onClick={() => handlePropChange('showTitle', !graphData.showTitle)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showTitle ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Show Target</span>
                                        <button onClick={() => handlePropChange('showTarget', !graphData.showTarget)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showTarget ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showTarget ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Show Range Labels</span>
                                        <button onClick={() => handlePropChange('showLabels', !graphData.showLabels)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showLabels ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showLabels ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Value & Range Section */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('value')}>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Value & Range</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.value ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.value && (
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Current Value</label>
                                        <input type="number" value={graphData.value} onChange={(e) => handleNumericPropChange('value', e.target.value)} className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Min Value</label>
                                            <input type="number" value={graphData.minValue} onChange={(e) => handleNumericPropChange('minValue', e.target.value)} className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Max Value</label>
                                            <input type="number" value={graphData.maxValue} onChange={(e) => handleNumericPropChange('maxValue', e.target.value)} className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Target</label>
                                            <input type="number" value={graphData.target} onChange={(e) => handleNumericPropChange('target', e.target.value)} className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Unit / Suffix</label>
                                            <input type="text" value={graphData.unit} onChange={(e) => handlePropChange('unit', e.target.value)} className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., K, M, %" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Appearance Section */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('appearance')}>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Appearance</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.appearance ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.appearance && (
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Value Format</label>
                                        <select
                                            value={graphData.valueFormat || 'default'}
                                            onChange={(e) => handlePropChange('valueFormat', e.target.value)}
                                            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="default">Default</option>
                                            <option value="currency">Currency ($)</option>
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="compact">Compact (K, M)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Animation Duration (ms)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="3000"
                                            step="100"
                                            value={graphData.animationDuration || 1000}
                                            onChange={(e) => handleNumericPropChange('animationDuration', e.target.value)}
                                            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Colors Section */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('colors')}>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Colors</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.colors ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.colors && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-gray-600 dark:text-gray-300">Needle Color</label>
                                        <input
                                            type="color"
                                            value={graphData.needleColor || '#1e40af'}
                                            onChange={(e) => handlePropChange('needleColor', e.target.value)}
                                            className="w-10 h-10 p-1 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                                        />
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">Gauge Zones</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Low Zone</label>
                                                <input type="color" value={graphData.colors[0]} onChange={(e) => handleColorChange(0, e.target.value)} className="w-10 h-10 p-1 border border-gray-300 dark:border-gray-600 rounded cursor-pointer" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Medium Zone</label>
                                                <input type="color" value={graphData.colors[1]} onChange={(e) => handleColorChange(1, e.target.value)} className="w-10 h-10 p-1 border border-gray-300 dark:border-gray-600 rounded cursor-pointer" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm text-gray-600 dark:text-gray-300">High Zone</label>
                                                <input type="color" value={graphData.colors[2]} onChange={(e) => handleColorChange(2, e.target.value)} className="w-10 h-10 p-1 border border-gray-300 dark:border-gray-600 rounded cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t bg-gray-50 dark:bg-gray-700">
                <button onClick={() => onUpdate && onUpdate(graphData)} className="w-full py-2 px-3 bg-blue-50 border-2 border-indigo-300 text-indigo-600 rounded-md text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default GaugeChartSetting;