'use client';
'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, X, Database, RefreshCw } from 'lucide-react';
import { useCanvasHook } from '../../Context/CanvasContext';

const AreaChartSetting = ({ initialData, onUpdate, onClose }) => {
    const { storedDataSets } = useCanvasHook();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({
        details: false,
        datasets: true,
        xaxis: false,
        yaxis: false,
        properties: false
    });
    const [graphData, setGraphData] = useState(initialData);

    // Data selection states
    const [selectedDataSet, setSelectedDataSet] = useState(null);
    const [availableColumns, setAvailableColumns] = useState([]);
    const [xAxisColumn, setXAxisColumn] = useState('');
    const [yAxisColumns, setYAxisColumns] = useState([]);
    const [isUsingStoredData, setIsUsingStoredData] = useState(false);

    // Function to detect if a column contains numeric data
    const isNumericColumn = (columnName) => {
        if (!selectedDataSet || !selectedDataSet.data) return false;

        // Sample a few rows to determine data type
        const sampleSize = Math.min(10, selectedDataSet.data.length);
        const samples = selectedDataSet.data.slice(0, sampleSize);

        let numericCount = 0;
        for (const row of samples) {
            const value = row[columnName];
            if (value !== null && value !== undefined && value !== '') {
                // Check if it's a number or can be converted to a number
                const numValue = Number(value);
                if (!isNaN(numValue) && isFinite(numValue)) {
                    numericCount++;
                }
            }
        }

        // If more than 70% of non-empty values are numeric, consider it a numeric column
        return numericCount / sampleSize > 0.7;
    };

    useEffect(() => {
        setMounted(true);
        if (initialData) {
            setGraphData(initialData);
            // Check if this chart was created from stored data
            if (initialData.dataSourceId) {
                const dataSet = storedDataSets.find(ds => ds.id === initialData.dataSourceId);
                if (dataSet) {
                    setSelectedDataSet(dataSet);
                    setAvailableColumns(dataSet.headers);
                    setIsUsingStoredData(true);
                }
            }
        }
    }, [initialData, storedDataSets]);

    const handleDataSetSelect = (dataSet) => {
        setSelectedDataSet(dataSet);
        setAvailableColumns(dataSet.headers);
        setXAxisColumn(dataSet.headers[0] || '');
        // Automatically select the first numeric column for Y-axis as a suggestion
        const firstNumericCol = dataSet.headers.find(h => isNumericColumn(h) && h !== dataSet.headers[0]);
        setYAxisColumns(firstNumericCol ? [firstNumericCol] : [dataSet.headers[1] || dataSet.headers[0] || '']);
        setIsUsingStoredData(true);
    };

    const handleYAxisColumnToggle = (column) => {
        setYAxisColumns(prev => {
            if (prev.includes(column)) {
                return prev.length > 1 ? prev.filter(col => col !== column) : prev;
            } else {
                return [...prev, column];
            }
        });
    };

    const handleRegenerateChart = () => {
        if (!selectedDataSet || !xAxisColumn || yAxisColumns.length === 0) {
            alert('Please select data source and configure axes first.');
            return;
        }

        const labels = selectedDataSet.data.map(row => String(row[xAxisColumn]));
        const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6'];

        const newDatasets = yAxisColumns.map((column, index) => ({
            id: index + 1,
            name: column,
            dataPoints: selectedDataSet.data.map(row => Number(row[column]) || 0),
            color: colors[index % colors.length]
        }));
        
        const updatedGraphData = {
            ...graphData,
            labels: labels,
            datasets: newDatasets,
            dataSourceId: selectedDataSet.id
        };

        setGraphData(updatedGraphData);
        onUpdate && onUpdate(updatedGraphData)
    };

    const handleTitleChange = (e) => {
        if (!mounted) return;
        setGraphData(prev => ({ ...prev, title: e.target.value }));
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!mounted || !graphData) {
        return (
            <div className="w-80 h-full bg-white border-r border-gray-200 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className=" pr-2 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200 ">
                <h2 className="text-lg font-semibold text-black">Edit Area Chart</h2>
                <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><X size={16} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('data')}
                    className={`relative flex-1 py-3 px-4 text-sm font-medium transition-all
                    ${activeTab === 'data'
                            ? 'text-blue-600 bg-blue-50 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-800 after:via-indigo-700 after:to-purple-600 after:content-[""]'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                    `}
                >
                    Data
                </button>

                <button
                    onClick={() => setActiveTab('customize')}
                    className={`relative flex-1 py-3 px-4 text-sm font-medium transition-all
                    ${activeTab === 'customize'
                            ? 'text-blue-600 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-800 bg-blue-50 after:via-indigo-700 after:to-purple-600 after:content-[""]'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                    `}
                >
                    Customize
                </button>

            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'data' && (
                    <div className="p-4 space-y-4">
                        {/* Chart Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title</label>
                            <input
                                type="text"
                                value={graphData.title}
                                onChange={handleTitleChange}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                placeholder="Enter chart title"
                            />
                        </div>

                        {/* Data Source Selection */}
                        <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                            <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                                <Database size={16} className="text-indigo-600" />
                                <span>Data Source</span>
                            </h4>

                            {storedDataSets.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedDataSet && (
                                        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-green-800 text-sm">{selectedDataSet.name}</div>
                                                    <div className="text-xs text-green-600">
                                                        {selectedDataSet.rowCount} rows • {selectedDataSet.headers.length} columns
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedDataSet(null);
                                                        setIsUsingStoredData(false);
                                                        setXAxisColumn('');
                                                        setYAxisColumns([]);
                                                    }}
                                                    className="text-green-600 hover:text-green-800 text-sm underline"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!selectedDataSet && (
                                        <div className="space-y-2 max-h-50 overflow-y-auto">
                                            {storedDataSets.map(dataSet => (
                                                <button
                                                    key={dataSet.id}
                                                    onClick={() => handleDataSetSelect(dataSet)}
                                                    className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                                                >
                                                    <div className="font-medium text-gray-800">{dataSet.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {dataSet.rowCount} rows • {dataSet.headers.join(', ').substring(0, 30)}...
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    <Database size={24} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No datasets available</p>
                                    <p className="text-xs">Import data using the "Data" tab first</p>
                                </div>
                            )}
                        </div>

                        {/* Column Configuration */}
                        {selectedDataSet && (
                            <div className="space-y-4">
                                {/* X-Axis Configuration */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h5 className="font-medium text-gray-700 mb-3">X-Axis (Categories)</h5>
                                    <select
                                        value={xAxisColumn}
                                        onChange={(e) => setXAxisColumn(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    >
                                        <option value="">Select column...</option>
                                        {availableColumns.map(column => (
                                            <option key={column} value={column}>{column}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Y-Axis Configuration */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h5 className="font-medium text-gray-700">Y-Axis (Values)</h5>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => setYAxisColumns(availableColumns.filter(col => col !== xAxisColumn && isNumericColumn(col)))}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                All Numeric
                                            </button>
                                            <button
                                                onClick={() => setYAxisColumns([])}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto space-y-2">
                                        {availableColumns.filter(col => col !== xAxisColumn).map(column => {
                                            const isNumeric = isNumericColumn(column);
                                            return (
                                                <label key={column} className="flex items-center cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={yAxisColumns.includes(column)}
                                                        onChange={() => handleYAxisColumnToggle(column)}
                                                        className="h-3 w-3 rounded border-gray-300 mr-2"
                                                    />
                                                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                                                        {isNumeric ? (
                                                            <>
                                                                <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>
                                                                <span className="text-sm text-gray-900 truncate">{column}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="w-4 flex-shrink-0"></span>
                                                                <span className="text-sm text-gray-900 truncate">{column}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {yAxisColumns.length > 0 && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            Selected: {yAxisColumns.join(', ')}
                                        </div>
                                    )}
                                </div>

                                {/* Generate Chart Button */}
                                <button
                                    onClick={handleRegenerateChart}
                                    disabled={!xAxisColumn || yAxisColumns.length === 0}
                                    className="flex items-center justify-center gap-1 w-full px-[4px] py-[4px] border-2 border-indigo-300 text-indigo-600 bg-blue-50 rounded-md text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw size={16} />
                                    <span>Update Chart Data</span>
                                </button>
                            </div>
                        )}

                        {/* Current Configuration Summary */}
                        {isUsingStoredData && graphData.labels && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <h5 className="font-medium text-blue-800 text-sm mb-2">Current Configuration</h5>
                                <div className="text-xs text-blue-700 space-y-1">
                                    <div>📊 Data Points: {graphData.labels.length}</div>
                                    <div>📈 Data Series: {graphData.datasets?.length || 0}</div>
                                    <div>🏷️ Categories: {graphData.labels?.slice(0, 3).join(', ')}
                                        {graphData.labels?.length > 3 && ` +${graphData.labels.length - 3} more`}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'customize' && (
                    <div className="p-4 space-y-4">
                        {/* Details Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('details')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">Details</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.details ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.details && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Title</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showTitle: !prev.showTitle }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showTitle ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showTitle ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    {graphData.showTitle !== false && (
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Edit Text</label>
                                            <input
                                                type="text"
                                                value={graphData.title}
                                                onChange={handleTitleChange}
                                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                                placeholder="Title goes here"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* X Axis Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('xaxis')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">X Axis</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.xaxis ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.xaxis && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Axis</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showXAxis: !prev.showXAxis }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showXAxis !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showXAxis !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    {graphData.showXAxis !== false && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Title</span>
                                                <button
                                                    onClick={() => setGraphData(prev => ({ ...prev, showXAxisTitle: !prev.showXAxisTitle }))}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showXAxisTitle ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showXAxisTitle ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                            </div>
                                            {graphData.showXAxisTitle && (
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Edit Text</label>
                                                    <input
                                                        type="text"
                                                        value={graphData.xAxisTitle || ''}
                                                        onChange={e => setGraphData(prev => ({ ...prev, xAxisTitle: e.target.value }))}
                                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                                        placeholder="X label"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Y Axis Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('yaxis')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">Y Axis</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.yaxis ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.yaxis && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Axis</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showYAxis: !prev.showYAxis }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showYAxis !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showYAxis !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    {graphData.showYAxis !== false && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Title</span>
                                                <button
                                                    onClick={() => setGraphData(prev => ({ ...prev, showYAxisTitle: !prev.showYAxisTitle }))}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showYAxisTitle ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showYAxisTitle ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                            </div>
                                            {graphData.showYAxisTitle && (
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Edit Text</label>
                                                    <input
                                                        type="text"
                                                        value={graphData.yAxisTitle || ''}
                                                        onChange={e => setGraphData(prev => ({ ...prev, yAxisTitle: e.target.value }))}
                                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                                        placeholder="Y label"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-2 mt-2">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Min</label>
                                                    <input
                                                        type="number"
                                                        value={graphData.yMin ?? ''}
                                                        onChange={e => setGraphData(prev => ({ ...prev, yMin: parseFloat(e.target.value) }))}
                                                        className="w-16 p-1 border border-gray-300 rounded text-sm text-black"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Max</label>
                                                    <input
                                                        type="number"
                                                        value={graphData.yMax ?? ''}
                                                        onChange={e => setGraphData(prev => ({ ...prev, yMax: parseFloat(e.target.value) }))}
                                                        className="w-16 p-1 border border-gray-300 rounded text-sm text-black"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Step Size</label>
                                                    <input
                                                        type="number"
                                                        value={graphData.yStep ?? ''}
                                                        onChange={e => setGraphData(prev => ({ ...prev, yStep: parseFloat(e.target.value) }))}
                                                        className="w-16 p-1 border border-gray-300 rounded text-sm text-black"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Properties Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('properties')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">Properties</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.properties ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.properties && (
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Stroke Width</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={graphData.strokeWidth ?? 2}
                                            onChange={e => setGraphData(prev => ({ ...prev, strokeWidth: parseInt(e.target.value) }))}
                                            className="w-full bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Line Style</label>
                                        <select
                                            value={graphData.lineStyle || 'solid'}
                                            onChange={e => setGraphData(prev => ({ ...prev, lineStyle: e.target.value }))}
                                            className="w-full p-2 border border-gray-300 rounded text-sm text-black"
                                        >
                                            <option value="solid">Solid</option>
                                            <option value="dashed">Dashed</option>
                                            <option value="dotted">Dotted</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Markers</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showMarkers: !prev.showMarkers }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showMarkers !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showMarkers !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    {graphData.showMarkers !== false && (
                                        <div className="flex items-center space-x-2">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Style</label>
                                                <select
                                                    value={graphData.markerStyle || 'circle'}
                                                    onChange={e => setGraphData(prev => ({ ...prev, markerStyle: e.target.value }))}
                                                    className="p-1 border border-gray-300 rounded text-sm text-black"
                                                >
                                                    <option value="circle">Circle</option>
                                                    <option value="square">Square</option>
                                                    <option value="triangle">Triangle</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Size</label>
                                                <input
                                                    type="range"
                                                    min="2"
                                                    max="16"
                                                    value={graphData.markerSize ?? 6}
                                                    onChange={e => setGraphData(prev => ({ ...prev, markerSize: parseInt(e.target.value) }))}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button onClick={() => onUpdate && onUpdate(graphData)} className="w-full py-2 px-3 bg-blue-50 border-2 border-indigo-300 text-indigo-600 rounded-md text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 transition-colors">
                    Save
                </button>
            </div>
        </div>
    );
};

export default AreaChartSetting;
