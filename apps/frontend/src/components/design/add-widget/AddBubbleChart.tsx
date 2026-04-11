'use client';
import React, { useState, useMemo } from 'react';
import { useCanvasHook } from '@/contexts/CanvasContext';
import BubbleChartWidget from '@/components/design/widgets/BubbleChartWidget';
import { Database, Info } from 'lucide-react';

const AddBubbleChart = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);
    const [dataSource, setDataSource] = useState('default');

    const [chartProps, setChartProps] = useState({
        title: 'Multi-dimensional Analysis',
        datasets: [{
            id: 1,
            name: 'Sample Series',
            dataPoints: [
                { x: 20, y: 30, r: 15 },
                { x: 40, y: 10, r: 10 },
                { x: 60, y: 25, r: 20 },
                { x: 80, y: 50, r: 25 },
                { x: 90, y: 40, r: 12 },
            ],
            color: '#EF4444'
        }],
        showTitle: true, 
        showXAxis: true, 
        showXAxisTitle: false, 
        xAxisTitle: 'Variable X',
        showYAxis: true, 
        showYAxisTitle: false, 
        yAxisTitle: 'Variable Y',
        showLegend: false, // Added
        showValues: false, // Added
        isEmpty: true // Flag to indicate no real data is selected
    });

    const axisRange = useMemo(() => {
        const { datasets } = chartProps;
        if (!datasets || datasets.length === 0) return { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };

        const allXPoints = datasets.flatMap(ds => (ds.dataPoints || ds.data).map(p => p.x));
        const allYPoints = datasets.flatMap(ds => (ds.dataPoints || ds.data).map(p => p.y));

        if (allXPoints.length === 0) return { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };

        const minX = Math.min(...allXPoints);
        const maxX = Math.max(...allXPoints);
        const minY = Math.min(...allYPoints);
        const maxY = Math.max(...allYPoints);

        return {
            xMin: Math.floor(minX * 0.9), xMax: Math.ceil(maxX * 1.1),
            yMin: Math.floor(minY * 0.9), yMax: Math.ceil(maxY * 1.1),
        };
    }, [chartProps.datasets]);
    
    const handleStoredDataSelect = (dataSet) => {
        const mockResults = {
            data: dataSet.data,
            meta: { fields: dataSet.headers || dataSet.columns || [] }
        };
        setParsedData(mockResults);
        setDataSource('stored');
    };

    const handleDataMapped = ({ xAxisField, yAxisField, rAxisField, dataPoints, generatedTitle }) => {
        const newDataset = {
            id: 1,
            name: `${yAxisField} vs ${xAxisField}`,
            dataPoints: dataPoints,
            color: '#4BB7F5FF'
        };
        setChartProps(prev => ({
            ...prev,
            title: generatedTitle || prev.title, // Use generated title
            datasets: [newDataset],
            xAxisTitle: xAxisField,
            yAxisTitle: yAxisField,
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
        const finalProps = { ...chartProps, ...axisRange };
        delete finalProps.isEmpty; // Remove the empty flag
        addWidget({ type: 'bubble', props: finalProps });
        if (onClose) onClose();
    };

    return (
        <div className="space-y-4">
            {/* Chart Preview */}
            <div className="h-[300px] w-full rounded-lg shadow-inner relative border border-border overflow-hidden">
                <div className="bg-background h-full">
                    <BubbleChartWidget {...chartProps} {...axisRange} />
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

                    {/* Status Information */}
                    {chartProps.isEmpty ? (
                        <div className="bg-muted border border-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-sm font-medium text-foreground">Preview Mode</span>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">
                                Default chart preview shown. Select a dataset above to configure your bubble chart.
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

            {/* Action Button */}
            <button
                onClick={handleAdd}
                disabled={chartProps.isEmpty}
                className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                    chartProps.isEmpty
                        ? 'bg-muted text-muted-foreground border-2 border-border cursor-not-allowed'
                        : 'bg-blue-50 text-indigo-600 hover:text-white border-2 border-indigo-300 hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'
                }`}
            >
                {chartProps.isEmpty ? 'Select Data to Continue' : 'Add Bubble Chart to Canvas'}
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

    const [xAxisField, setXAxisField] = useState(headers.find(isNumericColumn) || headers[0]);
    const [yAxisField, setYAxisField] = useState(headers.filter(isNumericColumn).slice(1, 2)[0] || headers[1] || headers[0]);
    const [rAxisField, setRAxisField] = useState(headers.filter(isNumericColumn).slice(2, 3)[0] || headers[2] || headers[0]);

    // Function to generate dynamic title
    const generateTitle = (xField, yField, rField, aggregation) => {
        const aggregationLabels = {
            'sum': 'Sum',
            'count': 'Count',
            'average': 'Average',
            'min': 'Minimum',
            'max': 'Maximum',
            'distinct_count': 'Distinct Count'
        };

        // Format: X vs Y vs R - Aggregation
        // Example: "Sales vs Revenue vs Size - Sum"
        return `${xField} vs ${yField} vs ${rField} - ${aggregationLabels[aggregation]}`;
    };

    const handleGenerate = () => {
        // For bubble charts, we create data points directly from the raw data
        const dataPoints = data.data.map(row => ({
            x: Number(row[xAxisField]) || 0,
            y: Number(row[yAxisField]) || 0,
            r: Number(row[rAxisField]) || 0
        })).filter(p => !isNaN(p.x) && !isNaN(p.y) && !isNaN(p.r) && p.r > 0);
        
        // Generate the dynamic title
        const generatedTitle = generateTitle(xAxisField, yAxisField, rAxisField, aggregationType);
        
        onMap({ xAxisField, yAxisField, rAxisField, dataPoints, generatedTitle });
    };

    return (
        <div className="space-y-4 p-4 border bg-background rounded-lg">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Configure Chart Data</h4>
                <button
                    onClick={onBack}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                >
                    ← Back to Data Selection
                </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">X-Axis</label>
                    <select value={xAxisField} onChange={(e) => setXAxisField(e.target.value)} className="w-full p-2 border border-border rounded text-sm text-foreground">
                        {headers.map(h => <option key={`x-${h}`} value={h}>{h}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Y-Axis</label>
                    <select value={yAxisField} onChange={(e) => setYAxisField(e.target.value)} className="w-full p-2 border border-border rounded text-sm text-foreground">
                        {headers.map(h => <option key={`y-${h}`} value={h}>{h}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Radius (R)</label>
                    <select value={rAxisField} onChange={(e) => setRAxisField(e.target.value)} className="w-full p-2 border border-border rounded text-sm text-foreground">
                        {headers.map(h => <option key={`r-${h}`} value={h}>{h}</option>)}
                    </select>
                </div>
            </div>

            {/* Preview of generated title */}
            {xAxisField && yAxisField && rAxisField && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <Info size={16} className="text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-800">Generated Title Preview</span>
                    </div>
                    <p className="text-sm text-indigo-700 mt-1 font-medium">
                        "{generateTitle(xAxisField, yAxisField, rAxisField, aggregationType)}"
                    </p>
                </div>
            )}

            {/* Aggregation Selection */}
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Data Processing</label>
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

            <button onClick={handleGenerate} className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer">
                Generate Chart 
            </button>
        </div>
    );
};

export default AddBubbleChart;

