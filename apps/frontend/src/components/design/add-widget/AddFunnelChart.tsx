'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useCanvasHook } from '@/contexts/CanvasContext';
import FunnelChartWidget from '@/components/design/widgets/FunnelChartWidget';
import { Database, Info } from 'lucide-react';

const AddFunnelChart = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);
    const [dataSource, setDataSource] = useState('default');

    const [chartProps, setChartProps] = useState({
        title: 'Sales Funnel',
        labels: ['Leads', 'Qualified Leads', 'Proposals', 'Negotiations', 'Won'],
        datasets: [{
            id: 1,
            name: 'Funnel Data',
            dataPoints: [3000, 2200, 1500, 950, 500],
            colors: ['#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81']
        }],
        showTitle: true,
        showLegend: false,
        showValues: false, // Changed from true to false
        funnelStyle: 'classic',
        isEmpty: true // Flag to indicate no real data is selected
    });

    const handleStoredDataSelect = (dataSet) => {
        const mockResults = {
            data: dataSet.data,
            meta: { fields: dataSet.headers }
        };
        setParsedData(mockResults);
        setDataSource('stored');
    };

    const handleDataMapped = ({ labels, dataPoints, generatedTitle }) => {
        const colors = ['#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81', '#10B981', '#F59E0B', '#EF4444'];
        const generatedColors = labels.map((_, i) => colors[i % colors.length]);

        setChartProps(prev => ({
            ...prev,
            title: generatedTitle || prev.title, // Use generated title
            labels: labels,
            datasets: [{ ...prev.datasets[0], dataPoints: dataPoints, colors: generatedColors }],
            isEmpty: false
        }));
        // Don't hide the parsedData - keep showing the columns
        setDataSource('configured');
    };

    const handleBackToDataSelection = () => {
        setParsedData(null);
        setDataSource('default');
    };

    const handleAdd = () => {
        const finalChartProps = { ...chartProps };
        delete finalChartProps.isEmpty; // Remove the empty flag
        addWidget({
            type: 'funnel',
            props: finalChartProps
        });
        if (onClose) onClose();
    };

    return (
        <div className="space-y-4">
            {/* Chart Preview */}
            <div className="h-[300px] w-full rounded-lg shadow-inner relative border border-border overflow-hidden">
                <div className="bg-background h-full">
                    <FunnelChartWidget {...chartProps} />
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
                    {!chartProps.isEmpty && (
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Chart Title</label>
                            <input
                                type="text"
                                value={chartProps.title}
                                onChange={(e) => setChartProps(p => ({ ...p, title: e.target.value }))}
                                className="w-full p-2 text-sm border border-border rounded text-foreground"
                                placeholder="Enter chart title"
                            />
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
                                            className="w-full text-left p-3 text-sm bg-background border border-border rounded hover:bg-indigo-500/10 hover:bg-muted hover:border-border transition-colors"
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
                            <p className="text-xs text-muted-foreground mt-1">
                                Default chart preview shown. Select a dataset to configure your funnel chart.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-muted border border-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium text-foreground">Data Configured</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
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
                        : 'bg-muted text-indigo-600 hover:text-white border-2 border-border hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'
                }`}
            >
                {chartProps.isEmpty ? 'Select Data to Continue' : 'Add Funnel Chart to Canvas'}
            </button>
        </div>
    );
};

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
        
        // Sort by value (descending for funnel)
        const sortedData = labels.map((label, index) => ({
            label,
            value: dataPoints[index]
        })).sort((a, b) => b.value - a.value);
        
        const sortedLabels = sortedData.map(item => item.label);
        const sortedDataPoints = sortedData.map(item => item.value);
        
        // Generate the dynamic title
        const generatedTitle = generateTitle(labelField, valueField, aggregationType);
        
        onMap({ labels: sortedLabels, dataPoints: sortedDataPoints, generatedTitle });
    };

    return (
        <div className="space-y-4 p-4 border bg-background rounded-lg">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Configure Chart Data</h4>
                <button
                    onClick={onBack}
                    className="text-xs text-indigo-600 hover:text-foreground underline"
                >
                    ← Back to Data Selection
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Category Column (Stages)</label>
                    <div className="max-h-32 overflow-y-auto p-2 border border-border rounded text-sm bg-background">
                        {headers.map(header => {
                            const isNumeric = isNumericColumn(header);
                            return (
                                <label key={`label-${header}`} className="flex items-center cursor-pointer hover:bg-muted px-1 py-0.5 rounded">
                                    <input
                                        type="checkbox"
                                        name="labelField"
                                        value={header}
                                        checked={labelField === header}
                                        onChange={(e) => setLabelField(e.target.value)}
                                        className="h-4 w-4 border-border mr-3"
                                    />
                                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                                        {isNumeric ? (
                                            <>
                                                <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>
                                                <span className="text-sm text-foreground truncate">{header}</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-foreground truncate pl-4">{header}</span>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Value Column (Sizes)</label>
                    <div className="max-h-32 overflow-y-auto p-2 border bg-background rounded-md space-y-1">
                        {headers.filter(h => h !== labelField).map(header => {
                            const isNumeric = isNumericColumn(header);
                            return (
                                <label key={`value-${header}`} className="flex items-center cursor-pointer hover:bg-muted px-1 py-0.5 rounded">
                                    <input
                                        type="checkbox"
                                        name="valueField"
                                        value={header}
                                        checked={valueField === header}
                                        onChange={(e) => setValueField(e.target.value)}
                                        className="h-4 w-4 border-border mr-3"
                                    />
                                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                                        {isNumeric ? (
                                            <>
                                                <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>
                                                <span className="text-sm text-foreground truncate">{header}</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-foreground truncate pl-4">{header}</span>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Preview of generated title */}
            {labelField && valueField && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <Info size={16} className="text-indigo-600" />
                        <span className="text-sm font-medium text-foreground">Generated Title Preview</span>
                    </div>
                    <p className="text-sm text-indigo-700 mt-1 font-medium">
                        "{generateTitle(labelField, valueField, aggregationType)}"
                    </p>
                </div>
            )}

            {/* Aggregation Selection */}
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Value Calculation</label>
                <select
                    value={aggregationType}
                    onChange={(e) => setAggregationType(e.target.value)}
                    className="w-full p-2 border border-border rounded text-sm bg-background text-foreground"
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
                className="w-full py-2 px-4 bg-muted text-indigo-600 hover:text-white transition-all duration-200 border-2 border-border rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Generate Chart
            </button>
        </div>
    );
};

export default AddFunnelChart;
