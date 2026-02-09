'use client';
import React, { useState, useMemo } from 'react';
import { useCanvasHook } from '@/contexts/CanvasContext';
import HistogramWidget from '@/components/design/widgets/HistogramWidget';
import { Database } from 'lucide-react';

const AddHistogram = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);
    const [dataSource, setDataSource] = useState('default');

    const [chartProps, setChartProps] = useState({
        title: 'Sample Data Distribution',
        dataset: {
            name: 'Frequency',
            rawData: [12, 19, 3, 5, 2, 3, 25, 33, 45, 23, 11, 14, 18, 17, 22, 29, 31, 38, 40, 42],
            color: '#10B981'
        },
        numberOfBins: 5,
        showTitle: true,
        showXAxis: true,
        xAxisTitle: 'Value Bins',
        showYAxis: true,
        yAxisTitle: 'Frequency',
        isEmpty: true // Flag to indicate no real data is selected
    });

    const yAxisRange = useMemo(() => {
        const { rawData } = chartProps.dataset;
        const { numberOfBins } = chartProps;

        if (!rawData || rawData.length === 0) return { min: 0, max: 10 };

        const minVal = Math.min(...rawData);
        const maxVal = Math.max(...rawData);
        const binWidth = (maxVal - minVal) / numberOfBins;

        if (binWidth === 0) return { min: 0, max: Math.ceil(rawData.length * 1.1) };

        const bins = new Array(numberOfBins).fill(0);
        for (const value of rawData) {
            let binIndex = Math.floor((value - minVal) / binWidth);
            if (value === maxVal) binIndex = numberOfBins - 1;
            if (binIndex >= 0 && binIndex < numberOfBins) bins[binIndex]++;
        }

        const maxCount = Math.max(...bins);
        return {
            min: 0,
            max: Math.ceil(maxCount * 1.1) // 10% padding
        };
    }, [chartProps.dataset.rawData, chartProps.numberOfBins]);

    const handleStoredDataSelect = (dataSet) => {
        const mockResults = {
            data: dataSet.data,
            meta: { fields: dataSet.headers }
        };
        setParsedData(mockResults);
        setDataSource('stored');
    };

    const handleDataMapped = (mappedData) => {
        setChartProps(prev => ({
            ...prev,
            dataset: { ...prev.dataset, rawData: mappedData.rawData },
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
        addWidget({ type: 'histogram', props: finalChartProps });
        if (onClose) onClose();
    };

    return (
        <div className="space-y-4">
            {/* Chart Preview */}
            <div className="h-[300px] w-full rounded-lg shadow-inner relative border border-gray-200 dark:border-gray-600 overflow-hidden">
                <div className="bg-white h-full">
                    <HistogramWidget {...chartProps} yMin={yAxisRange.min} yMax={yAxisRange.max} />
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
                                onChange={(e) => setChartProps(p => ({ ...p, title: e.target.value }))}
                                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white dark:text-white"
                                placeholder="Enter chart title"
                            />
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
                                            className="w-full text-left p-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 transition-colors"
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
                                Default chart preview shown. Select a dataset above to configure your histogram.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium text-green-800">Data Configured</span>
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
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                        : 'bg-blue-50 text-indigo-600 hover:text-white border-2 border-indigo-300 hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'
                }`}
            >
                {chartProps.isEmpty ? 'Select Data to Continue' : 'Add Histogram to Canvas'}
            </button>
        </div>
    );
};


// Data Mapper for Histograms
const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields;
    const [dataField, setDataField] = useState(headers.find(h => isNumericColumn(h)) || headers[0]);

    // Function to detect if a column contains numeric data
    function isNumericColumn(columnName) {
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

    const handleGenerate = () => {
        // Extract all numbers from the selected column
        const rawData = data.data.map(row => Number(row[dataField])).filter(n => !isNaN(n));
        onMap({ rawData });
    };

    return (
        <div className="space-y-4 p-4 border bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200">Configure Chart Data</h4>
                <button
                    onClick={onBack}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                >
                    ← Back to Data Selection
                </button>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Select Data Column</label>
                <div className="max-h-32 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white">
                    {headers.map(header => {
                        const isNumeric = isNumericColumn(header);
                        return (
                            <label key={header} className="flex items-center px-1 py-0.5 rounded cursor-pointer hover:bg-gray-50 dark:bg-gray-700">
                                <input
                                    type="checkbox"
                                    name="dataField"
                                    value={header}
                                    checked={dataField === header}
                                    onChange={(e) => setDataField(e.target.value)}
                                    className="h-3 w-3 rounded border-gray-300 dark:border-gray-600 mr-3"
                                />
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                    {isNumeric ? (
                                        <>
                                            <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>
                                            <span className="text-sm text-gray-900 truncate">{header}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-4 flex-shrink-0"></span>
                                            <span className="text-sm text-gray-900 truncate">{header}</span>
                                        </>
                                    )}
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>
            <button onClick={handleGenerate} className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer ">
                Generate Chart
            </button>
        </div>
    );
}

export default AddHistogram;