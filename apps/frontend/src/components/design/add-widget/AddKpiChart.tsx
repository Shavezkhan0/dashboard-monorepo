'use client';
import React, { useState, useCallback } from 'react';
import { useCanvasHook } from '@/contexts/CanvasContext';
import { Database, Info, TrendingUp } from 'lucide-react';
import KpiWidget from '@/components/design/widgets/KpiWidget';

const AddKpiChart = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);

    const [kpiProps, setKpiProps] = useState({
        title: 'Key Performance Indicator',
        primaryValue: 12567,
        primaryValuePrefix: '$',
        primaryValueSuffix: '',
        comparisonLabel: 'vs last month',
        comparisonValue: 12.5,
        comparisonDirection: 'increase',
        showTitle: true,
        showComparison: true,
        backgroundColor: '#ffffff',
        titleColor: '#6B7280',
        valueColor: '#1F2937',
        comparisonColor: 'auto',
        isEmpty: true
    });

    const handleStoredDataSelect = useCallback((dataSet) => {
        const mockResults = {
            data: dataSet.data,
            meta: { fields: dataSet.headers || dataSet.columns || [] },
            id: dataSet.id
        };
        setParsedData(mockResults);
    }, []);

    const handleDataMapped = useCallback((mappedData) => {
        setKpiProps(prev => ({
            ...prev,
            title: mappedData.title || prev.title,
            primaryValue: mappedData.primaryValue,
            primaryValuePrefix: mappedData.primaryValuePrefix || '',
            primaryValueSuffix: mappedData.primaryValueSuffix || '',
            comparisonValue: mappedData.comparisonValue || 0,
            comparisonDirection: mappedData.comparisonDirection || 'neutral',
            dataSourceId: mappedData.dataSourceId,
            primaryMetric: mappedData.primaryMetric,
            comparisonMetric: mappedData.comparisonMetric,
            isEmpty: false
        }));
    }, []);

    const handleBackToDataSelection = useCallback(() => {
        setParsedData(null);
        setKpiProps(prev => ({
            ...prev,
            title: 'Key Performance Indicator',
            primaryValue: 12567,
            primaryValuePrefix: '$',
            primaryValueSuffix: '',
            isEmpty: true
        }));
    }, []);

    const handleAdd = useCallback(() => {
        const finalKpiProps = { ...kpiProps };
        delete finalKpiProps.isEmpty;
        addWidget({ type: 'kpi', props: finalKpiProps });
        if (onClose) onClose();
    }, [kpiProps, addWidget, onClose]);

    const handleTitleChange = useCallback((value) => {
        setKpiProps(p => ({ ...p, title: value }));
    }, []);

    return (
        <div className="space-y-4">
            <div className="h-[200px] w-full rounded-lg shadow-inner relative border border-border overflow-hidden">
                <div className="bg-background h-full">
                    <KpiWidget {...kpiProps} />
                </div>
            </div>

            {parsedData ? (
                <DataMapper
                    data={parsedData}
                    onMap={handleDataMapped}
                    onBack={handleBackToDataSelection}
                />
            ) : (
                <div className="space-y-4">
                    {/* Title Input - only show when data is configured */}
                    {!kpiProps.isEmpty && (
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">KPI Title</label>
                            <input
                                type="text"
                                value={kpiProps.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className="w-full p-2 text-sm border border-border rounded text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter KPI title"
                            />
                        </div>
                    )}

                    {/* Format Options - only show when data is configured */}
                    {!kpiProps.isEmpty && (
                        <div className="border border-border rounded-lg p-4 bg-muted">
                            <h4 className="font-medium text-foreground mb-3">Format Options</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-1">Prefix</label>
                                    <input
                                        type="text"
                                        value={kpiProps.primaryValuePrefix}
                                        onChange={(e) => setKpiProps(p => ({ ...p, primaryValuePrefix: e.target.value }))}
                                        className="w-full p-2 border border-border rounded text-sm text-foreground"
                                        placeholder="e.g., $"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-1">Suffix</label>
                                    <input
                                        type="text"
                                        value={kpiProps.primaryValueSuffix}
                                        onChange={(e) => setKpiProps(p => ({ ...p, primaryValueSuffix: e.target.value }))}
                                        className="w-full p-2 border border-border rounded text-sm text-foreground"
                                        placeholder="e.g., %"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Source Selection */}
                    <div className="border border-border rounded-lg p-4 bg-muted">
                        <h4 className="font-medium text-foreground mb-3">Data Source</h4>
                        
                        {storedDataSets.length > 0 ? (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
                                    <Database size={16} className="text-indigo-600" />
                                    <span>Available Datasets</span>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {storedDataSets.map(dataSet => (
                                        <button
                                            key={dataSet.id}
                                            onClick={() => handleStoredDataSelect(dataSet)}
                                            className="w-full text-left p-3 text-sm bg-background border border-border rounded hover:bg-indigo-500/10 hover:bg-muted hover:border-border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <div className="font-medium text-foreground">{dataSet.name}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                📊 {dataSet.rowCount} rows • {dataSet.headers.length} columns
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Columns: {dataSet.headers.slice(0, 3).join(', ')}
                                                {dataSet.headers.length > 3 && ` +${dataSet.headers.length - 3} more`}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <Database size={32} className="mx-auto mb-3 text-gray-300" />
                                <p className="text-sm font-medium">No datasets available</p>
                                <p className="text-xs mt-1">Import data using the "Data" tab first</p>
                            </div>
                        )}
                    </div>

                    {/* Status Information */}
                    {kpiProps.isEmpty ? (
                        <div className="bg-muted border border-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-sm font-medium text-foreground">Preview Mode</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Select a dataset to configure your KPI widget with real data.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-muted border border-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium text-foreground">Data Configured</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Your KPI is ready to be added to the canvas.
                            </p>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={handleAdd}
                disabled={kpiProps.isEmpty}
                className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                    kpiProps.isEmpty
                        ? 'bg-muted text-muted-foreground border-2 border-border cursor-not-allowed'
                        : 'bg-muted text-indigo-600 hover:text-white border-2 border-border hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'
                }`}
            >
                {kpiProps.isEmpty ? 'Select Data to Continue' : 'Add KPI Widget to Canvas'}
            </button>
        </div>
    );
};

const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields;
    const [primaryColumn, setPrimaryColumn] = useState(headers.find(h => isNumericColumn(h, data)) || headers[0]);
    const [aggregation, setAggregation] = useState('sum');
    const [title, setTitle] = useState('');
    const [prefix, setPrefix] = useState('');
    const [suffix, setSuffix] = useState('');
    
    function isNumericColumn(columnName, data) {
        const sampleSize = Math.min(10, data.data.length);
        const samples = data.data.slice(0, sampleSize);
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
    }

    const calculateValue = () => {
        if (!primaryColumn) return 0;
        
        const values = data.data
            .map(row => Number(row[primaryColumn]) || 0)
            .filter(val => !isNaN(val));
        
        switch (aggregation) {
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

    const handleGenerate = () => {
        const primaryValue = calculateValue();
        const mappedData = {
            title: title || `${aggregation.charAt(0).toUpperCase() + aggregation.slice(1)} of ${primaryColumn}`,
            primaryValue,
            primaryValuePrefix: prefix,
            primaryValueSuffix: suffix,
            comparisonValue: Math.random() * 20, // Mock comparison
            comparisonDirection: Math.random() > 0.5 ? 'increase' : 'decrease',
            dataSourceId: data.dataSourceId,
            primaryMetric: {
                column: primaryColumn,
                aggregation: aggregation
            },
            comparisonMetric: {
                type: 'previous_period',
                value: 0
            }
        };
        onMap(mappedData);
    };

    return (
        <div className="space-y-4 p-4 border bg-muted rounded-lg">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Configure KPI Data</h4>
                <button
                    onClick={onBack}
                    className="text-xs text-indigo-600 hover:text-foreground underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                >
                    ← Back to Data Selection
                </button>
            </div>
            
            {/* Preview of generated title */}
            {primaryColumn && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <Info size={16} className="text-indigo-600" />
                        <span className="text-sm font-medium text-foreground">KPI Title Preview</span>
                    </div>
                    <p className="text-sm text-indigo-700 mt-1 font-medium">
                        "{title || `${aggregation.charAt(0).toUpperCase() + aggregation.slice(1)} of ${primaryColumn}`}"
                    </p>
                </div>
            )}

            {/* Field Selection in Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        <TrendingUp size={16} className="inline mr-1" />
                        Value Column
                    </label>
                    <select
                        value={primaryColumn}
                        onChange={(e) => setPrimaryColumn(e.target.value)}
                        className="w-full p-2 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {headers.map(header => {
                            const isNumeric = isNumericColumn(header, data);
                            return (
                                <option key={header} value={header}>
                                    {isNumeric ? 'Σ ' : ''}{header}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Calculation Method</label>
                    <select
                        value={aggregation}
                        onChange={(e) => setAggregation(e.target.value)}
                        className="w-full p-2 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="sum">Sum</option>
                        <option value="average">Average</option>
                        <option value="count">Count</option>
                        <option value="max">Maximum</option>
                        <option value="min">Minimum</option>
                    </select>
                </div>
            </div>

            {/* Format Options */}
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Title (Optional)</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Auto-generated"
                        className="w-full p-2 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Prefix</label>
                    <input
                        type="text"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        placeholder="e.g., $"
                        className="w-full p-2 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Suffix</label>
                    <input
                        type="text"
                        value={suffix}
                        onChange={(e) => setSuffix(e.target.value)}
                        placeholder="e.g., %"
                        className="w-full p-2 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Value Preview */}
            <div className="bg-muted border border-border rounded-lg p-3">
                <div className="text-sm font-medium text-foreground">Calculated Value Preview</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                    {prefix}{calculateValue().toLocaleString()}{suffix}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                    Based on {data.data?.length || 0} rows
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={!primaryColumn}
                className="w-full py-2 px-4 bg-muted text-indigo-600 hover:text-white transition-all duration-200 border-2 border-border rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                Generate KPI Widget
            </button>
        </div>
    );
};

export default AddKpiChart;