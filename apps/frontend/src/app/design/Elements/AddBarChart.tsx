'use client';
import React, { useMemo, useState, useCallback } from 'react';
import { useCanvasHook } from '../Context/CanvasContext';
import BarChartWidget from './Widgets/BarChartWidget'; // Use the updated Power BI version
import { Database, Info, TrendingUp } from 'lucide-react';

const AddBarChart = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);

    // Default chart data
    const [chartProps, setChartProps] = useState({
        title: 'Title Goes Here',
        labels: ['Jan 22', 'Feb 22', 'Mar 22', 'Apr 22', 'May 22', 'Jun 22'],
        datasets: [{ id: 1, name: 'Dataset 1', dataPoints: [30, 40, 15, 60, 40, 20], color: '#3B82F6' }],
        showTitle: true,
        showXAxis: true,
        showXAxisTitle: false,
        xAxisTitle: 'Categories',
        showYAxis: true,
        showYAxisTitle: false,
        yAxisTitle: 'Values',
        borderWidth: 0, // Updated for Power BI style
        barStyle: 'grouped',
        borderRadius: 2, // Updated for Power BI style
        barThickness: 'flex',
        yStep: 10,
        isEmpty: true,
        showLegend: false // Default to false for Power BI style
    });

    // Improved Y-axis range calculation with better memoization
    const yAxisRange = useMemo(() => {
        const { datasets } = chartProps;
        
        if (!datasets || datasets.length === 0) return { min: 0, max: 100 };
        
        const allDataPoints = datasets.flatMap(ds => {
            if (!ds || !Array.isArray(ds.dataPoints)) return [];
            return ds.dataPoints.filter(point => typeof point === 'number' && !isNaN(point));
        });
        
        if (allDataPoints.length === 0) return { min: 0, max: 100 };

        const dataMin = Math.min(...allDataPoints);
        const dataMax = Math.max(...allDataPoints);
        const paddedMax = dataMax * 1.1;
        const suggestedMin = dataMin < 0 ? dataMin * 1.1 : 0;

        return {
            min: Math.floor(suggestedMin),
            max: Math.ceil(paddedMax)
        };
    }, [chartProps.datasets]); // Only depend on datasets

    const handleStoredDataSelect = useCallback((dataSet) => {
        const mockResults = {
            data: dataSet.data,
            meta: { fields: dataSet.headers }
        };
        setParsedData(mockResults);
    }, []);

    const handleDataMapped = useCallback(({ labels, datasets, xAxisField, yAxisFields, legendField, aggregationType, generatedTitle }) => {
        const colors = [
            '#118DFF', '#12239E', '#E66C37', '#6B007B', '#E044A7', 
            '#744EC2', '#D9B300', '#D64550', '#197278', '#1AAA55', 
            '#FFA800', '#00BCF2'
        ]; // Power BI colors
        
        // Apply colors to datasets
        const coloredDatasets = datasets.map((dataset, index) => ({
            ...dataset,
            id: index + 1,
            color: colors[index % colors.length]
        }));
        
        setChartProps(prev => ({
            ...prev,
            title: generatedTitle,
            labels: labels,
            datasets: coloredDatasets,
            xAxisTitle: xAxisField,
            yAxisTitle: yAxisFields.join(', '),
            showXAxisTitle: true,
            showYAxisTitle: true,
            showLegend: datasets.length > 1, // Show legend only if multiple datasets
            isEmpty: false
        }));
    }, []);

    const handleBackToDataSelection = useCallback(() => {
        setParsedData(null);
        // Reset to default state
        setChartProps(prev => ({
            ...prev,
            title: 'Title Goes Here',
            labels: ['Jan 22', 'Feb 22', 'Mar 22', 'Apr 22', 'May 22', 'Jun 22'],
            datasets: [{ id: 1, name: 'Dataset 1', dataPoints: [30, 40, 15, 60, 40, 20], color: '#3B82F6' }],
            xAxisTitle: 'Categories',
            yAxisTitle: 'Values',
            showXAxisTitle: false,
            showYAxisTitle: false,
            showLegend: false,
            isEmpty: true
        }));
    }, []);

    const handleAdd = useCallback(() => {
        const finalChartProps = {
            ...chartProps,
            yMin: yAxisRange.min,
            yMax: yAxisRange.max,
        };
        delete finalChartProps.isEmpty;
        addWidget({ type: 'bar', props: finalChartProps });
        if (onClose) onClose();
    }, [chartProps, yAxisRange, addWidget, onClose]);

    // Handle title change with debouncing to prevent excessive re-renders
    const handleTitleChange = useCallback((value) => {
        setChartProps(p => ({ ...p, title: value }));
    }, []);

    return (
        <div className="space-y-4">
            {/* Chart Preview */}
            <div className="h-[300px] w-full rounded-lg shadow-inner relative border border-gray-200 dark:border-gray-600 overflow-hidden">
                <div className="bg-white h-full">
                    <BarChartWidget 
                        {...chartProps} 
                        yMin={yAxisRange.min} 
                        yMax={yAxisRange.max}
                        // Ensure Power BI styling is applied
                        borderWidth={0}
                        borderRadius={2}
                        showLegend={chartProps.showLegend}
                    />
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
                    {!chartProps.isEmpty && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Chart Title</label>
                            <input 
                                type="text" 
                                value={chartProps.title} 
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                                placeholder="Enter chart title"
                            />
                        </div>
                    )}

                    {/* Chart Style Controls - only show when data is configured */}
                    {!chartProps.isEmpty && (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">Chart Options</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={chartProps.showLegend}
                                            onChange={(e) => setChartProps(p => ({ ...p, showLegend: e.target.checked }))}
                                            className="rounded border-gray-300 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-200">Show Legend</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={chartProps.showXAxisTitle}
                                            onChange={(e) => setChartProps(p => ({ ...p, showXAxisTitle: e.target.checked }))}
                                            className="rounded border-gray-300 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-200">Show X-Axis Title</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={chartProps.showYAxisTitle}
                                            onChange={(e) => setChartProps(p => ({ ...p, showYAxisTitle: e.target.checked }))}
                                            className="rounded border-gray-300 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-200">Show Y-Axis Title</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Source Selection */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                        <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">Data Source</h4>
                        
                        {storedDataSets.length > 0 ? (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                    <Database size={16} className="text-indigo-600" />
                                    <span>Available Datasets</span>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {storedDataSets.map(dataSet => (
                                        <button
                                            key={dataSet.id}
                                            onClick={() => handleStoredDataSelect(dataSet)}
                                            className="w-full text-left p-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <div className="font-medium text-gray-800 dark:text-gray-100">{dataSet.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                📊 {dataSet.rowCount} rows • {dataSet.headers.length} columns
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Columns: {dataSet.headers.slice(0, 3).join(', ')}
                                                {dataSet.headers.length > 3 && ` +${dataSet.headers.length - 3} more`}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                <Database size={32} className="mx-auto mb-3 text-gray-300" />
                                <p className="text-sm font-medium">No datasets available</p>
                                <p className="text-xs mt-1">Import data using the "Data" tab first</p>
                            </div>
                        )}
                    </div>

                    {/* Status Information */}
                    {chartProps.isEmpty ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-sm font-medium text-blue-800">Preview Mode</span>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">
                                Select a dataset to configure your bar chart with Power BI styling.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium text-green-800">Data Configured</span>
                            </div>
                            <p className="text-xs text-green-700 mt-1">
                                Your Power BI-style chart is ready to be added to the canvas.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Action Button */}
            <button 
                onClick={handleAdd} 
                disabled={chartProps.isEmpty}
                className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    chartProps.isEmpty 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-2 border-gray-200 cursor-not-allowed' 
                        : 'bg-blue-50 text-indigo-600 hover:text-white border-2 border-indigo-300 hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'
                }`}
            >
                {chartProps.isEmpty ? 'Select Data to Continue' : 'Add Chart to Canvas'}
            </button>
        </div>
    );
};

// Enhanced Data Mapper Component (keeping your existing implementation but with some improvements)
const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields;
    const [aggregationType, setAggregationType] = useState('sum');
    
    // Initialize fields with smart defaults
    const [xAxisField, setXAxisField] = useState(() => {
        // Try to find a date/time field first, then any non-numeric field
        const dateField = headers.find(h => 
            h.toLowerCase().includes('date') || 
            h.toLowerCase().includes('time') || 
            h.toLowerCase().includes('month') || 
            h.toLowerCase().includes('year')
        );
        if (dateField) return dateField;
        
        const nonNumericField = headers.find(h => !isNumericColumn(h));
        return nonNumericField || headers[0];
    });
    
    const [yAxisFields, setYAxisFields] = useState(() => {
        // Default to numeric fields, excluding the x-axis field
        const numericFields = headers.filter(h => h !== xAxisField && isNumericColumn(h));
        return numericFields.length > 0 ? [numericFields[0]] : [headers[1] || headers[0]];
    });
    
    const [legendField, setLegendField] = useState(''); // Optional grouping field

    function isNumericColumn(columnName) {
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
    }

    // Function to generate dynamic title
    const generateTitle = useCallback((xAxis, yAxes, legend, aggregation) => {
        const aggregationLabels = {
            'sum': 'Sum',
            'count': 'Count',
            'average': 'Average',
            'min': 'Minimum',
            'max': 'Maximum'
        };

        let title = yAxes.join(' & ') + ' by ' + xAxis;
        
        if (aggregation !== 'none') {
            title = aggregationLabels[aggregation] + ' of ' + title;
        }
        
        if (legend) {
            title += ` (by ${legend})`;
        }
        
        return title;
    }, []);

    const handleYAxisToggle = useCallback((header) => {
        setYAxisFields(prev =>
            prev.includes(header)
                ? (prev.length > 1 ? prev.filter(h => h !== header) : prev)
                : [...prev, header]
        );
    }, []);

    const handleGenerate = useCallback(() => {
        // Process data based on configuration (keeping your existing logic)
        let processedData = [];
        
        if (legendField && legendField !== '') {
            // Group data by legend field
            const groupedData = new Map();
            
            data.data.forEach(row => {
                const legendValue = row[legendField];
                const xValue = row[xAxisField];
                
                if (!groupedData.has(legendValue)) {
                    groupedData.set(legendValue, new Map());
                }
                
                if (!groupedData.get(legendValue).has(xValue)) {
                    groupedData.get(legendValue).set(xValue, {});
                    yAxisFields.forEach(field => {
                        groupedData.get(legendValue).get(xValue)[field] = [];
                    });
                }
                
                yAxisFields.forEach(field => {
                    const value = Number(row[field]) || 0;
                    groupedData.get(legendValue).get(xValue)[field].push(value);
                });
            });
            
            // Get unique x-axis values and sort them
            const allXValues = [...new Set(data.data.map(row => row[xAxisField]))].sort();
            
            // Create datasets for each legend group
            const datasets = [];
            groupedData.forEach((xValueMap, legendValue) => {
                yAxisFields.forEach(yField => {
                    const dataPoints = allXValues.map(xValue => {
                        const values = xValueMap.get(xValue)?.[yField] || [0];
                        
                        // Apply aggregation
                        switch (aggregationType) {
                            case 'sum': return values.reduce((a, b) => a + b, 0);
                            case 'average': return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                            case 'count': return values.length;
                            case 'min': return Math.min(...values);
                            case 'max': return Math.max(...values);
                            default: return values[0] || 0;
                        }
                    });
                    
                    datasets.push({
                        name: `${legendValue} - ${yField}`,
                        dataPoints
                    });
                });
            });
            
            processedData = {
                labels: allXValues.map(String),
                datasets
            };
        } else {
            // Simple aggregation without grouping
            const aggregatedData = new Map();
            
            data.data.forEach(row => {
                const xValue = row[xAxisField];
                
                if (!aggregatedData.has(xValue)) {
                    aggregatedData.set(xValue, {});
                    yAxisFields.forEach(field => {
                        aggregatedData.get(xValue)[field] = [];
                    });
                }
                
                yAxisFields.forEach(field => {
                    const value = Number(row[field]) || 0;
                    aggregatedData.get(xValue)[field].push(value);
                });
            });
            
            // Sort x-axis values
            const sortedXValues = [...aggregatedData.keys()].sort();
            
            const datasets = yAxisFields.map(yField => {
                const dataPoints = sortedXValues.map(xValue => {
                    const values = aggregatedData.get(xValue)[yField];
                    
                    switch (aggregationType) {
                        case 'sum': return values.reduce((a, b) => a + b, 0);
                        case 'average': return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                        case 'count': return values.length;
                        case 'min': return Math.min(...values);
                        case 'max': return Math.max(...values);
                        default: return values[0] || 0;
                    }
                });
                
                return {
                    name: yField,
                    dataPoints
                };
            });
            
            processedData = {
                labels: sortedXValues.map(String),
                datasets
            };
        }
        
        // Generate the dynamic title
        const generatedTitle = generateTitle(xAxisField, yAxisFields, legendField, aggregationType);
        
        onMap({ 
            ...processedData, 
            xAxisField, 
            yAxisFields, 
            legendField, 
            aggregationType, 
            generatedTitle 
        });
    }, [data.data, xAxisField, yAxisFields, legendField, aggregationType, generateTitle, onMap]);

    return (
        <div className="space-y-4 p-4 border bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200">Configure Bar Chart</h4>
                <button 
                    onClick={onBack}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                >
                    ← Back to Data Selection
                </button>
            </div>

            {/* Preview of generated title */}
            {xAxisField && yAxisFields.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <Info size={16} className="text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-800">Generated Title Preview</span>
                    </div>
                    <p className="text-sm text-indigo-700 mt-1 font-medium">
                        "{generateTitle(xAxisField, yAxisFields, legendField, aggregationType)}"
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* X-Axis Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        <TrendingUp size={16} className="inline mr-1" />
                        X-Axis (Categories)
                    </label>
                    <div className="max-h-36 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white">
                        {headers.map(h => (
                            <ColumnSelector 
                                key={`x-${h}`} 
                                header={h} 
                                checked={xAxisField === h} 
                                onChange={setXAxisField} 
                                name="xAxisField" 
                                isNumeric={isNumericColumn(h)}
                            />
                        ))}
                    </div>
                </div>

                {/* Y-Axis Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Y-Axis (Values - Multiple Selection)
                    </label>
                    <div className="max-h-36 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white">
                        {headers.filter(h => h !== xAxisField).map(h => (
                            <label key={`y-${h}`} className="flex items-center cursor-pointer hover:bg-gray-50 dark:bg-gray-700 px-1 py-1 rounded">
                                <input
                                    type="checkbox"
                                    checked={yAxisFields.includes(h)}
                                    onChange={() => handleYAxisToggle(h)}
                                    className="h-4 w-4 border-gray-300 dark:border-gray-600 mr-3 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                    {isNumericColumn(h) && <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>}
                                    <span className={`text-sm text-gray-900 truncate ${!isNumericColumn(h) && 'pl-6'}`}>{h}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-rows-1 lg:grid-rows-1 gap-4">
                {/* Legend/Grouping Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Legend (Optional Grouping)
                    </label>
                    <div className="max-h-36 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white">
                        <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:bg-gray-700 px-1 py-1 rounded">
                            <input
                                type="checkbox"
                                checked={legendField === ''}
                                onChange={() => setLegendField('')}
                                className="h-4 w-4 border-gray-300 dark:border-gray-600 mr-3 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400 italic">No grouping</span>
                        </label>
                        {headers.filter(h => h !== xAxisField && !yAxisFields.includes(h)).map(h => (
                            <ColumnSelector 
                                key={`legend-${h}`} 
                                header={h} 
                                checked={legendField === h} 
                                onChange={setLegendField} 
                                name="legendField" 
                                isNumeric={isNumericColumn(h)}
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
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white text-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="sum">Sum</option>
                    <option value="count">Count</option>
                    <option value="average">Average</option>
                    <option value="min">Minimum</option>
                    <option value="max">Maximum</option>
                    <option value="none">No Aggregation (First Value)</option>
                </select>
            </div>

            <button
                onClick={handleGenerate}
                disabled={!xAxisField || yAxisFields.length === 0}
                className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                Generate  Chart
            </button>
        </div>
    );
};

const ColumnSelector = ({ header, checked, onChange, name, isNumeric }) => (
    <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:bg-gray-700 px-1 py-1 rounded">
        <input
            type="checkbox"
            name={name}
            value={header}
            checked={checked}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 border-gray-300 dark:border-gray-600 mr-3 text-indigo-600 focus:ring-indigo-500"
        />
        <div className="flex items-center space-x-2 min-w-0 flex-1">
            {isNumeric && <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>}
            <span className={`text-sm text-gray-900 truncate ${!isNumeric && 'pl-6'}`}>{header}</span>
        </div>
    </label>
);

export default AddBarChart;