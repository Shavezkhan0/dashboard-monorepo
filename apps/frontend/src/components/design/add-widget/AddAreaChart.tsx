'use client';
import React, { useMemo, useState } from 'react';
import { useCanvasHook } from '@/contexts/CanvasContext';
import AreaChartWidget from '@/components/design/widgets/AreaChartWidget';
import { Database, Info, TrendingUp } from 'lucide-react';

const AddAreaChart = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);

    // Default chart data
    const [chartProps, setChartProps] = useState({
        title: 'Title Goes Here',
        labels: ['Jan 22', 'Feb 22', 'Mar 22', 'Apr 22', 'May 22', 'Jun 22'],
        datasets: [{ id: 1, name: 'Dataset 1', dataPoints: [30, 40, 15, 60, 40, 20], color: '#8B5CF6' }],
        showTitle: true,
        showXAxis: true,
        showXAxisTitle: false,
        xAxisTitle: 'Months',
        showYAxis: true,
        showYAxisTitle: false,
        yAxisTitle: 'Values',
        strokeWidth: 2,
        lineStyle: 'solid',
        showMarkers: true,
        markerStyle: 'circle',
        markerSize: 8,
        showLegend: false, // Always false - data shown on hover only
        fillOpacity: 0.3,
        yStep: 10,
        isEmpty: true
    });

    const yAxisRange = useMemo(() => {
        const { datasets } = chartProps;
        if (!datasets || datasets.length === 0) return { min: 0, max: 100 };
        const allDataPoints = datasets.flatMap(ds => ds.dataPoints);
        if (allDataPoints.length === 0) return { min: 0, max: 100 };

        const dataMin = Math.min(...allDataPoints);
        const dataMax = Math.max(...allDataPoints);
        const paddedMax = dataMax * 1.1;
        const suggestedMin = dataMin < 0 ? dataMin * 1.1 : 0;

        return {
            min: Math.floor(suggestedMin),
            max: Math.ceil(paddedMax)
        };
    }, [chartProps.datasets]);

    const handleStoredDataSelect = (dataSet) => {
        const mockResults = {
            data: dataSet.data,
            meta: { fields: dataSet.headers }
        };
        setParsedData(mockResults);
    };

    const handleDataMapped = ({ labels, datasets, xAxisField, yAxisFields, legendField, aggregationType, generatedTitle }) => {
        const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#FBBF24', '#F87171'];
        
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
            showLegend: false, // Always false - data shown on hover only
            isEmpty: false
        }));
    };

    const handleBackToDataSelection = () => {
        setParsedData(null);
        // Reset to default state
        setChartProps(prev => ({
            ...prev,
            title: 'Title Goes Here',
            labels: ['Jan 22', 'Feb 22', 'Mar 22', 'Apr 22', 'May 22', 'Jun 22'],
            datasets: [{ id: 1, name: 'Dataset 1', dataPoints: [30, 40, 15, 60, 40, 20], color: '#8B5CF6' }],
            xAxisTitle: 'Months',
            yAxisTitle: 'Values',
            showXAxisTitle: false,
            showYAxisTitle: false,
            showLegend: false,
            isEmpty: true
        }));
    };

    const handleAdd = () => {
        const finalChartProps = {
            ...chartProps,
            yMin: yAxisRange.min,
            yMax: yAxisRange.max,
        };
        delete finalChartProps.isEmpty;
        addWidget({ type: 'areachart', props: finalChartProps });
        if (onClose) onClose();
    };

    return (
        <div className="space-y-4">
            {/* Chart Preview */}
            <div className="h-[300px] w-full rounded-lg shadow-inner relative border border-border overflow-hidden">
                <div className="bg-background h-full">
                    <AreaChartWidget {...chartProps} yMin={yAxisRange.min} yMax={yAxisRange.max} />
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
                                            className="w-full text-left p-3 text-sm bg-background border border-border rounded hover:bg-muted0/10 hover:bg-muted hover:border-indigo-300 transition-colors"
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
                    {chartProps.isEmpty ? (
                        <div className="bg-muted border border-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-sm font-medium text-foreground">Preview Mode</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Select a dataset to configure your area chart.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-muted border border-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium text-foreground">Data Configured</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Your chart is ready to be added to the canvas.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Action Button */}
            <button 
                onClick={handleAdd} 
                disabled={chartProps.isEmpty}
                className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                    chartProps.isEmpty 
                        ? 'bg-muted text-muted-foreground border-2 border-border cursor-not-allowed' 
                        : 'bg-muted text-indigo-600 hover:text-white border-2 border-border hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'
                }`}
            >
                {chartProps.isEmpty ? 'Select Data to Continue' : 'Add Area Chart to Canvas'}
            </button>
        </div>
    );
};

// Enhanced Data Mapper Component with optimized performance for area charts
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
    const generateTitle = (xAxis, yAxes, legend, aggregation) => {
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
    };

    const handleYAxisToggle = (header) => {
        setYAxisFields(prev =>
            prev.includes(header)
                ? (prev.length > 1 ? prev.filter(h => h !== header) : prev)
                : [...prev, header]
        );
    };

    const handleGenerate = () => {
        // Process data based on configuration with performance optimizations
        let processedData = [];
        
        if (legendField && legendField !== '') {
            // Group data by legend field with limits to prevent performance issues
            const groupedData = new Map();
            const maxLegendGroups = 8; // Reduced for area charts as they can be visually overwhelming
            let legendGroupCount = 0;
            
            data.data.forEach(row => {
                const legendValue = row[legendField];
                const xValue = row[xAxisField];
                
                // Skip if we've reached max legend groups
                if (!groupedData.has(legendValue) && legendGroupCount >= maxLegendGroups) {
                    return;
                }
                
                if (!groupedData.has(legendValue)) {
                    groupedData.set(legendValue, new Map());
                    legendGroupCount++;
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
            
            // Create datasets for each legend group, but limit combinations for area charts
            const datasets = [];
            const maxDatasets = 6; // Reduced for area charts to avoid visual clutter
            let datasetCount = 0;
            
            groupedData.forEach((xValueMap, legendValue) => {
                // For area charts, prefer single Y field per legend to avoid visual clutter
                const fieldsToProcess = yAxisFields.length > 1 && groupedData.size > 1 
                    ? [yAxisFields[0]] // Use only first Y field when multiple legends
                    : yAxisFields;
                
                fieldsToProcess.forEach(yField => {
                    if (datasetCount >= maxDatasets) return;
                    
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
                    
                    const datasetName = fieldsToProcess.length > 1 || groupedData.size === 1 
                        ? `${legendValue} - ${yField}`
                        : legendValue;
                    
                    datasets.push({
                        name: datasetName,
                        dataPoints
                    });
                    datasetCount++;
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
    };

    return (
        <div className="space-y-4 p-4 border bg-muted rounded-lg">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Configure Area Chart Data</h4>
                <button 
                    onClick={onBack}
                    className="text-xs text-indigo-600 hover:text-foreground underline"
                >
                    ← Back to Data Selection
                </button>
            </div>

            {/* Performance Warning for Area Charts */}
            {legendField && yAxisFields.length > 1 && (
                <div className="bg-muted border border-border rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <Info size={16} className="text-yellow-600" />
                        <span className="text-sm font-medium text-foreground">Area Chart Note</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Multiple overlapping areas may be hard to read. Consider using one Y-axis field for better visualization.
                    </p>
                </div>
            )}

            {/* Preview of generated title */}
            {xAxisField && yAxisFields.length > 0 && (
                <div className="bg-muted border border-border rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <Info size={16} className="text-indigo-600" />
                        <span className="text-sm font-medium text-foreground">Generated Title Preview</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">
                        "{generateTitle(xAxisField, yAxisFields, legendField, aggregationType)}"
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* X-Axis Selection */}
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        <TrendingUp size={16} className="inline mr-1" />
                        X-Axis (Time/Category)
                    </label>
                    <div className="max-h-36 overflow-y-auto p-2 border border-border rounded text-sm bg-background">
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
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Y-Axis (Values - Multiple Selection)
                    </label>
                    <div className="max-h-36 overflow-y-auto p-2 border border-border rounded text-sm bg-background">
                        {headers.filter(h => h !== xAxisField).map(h => (
                            <label key={`y-${h}`} className="flex items-center cursor-pointer hover:bg-muted px-1 py-1 rounded">
                                <input
                                    type="checkbox"
                                    checked={yAxisFields.includes(h)}
                                    onChange={() => handleYAxisToggle(h)}
                                    className="h-4 w-4 border-border mr-3 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                    {isNumericColumn(h) && <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>}
                                    <span className={`text-sm text-foreground truncate ${!isNumericColumn(h) && 'pl-6'}`}>{h}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

            </div>

            <div className="grid grid-rows-1 lg:grid-rows-1 gap-4">
                {/* Legend/Grouping Selection */}
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Legend (Optional Grouping)
                    </label>
                    <div className="max-h-36 overflow-y-auto p-2 border border-border rounded text-sm bg-background">
                        <label className="flex items-center cursor-pointer hover:bg-muted px-1 py-1 rounded">
                            <input
                                type="checkbox"
                                checked={legendField === ''}
                                onChange={() => setLegendField('')}
                                className="h-4 w-4 border-border mr-3 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-muted-foreground italic">No grouping</span>
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
                    <option value="none">No Aggregation (First Value)</option>
                </select>
            </div>

            <button
                onClick={handleGenerate}
                disabled={!xAxisField || yAxisFields.length === 0}
                className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Generate Area Chart
            </button>
        </div>
    );
};

const ColumnSelector = ({ header, checked, onChange, name, isNumeric }) => (
    <label className="flex items-center cursor-pointer hover:bg-muted px-1 py-1 rounded">
        <input
            type="checkbox"
            name={name}
            value={header}
            checked={checked}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 border-border mr-3 text-indigo-600 focus:ring-indigo-500"
        />
        <div className="flex items-center space-x-2 min-w-0 flex-1">
            {isNumeric && <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>}
            <span className={`text-sm text-foreground truncate ${!isNumeric && 'pl-6'}`}>{header}</span>
        </div>
    </label>
);

export default AddAreaChart;