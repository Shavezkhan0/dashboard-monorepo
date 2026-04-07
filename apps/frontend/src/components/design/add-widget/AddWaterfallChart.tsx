'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { useCanvasHook } from '@/contexts/CanvasContext';
import WaterfallChartWidget from '@/components/design/widgets/WaterfallChartWidget';
import { Database, TrendingUp, X } from 'lucide-react';

const AddWaterfallChart = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);
    const [dataSource, setDataSource] = useState('default');
    const [showDataMapper, setShowDataMapper] = useState(false);

    const [chartProps, setChartProps] = useState({
        title: 'Waterfall Chart',
        labels: ['Jan Sales', 'Feb Sales', 'Mar Returns', 'Apr Sales', 'May Sales', 'Jun Returns'],
        dataPoints: [100, 80, -25, 60, 45, -30],
        initialValue: 200,
        showTitle: true,
        showXAxis: true,
        showYAxis: true,
        yAxisTitle: 'Value',
        valueFormat: 'default', // default, currency, percentage, compact
        showDataLabels: false,
        positiveColor: '#10B981',
        negativeColor: '#EF4444',
        totalColor: '#3B82F6',
        isEmpty: true, // Flag to indicate no real data is selected
    });

    const yAxisRange = useMemo(() => {
        const { dataPoints, initialValue } = chartProps;
        if (dataPoints.length === 0) return { min: 0, max: 100 };

        let maxVal = initialValue;
        let minVal = initialValue;
        let currentTotal = initialValue;

        for (const value of dataPoints) {
            currentTotal += value;
            maxVal = Math.max(maxVal, currentTotal, initialValue + value);
            minVal = Math.min(minVal, currentTotal, initialValue);
        }

        const range = maxVal - minVal;
        const padding = Math.max(range * 0.1, 10);
        
        return {
            min: Math.floor(minVal - padding),
            max: Math.ceil(maxVal + padding)
        };
    }, [chartProps.dataPoints, chartProps.initialValue]);

    const handleStoredDataSelect = useCallback((dataSet) => {
        const mockResults = {
            data: dataSet.data,
            meta: { fields: dataSet.headers },
            id: dataSet.id
        };
        setParsedData(mockResults);
        setShowDataMapper(true);
        setDataSource('stored');
    }, []);

    const handleDataMapped = useCallback((mappedData) => {
        setChartProps(prev => ({
            ...prev,
            title: mappedData.title || prev.title,
            labels: mappedData.labels,
            dataPoints: mappedData.dataPoints,
            initialValue: mappedData.initialValue,
            dataSourceId: mappedData.dataSourceId,
            labelField: mappedData.labelField,
            valueField: mappedData.valueField,
            aggregationType: mappedData.aggregationType,
            isEmpty: false
        }));
        // Keep parsedData and mapper visible so user can easily change columns
        setDataSource('configured');
    }, []);

    const handleBackToDataSelection = useCallback(() => {
        setParsedData(null);
        setShowDataMapper(false);
        setDataSource('default');
        setChartProps(prev => ({
            ...prev,
            title: 'Waterfall Chart',
            labels: ['Jan Sales', 'Feb Sales', 'Mar Returns', 'Apr Sales', 'May Sales', 'Jun Returns'],
            dataPoints: [100, 80, -25, 60, 45, -30],
            initialValue: 200,
            isEmpty: true
        }));
    }, []);

    const handleAdd = () => {
        const finalProps = { ...chartProps, yMin: yAxisRange.min, yMax: yAxisRange.max };
        delete finalProps.isEmpty;
        addWidget({ type: 'waterfall', props: finalProps });
        if (onClose) onClose();
    };

    return (
        <div className="space-y-4">
            <div className="h-[300px] w-full bg-background rounded-md shadow-inner relative border border-border overflow-hidden">
                <WaterfallChartWidget {...chartProps} yMin={yAxisRange.min} yMax={yAxisRange.max} />
            </div>

            {showDataMapper && parsedData ? (
                <div className="space-y-4">
                    <DataMapper 
                        data={parsedData} 
                        onMap={handleDataMapped} 
                        onBack={handleBackToDataSelection}
                    />
                    {!chartProps.isEmpty && (
                        <div className="bg-muted border border-border rounded-lg p-3">
                            <p className="text-xs text-blue-700">
                                💡 <span className="font-medium">Tip:</span> You can change columns and click "Generate" again to update the chart
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                     {!chartProps.isEmpty && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Chart Title</label>
                                <input 
                                    type="text" 
                                    value={chartProps.title} 
                                    onChange={(e) => setChartProps(p => ({ ...p, title: e.target.value }))} 
                                    className="w-full p-2 text-sm border border-border rounded text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter chart title"
                                />
                            </div>

                            {/* Format Options Section */}
                            <div className="border border-border rounded-lg p-3 bg-muted">
                                <h4 className="text-sm font-medium text-foreground mb-3">Format Options</h4>
                                
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">Value Format</label>
                                        <select 
                                            value={chartProps.valueFormat} 
                                            onChange={(e) => setChartProps(p => ({ ...p, valueFormat: e.target.value }))} 
                                            className="w-full p-2 text-sm border border-border rounded text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="default">Default</option>
                                            <option value="currency">Currency</option>
                                            <option value="percentage">Percentage</option>
                                            <option value="compact">Compact (K, M)</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs text-muted-foreground">Show Data Labels</span>
                                        <button
                                            onClick={() => setChartProps(p => ({ ...p, showDataLabels: !p.showDataLabels }))}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${chartProps.showDataLabels ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-background transition-transform ${chartProps.showDataLabels ? 'translate-x-5' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                            className="w-full text-left p-3 text-sm bg-background border border-border rounded hover:bg-indigo-500/10 hover:bg-muted hover:border-indigo-300 transition-colors"
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
                                <p className="text-xs mt-1">Import data using the "Data" tab in the sidebar first</p>
                            </div>
                        )}
                    </div>

                    {chartProps.isEmpty ? (
                        <div className="bg-muted border border-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-sm font-medium text-foreground">Preview Mode</span>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">
                                Default chart preview shown. Select a dataset to configure your waterfall chart.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-muted border border-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium text-foreground">Data Configured</span>
                            </div>
                            <p className="text-xs text-green-700 mt-1">
                                Chart is ready. You can add it to the canvas now.
                            </p>
                        </div>
                    )}
                </div>
            )}

            <button 
                onClick={handleAdd} 
                disabled={chartProps.isEmpty}
                className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                    chartProps.isEmpty 
                        ? 'bg-muted text-muted-foreground border-2 border-border cursor-not-allowed' 
                        : 'bg-blue-50 text-indigo-600 hover:text-white border-2 border-indigo-300 hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'
                }`}
            >
                {chartProps.isEmpty ? 'Select Data to Continue' : 'Add Waterfall Chart to Canvas'}
            </button>
        </div>
    );
};

const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields || [];
    
    const isNumericColumn = (columnName) => {
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
    };

    const firstNumeric = headers.find(h => isNumericColumn(h)) || headers[1] || headers[0] || '';
    
    const [labelField, setLabelField] = useState(headers[0] || '');
    const [valueField, setValueField] = useState(firstNumeric);
    const [aggregationType, setAggregationType] = useState('sum');
    const [initialValue, setInitialValue] = useState(0);
    const [customTitle, setCustomTitle] = useState('');

    // Generate dynamic title
    const generateTitle = () => {
        if (customTitle.trim()) return customTitle;
        if (!labelField || !valueField) return 'Waterfall Chart';
        
        const aggLabel = aggregationType === 'none' ? '' : `${aggregationType.charAt(0).toUpperCase() + aggregationType.slice(1)} of `;
        return `${aggLabel}${valueField} by ${labelField}`;
    };

    const handleGenerate = () => {
        if (!data.data || data.data.length === 0) {
            alert('No data found in the dataset.');
            return;
        }

        try {
            let labels, dataPoints;

            if (aggregationType === 'none') {
                // No aggregation - use raw data
                labels = data.data
                    .map(row => String(row[labelField] || 'Unknown'))
                    .filter(label => label.trim() !== '');

                dataPoints = data.data
                    .map(row => {
                        const value = Number(row[valueField]);
                        return isNaN(value) ? 0 : value;
                    })
                    .slice(0, labels.length);
            } else {
                // Group by labelField and aggregate valueField
                const grouped = {};
                
                data.data.forEach(row => {
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

            onMap({ 
                title: generateTitle(),
                labels, 
                dataPoints, 
                initialValue,
                dataSourceId: data.id,
                labelField,
                valueField,
                aggregationType
            });
        } catch (error) {
            console.error('Error mapping data:', error);
            alert('Error processing data.');
        }
    };

    if (!headers || headers.length === 0) {
        return (
            <div className="space-y-4 p-4 border bg-background rounded-lg">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-foreground">Map Data</h4>
                    <button
                        onClick={onBack}
                        className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                    >
                        ← Back to Data Selection
                    </button>
                </div>
                <p className="text-sm text-red-600">No headers found in the data.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 border bg-background rounded-lg">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-foreground">Configure Waterfall Data</h4>
                 <button
                    onClick={onBack}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                >
                    ← Back to Data Selection
                </button>
            </div>

            {/* Dynamic Title Preview */}
            {(labelField && valueField) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-indigo-700 mb-1">Chart Title Preview</div>
                    <div className="text-lg font-bold text-indigo-900">{generateTitle()}</div>
                </div>
            )}
            
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded border border-border">
                📊 Found {data.data?.length || 0} rows
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
                        className="w-full text-foreground p-2 border border-border rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {headers.map(h => (
                            <option key={h} value={h}>
                                {isNumericColumn(h) ? 'Σ ' : ''}{h}
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
                        className="w-full p-2 text-foreground border border-border rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {headers.map(h => (
                            <option key={h} value={h}>
                                {isNumericColumn(h) ? 'Σ ' : ''}{h}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                        Positive = increase, Negative = decrease
                    </p>
                </div>
            </div>

            {/* Aggregation Type */}
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Aggregation Method
                </label>
                <select 
                    value={aggregationType} 
                    onChange={(e) => setAggregationType(e.target.value)} 
                    className="w-full p-2 text-foreground border border-border rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

            {/* Initial Value */}
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Initial Starting Value
                </label>
                <input
                    type="number"
                    value={initialValue}
                    onChange={(e) => setInitialValue(Number(e.target.value) || 0)}
                    className="w-full text-foreground p-2 border border-border rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter starting value (e.g., 0, 100, 1000)"
                />
                <p className="text-xs text-muted-foreground mt-1">The beginning value for the waterfall</p>
            </div>

            {/* Custom Title (Optional) */}
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Custom Title (Optional)</label>
                <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Leave empty for auto-generated title"
                    className="w-full p-2 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-muted-foreground mt-1">If empty, title will be auto-generated from selected fields</p>
            </div>
            
            <button 
                onClick={handleGenerate}
                disabled={!labelField || !valueField}
                className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Generate Waterfall Chart
            </button>
        </div>
    );
};

export default AddWaterfallChart;
