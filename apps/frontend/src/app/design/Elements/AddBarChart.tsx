'use client';
'use client';
import React, { useMemo, useState } from 'react';
import { useCanvasHook } from '../Context/CanvasContext';
import BarChartWidget from './Widgets/BarChartWidget';
import { Database } from 'lucide-react';

const AddBarChart = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);
    const [dataSource, setDataSource] = useState('default');

    const [chartProps, setChartProps] = useState({
        title: 'Title Goes Here',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            id: 1,
            name: 'Dataset 1',
            dataPoints: [65, 59, 80, 81, 56, 55],
            color: '#3B82F6'
        }],
        showTitle: true,
        showXAxis: true,
        xAxisTitle: 'Categories',
        showYAxis: true,
        yAxisTitle: 'Values',
        yStep: 20,
        borderWidth: 0,
        isEmpty: true // Flag to indicate no real data is selected
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
        setDataSource('stored');
    };

    const handleDataMapped = (mappedData) => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6'];
        const newDatasets = mappedData.datasets.map((ds, index) => ({
            id: index + 1,
            name: ds.name,
            dataPoints: ds.dataPoints,
            color: colors[index % colors.length]
        }));
        setChartProps(prev => ({
            ...prev,
            labels: mappedData.labels,
            datasets: newDatasets,
            isEmpty: false
        }));
        setParsedData(null);
        setDataSource('configured');
    };
    
    const handleBackToDataSelection = () => {
        setParsedData(null);
        setDataSource('default');
    };

    const handleAdd = () => {
        const finalChartProps = {
            ...chartProps,
            yMin: yAxisRange.min,
            yMax: yAxisRange.max,
        };
        delete finalChartProps.isEmpty; // Remove the empty flag
        addWidget({ type: 'bar', props: finalChartProps });
        if (onClose) onClose();
    };

    return (
        <div className="space-y-4">
            {/* Chart Preview */}
            <div className="h-[300px] w-full rounded-lg shadow-inner relative border border-gray-200 overflow-hidden">
                <div className="bg-white h-full">
                    <BarChartWidget {...chartProps} yMin={yAxisRange.min} yMax={yAxisRange.max} />
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
                            <label className="block text-xs font-medium text-gray-600 mb-1">Chart Title</label>
                            <input
                                type="text"
                                value={chartProps.title}
                                onChange={(e) => setChartProps(p => ({ ...p, title: e.target.value }))}
                                className="w-full p-2 text-sm border border-gray-300 rounded text-black"
                                placeholder="Enter chart title"
                            />
                        </div>
                    )}

                    {/* Data Source Selection */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-700 mb-3">Data Source</h4>

                        {storedDataSets.length > 0 ? (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                    <Database size={16} className="text-indigo-600" />
                                    <span>Available Datasets</span>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {storedDataSets.map(dataSet => (
                                        <button
                                            key={dataSet.id}
                                            onClick={() => handleStoredDataSelect(dataSet)}
                                            className="w-full text-left p-3 text-sm bg-white border border-gray-200 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                                        >
                                            <div className="font-medium text-gray-800">{dataSet.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">
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
                            <div className="text-center py-6 text-gray-500">
                                <Database size={32} className="mx-auto mb-3 text-gray-300" />
                                <p className="text-sm font-medium">No datasets available</p>
                                <p className="text-xs mt-1">Import data using the "Data" tab in the sidebar first</p>
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
                                Default chart preview shown. Select a dataset above to configure your bar chart.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium text-green-800">Data Configured</span>
                            </div>
                            <p className="text-xs text-green-700 mt-1">
                                Chart is ready with {chartProps.datasets.length} data series. You can add it to the canvas now.
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
                        ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                        : 'bg-blue-50 text-indigo-600 hover:text-white border-2 border-indigo-300 hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'
                }`}
            >
                {chartProps.isEmpty ? 'Select Data to Continue' : 'Add Bar Chart to Canvas'}
            </button>
        </div>
    );
};


// Data Mapper sub-component (aligned with AddAreaChart's DataMapper)
const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields;
    const [xAxis, setXAxis] = useState(headers[0]);
    const [yAxes, setYAxes] = useState([headers[1] || headers[0]]);
    const [previewData, setPreviewData] = useState(data.data.slice(0, 5));

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

    const handleYAxisToggle = (header) => {
        setYAxes(prev =>
            prev.includes(header)
                ? (prev.length > 1 ? prev.filter(h => h !== header) : prev)
                : [...prev, header]
        );
    };

    const handleGenerate = () => {
        const labels = data.data.map(row => String(row[xAxis]));
        const datasets = yAxes.map(yAxisField => ({
            name: yAxisField,
            dataPoints: data.data.map(row => Number(row[yAxisField]) || 0)
        }));
        onMap({ labels, datasets });
    };

    return (
        <div className="space-y-4 p-4 border bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700">Configure Chart Data</h4>
                <button
                    onClick={onBack}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                >
                    ← Back to Data Selection
                </button>
            </div>

            {/* Data Preview */}
            <div className="bg-white rounded-md border p-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Data Preview</h5>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                        <thead>
                            <tr className="bg-gray-100">
                                {headers.map(header => (
                                    <th key={header} className="px-2 py-1 text-left text-gray-600">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {previewData.map((row, index) => (
                                <tr key={index} className="border-t border-gray-100">
                                    {headers.map(header => (
                                        <td key={header} className="px-2 py-1 text-gray-800">
                                            {String(row[header])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                        Showing first 5 of {data.data.length} rows
                    </div>
                </div>
            </div>

            {/* Axis Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 ">X-Axis (Labels Select 1)</label>
                    <div className="max-h-32 overflow-y-auto p-2 border border-gray-300 rounded text-sm bg-white">
                        {headers.map(header => {
                            const isNumeric = isNumericColumn(header);
                            return (
                                <label key={header} className="flex items-center cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                                    <input
                                        type="radio"
                                        name="xAxis"
                                        value={header}
                                        checked={xAxis === header}
                                        onChange={(e) => setXAxis(e.target.value)}
                                        className="h-3 w-3 rounded border-gray-300 mr-3"
                                    />
                                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                                        {isNumeric ? (
                                            <>
                                                <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>
                                                <span className="text-sm text-gray-900 truncate">{header}</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-gray-900 truncate pl-4">{header}</span>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-600">Y-Axis (Can Select Multiple Values)</label>
                        <div className="space-x-2">
                            <button
                                onClick={() => setYAxes(headers.filter(h => h !== xAxis))}
                                className="text-xs font-medium text-indigo-600 hover:underline"
                            >
                                All
                            </button>
                            <button
                                onClick={() => setYAxes([headers.filter(h => h !== xAxis)[0]])}
                                className="text-xs font-medium text-indigo-600 hover:underline"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto p-2 border bg-white rounded-md space-y-1">
                        {headers.filter(h => h !== xAxis).map(header => {
                            const isNumeric = isNumericColumn(header);
                            return (
                                <label key={header} className="flex items-center cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                                    <input
                                        type="checkbox"
                                        checked={yAxes.includes(header)}
                                        onChange={() => handleYAxisToggle(header)}
                                        className="h-3 w-3 rounded border-gray-300 mr-3"
                                    />
                                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                                        {isNumeric ? (
                                            <>
                                                <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>
                                                <span className="text-sm text-gray-900 truncate">{header}</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-gray-900 truncate pl-4">{header}</span>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={yAxes.length === 0}
                className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Generate Chart ({yAxes.length} series selected)
            </button>
        </div>
    );
};

export default AddBarChart;

