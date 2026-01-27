'use client';
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useCanvasHook } from '../Context/CanvasContext';
import PieChartWidget from './Widgets/PieChartWidget';
import { Database } from 'lucide-react';

const AddPieChart = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);
    const [dataSource, setDataSource] = useState('default');

    const [chartProps, setChartProps] = useState({
        title: 'Title Goes Here',
        labels: ['North', 'South', 'East', 'West'],
        datasets: [{
            id: 1,
            dataPoints: [300, 500, 100, 250],
            colors: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444']
        }],
        showTitle: true,
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

    const handleDataMapped = ({ labels, dataPoints }) => {
        const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#FBBF24', '#F87171'];
        const generatedColors = labels.map((_, i) => colors[i % colors.length]);

        setChartProps(prev => ({
            ...prev,
            labels: labels,
            datasets: [{ ...prev.datasets[0], dataPoints: dataPoints, colors: generatedColors }],
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
        const finalChartProps = { ...chartProps };
        delete finalChartProps.isEmpty; // Remove the empty flag
        addWidget({ type: 'pie', props: finalChartProps });
        if (onClose) onClose();
    };

    return (
        <div className="space-y-4">
            {/* Chart Preview */}
            <div className="h-[300px] w-full rounded-lg shadow-inner relative border border-gray-200 overflow-hidden">
                <div className="bg-white h-full">
                    <PieChartWidget {...chartProps} />
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
                                Default chart preview shown. Select a dataset above to configure your pie chart.
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
                        ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                        : 'bg-blue-50 text-indigo-600 hover:text-white border-2 border-indigo-300 hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'
                }`}
            >
                {chartProps.isEmpty ? 'Select Data to Continue' : 'Add Pie Chart to Canvas'}
            </button>
        </div>
    );
};


const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields;
    const [categoryField, setCategoryField] = useState(headers[0]);
    const [uniqueCategories, setUniqueCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    useEffect(() => {
        if (!categoryField || !data.data) return;
        const allValues = data.data.map(row => row[categoryField]);
        const unique = [...new Set(allValues)].filter(val => val !== null && val !== undefined && val !== '');
        setUniqueCategories(unique);
        setSelectedCategories(unique); // Select all by default
    }, [categoryField, data.data]);

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(item => item !== category)
                : [...prev, category]
        );
    };

    const handleGenerate = () => {
        const columnData = data.data.map(row => row[categoryField]);
        const counts = {};
        for (const item of columnData) {
            if (selectedCategories.includes(item)) {
                counts[item] = (counts[item] || 0) + 1;
            }
        }
        const labels = Object.keys(counts);
        const dataPoints = Object.values(counts);
        onMap({ labels, dataPoints });
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

            <div>
                <label className="block text-sm  font-medium text-gray-600 mb-1">Select Column to Count</label>
                <select value={categoryField} onChange={(e) => setCategoryField(e.target.value)} className="w-full text-black p-2 border border-gray-300 rounded text-sm bg-white">
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
            </div>

            {uniqueCategories.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <h5 className="text-sm font-medium text-gray-700">Filter Categories</h5>
                        <div className="space-x-3">
                            <button onClick={() => setSelectedCategories(uniqueCategories)} className="text-xs font-medium text-indigo-600 hover:underline">Select All</button>
                            <button onClick={() => setSelectedCategories([])} className="text-xs font-medium text-indigo-600 hover:underline">Unselect All</button>
                        </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto p-2 border bg-white rounded-md space-y-1">
                        {uniqueCategories.map(category => (
                            <div key={category} className="flex items-center">
                                <input id={`cb-cat-${category}`} type="checkbox" checked={selectedCategories.includes(category)} onChange={() => handleCategoryToggle(category)} className="h-4 w-4 rounded border-gray-300" />
                                <label htmlFor={`cb-cat-${category}`} className="ml-2 block text-sm text-gray-900">{String(category)}</label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={selectedCategories.length === 0}
                className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Generate Chart
            </button>
        </div>
    );
};

export default AddPieChart;
