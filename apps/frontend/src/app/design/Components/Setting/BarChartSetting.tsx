'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, X, Database, RefreshCw, BarChart3, Info } from 'lucide-react';
import { useCanvasHook } from '../../Context/CanvasContext';

// Column selector component for consistent UI
const ColumnSelector = ({ header, checked, onChange, name, isNumeric, type = 'checkbox' }) => (
    <label className="flex items-center cursor-pointer hover:bg-gray-50 px-1 py-1 rounded">
        <input
            type={type}
            name={name}
            value={header}
            checked={checked}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 border-gray-300 mr-3 text-indigo-600 focus:ring-indigo-500"
        />
        <div className="flex items-center space-x-2 min-w-0 flex-1">
            {isNumeric && <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>}
            <span className={`text-sm text-gray-900 truncate ${!isNumeric && 'pl-6'}`}>{header}</span>
        </div>
    </label>
);

const BarChartSetting = ({ initialData, onUpdate, onClose }) => {
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

    // Main state for all chart properties
    const [graphData, setGraphData] = useState(initialData);

    // Enhanced data mapping UI states
    const [selectedDataSet, setSelectedDataSet] = useState(null);
    const [xAxisField, setXAxisField] = useState(initialData?.xAxisField || '');
    const [yAxisFields, setYAxisFields] = useState(initialData?.yAxisFields || []);
    const [legendField, setLegendField] = useState(initialData?.legendField || '');
    const [aggregationType, setAggregationType] = useState(initialData?.aggregationType || 'sum');

    // Derived state for available columns
    const availableColumns = useMemo(() => selectedDataSet?.headers || [], [selectedDataSet]);

    // Function to detect if a column contains numeric data
    const isNumericColumn = (columnName) => {
        if (!selectedDataSet || !selectedDataSet.data) return false;
        const sampleSize = Math.min(10, selectedDataSet.data.length);
        if (sampleSize === 0) return false;
        const samples = selectedDataSet.data.slice(0, sampleSize);
        let numericCount = 0;
        for (const row of samples) {
            const value = row[columnName];
            if (value !== null && value !== undefined && value !== '') {
                if (!isNaN(Number(value))) numericCount++;
            }
        }
        return (numericCount / sampleSize) > 0.7;
    };

    // Function to generate dynamic title
    const generateTitle = (xAxis, yAxes, legend, aggregation) => {
        const aggregationLabels = {
            'sum': 'Sum',
            'count': 'Count',
            'average': 'Average',
            'min': 'Minimum',
            'max': 'Maximum',
            'none': ''
        };

        let title = yAxes.join(' & ') + ' by ' + xAxis;

        if (aggregation !== 'none' && aggregationLabels[aggregation]) {
            title = aggregationLabels[aggregation] + ' of ' + title;
        }

        if (legend) {
            title += ` (grouped by ${legend})`;
        }

        return title;
    };

    useEffect(() => {
        setMounted(true);
        if (initialData) {
            setGraphData(prev => ({
                ...prev,
                showLegend: initialData.showLegend ?? true,
            }));

            // If the chart was created from a stored data source, load it
            if (initialData.dataSourceId) {
                const dataSet = storedDataSets.find(ds => ds.id === initialData.dataSourceId);
                if (dataSet) {
                    setSelectedDataSet(dataSet);
                }
            }
        }
    }, [initialData, storedDataSets]);

    const handleDataSetSelect = (dataSet) => {
        setSelectedDataSet(dataSet);
        // Set smart defaults
        const categoryField = dataSet.headers.find(h => ['name', 'category', 'type', 'group'].some(keyword => h.toLowerCase().includes(keyword)));
        const firstNonNumeric = dataSet.headers.find(h => !isNumericColumn(h));
        const newXAxis = categoryField || firstNonNumeric || dataSet.headers[0] || '';
        setXAxisField(newXAxis);

        const numericFields = dataSet.headers.filter(h => h !== newXAxis && isNumericColumn(h));
        setYAxisFields(numericFields.length > 0 ? [numericFields[0]] : []);
        setLegendField('');
        setAggregationType('sum');
    };

    const handleYAxisToggle = (header) => {
        setYAxisFields(prev =>
            prev.includes(header)
                ? (prev.length > 1 ? prev.filter(h => h !== header) : prev)
                : [...prev, header]
        );
    };

    // Enhanced data processing logic
    const handleRegenerateChart = () => {
        if (!selectedDataSet || !xAxisField || yAxisFields.length === 0) {
            console.error('Please select a data source, X-axis, and at least one Y-axis.');
            return;
        }

        let processedData;
        const sourceData = selectedDataSet.data;

        if (legendField && legendField !== '') {
            // Process data with legend grouping
            const groupedData = new Map();
            sourceData.forEach(row => {
                const legendValue = row[legendField];
                const xValue = row[xAxisField];
                if (!groupedData.has(legendValue)) groupedData.set(legendValue, new Map());
                if (!groupedData.get(legendValue).has(xValue)) {
                    const yValues = {};
                    yAxisFields.forEach(field => { yValues[field] = []; });
                    groupedData.get(legendValue).set(xValue, yValues);
                }
                yAxisFields.forEach(field => {
                    const value = Number(row[field]) || 0;
                    groupedData.get(legendValue).get(xValue)[field].push(value);
                });
            });

            const allXValues = [...new Set(sourceData.map(row => row[xAxisField]))].sort();
            const datasets = [];
            groupedData.forEach((xValueMap, legendValue) => {
                yAxisFields.forEach(yField => {
                    const dataPoints = allXValues.map(xValue => {
                        const values = xValueMap.get(xValue)?.[yField] || [0];
                        switch (aggregationType) {
                            case 'sum': return values.reduce((a, b) => a + b, 0);
                            case 'average': return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                            case 'count': return values.length;
                            case 'min': return Math.min(...values);
                            case 'max': return Math.max(...values);
                            default: return values[0] || 0;
                        }
                    });
                    datasets.push({ name: `${legendValue} - ${yField}`, dataPoints });
                });
            });
            processedData = { labels: allXValues.map(String), datasets };
        } else {
            // Process data without legend grouping
            const aggregatedData = new Map();
            sourceData.forEach(row => {
                const xValue = row[xAxisField];
                if (!aggregatedData.has(xValue)) {
                    const yValues = {};
                    yAxisFields.forEach(field => { yValues[field] = []; });
                    aggregatedData.set(xValue, yValues);
                }
                yAxisFields.forEach(field => {
                    const value = Number(row[field]) || 0;
                    aggregatedData.get(xValue)[field].push(value);
                });
            });

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
                return { name: yField, dataPoints };
            });
            processedData = { labels: sortedXValues.map(String), datasets };
        }

        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6', '#14B8A6', '#FBBF24'];
        const coloredDatasets = processedData.datasets.map((dataset, index) => ({
            ...dataset,
            id: index + 1,
            color: colors[index % colors.length]
        }));

        const generatedTitle = generateTitle(xAxisField, yAxisFields, legendField, aggregationType);

        setGraphData(prev => {
            const updatedGraphData = {
                ...prev,
                title: generatedTitle,
                labels: processedData.labels,
                datasets: coloredDatasets,
                xAxisTitle: xAxisField,
                yAxisTitle: yAxisFields.join(', '),
                // Store configuration for persistence
                dataSourceId: selectedDataSet.id,
                xAxisField,
                yAxisFields,
                legendField,
                aggregationType
            };
            onUpdate(updatedGraphData);
            return updatedGraphData;
        });
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
        <div className="pr-2 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold text-black">Edit Bar Chart</h2>
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
                            ? 'text-blue-600 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r from-blue-800 bg-blue-50 after:via-indigo-700 after:to-purple-600 after:content-[""]'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                    `}
                >
                    Customize
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'data' && (
                    <div className="p-4 space-y-4">
                        {/* Data Source Selection */}
                        <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                            <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                                <Database size={16} className="text-indigo-600" />
                                <span>Data Source</span>
                            </h4>
                            {storedDataSets.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedDataSet ? (
                                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-green-800 text-sm">{selectedDataSet.name}</div>
                                                    <div className="text-xs text-green-600">
                                                        {selectedDataSet.rowCount} rows • {selectedDataSet.headers.length} columns
                                                    </div>
                                                </div>
                                                <button onClick={() => setSelectedDataSet(null)} className="text-green-600 hover:text-green-800 text-sm underline">
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {storedDataSets.map(dataSet => (
                                                <button key={dataSet.id} onClick={() => handleDataSetSelect(dataSet)} className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                                                    <div className="font-medium text-gray-800">{dataSet.name}</div>
                                                    <div className="text-xs text-gray-500">{dataSet.rowCount} rows</div>
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

                        {/* Enhanced Column Configuration */}
                        {selectedDataSet && (
                            <div className="space-y-4 p-4 border bg-white rounded-lg">
                                {/* X-Axis */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">X-Axis (Categories)</label>
                                    <div className="max-h-36 overflow-y-auto p-2 border rounded">
                                        {availableColumns.map(h => (
                                            <ColumnSelector key={`x-${h}`} header={h} checked={xAxisField === h} onChange={setXAxisField} name="xAxisField" type="checkbox" isNumeric={isNumericColumn(h)} />
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Y-Axis */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-600">Y-Axis (Values)</label>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => setYAxisFields(availableColumns.filter(col => col !== xAxisField && isNumericColumn(col)))}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                All Numeric
                                            </button>
                                            <button
                                                onClick={() => setYAxisFields([])}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-36 overflow-y-auto p-2 border rounded">
                                        {availableColumns.filter(h => h !== xAxisField && isNumericColumn(h)).map(h => (
                                            <ColumnSelector key={`y-${h}`} header={h} checked={yAxisFields.includes(h)} onChange={() => handleYAxisToggle(h)} name="yAxisField" type="checkbox" isNumeric={true} />
                                        ))}
                                    </div>
                                    {yAxisFields.length > 0 && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            Selected: {yAxisFields.join(', ')}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Legend/Grouping */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Legend (Optional Grouping)</label>
                                    <div className="max-h-36 overflow-y-auto p-2 border rounded">
                                        <ColumnSelector header="No grouping" checked={legendField === ''} onChange={() => setLegendField('')} name="legendField" type="checkbox" isNumeric={false} />
                                        {availableColumns.filter(h => h !== xAxisField && !yAxisFields.includes(h)).map(h => (
                                            <ColumnSelector key={`legend-${h}`} header={h} checked={legendField === h} onChange={setLegendField} name="legendField" type="checkbox" isNumeric={isNumericColumn(h)} />
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Aggregation */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Value Calculation</label>
                                    <select value={aggregationType} onChange={(e) => setAggregationType(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black">
                                        <option value="sum">Sum</option>
                                        <option value="count">Count</option>
                                        <option value="average">Average</option>
                                        <option value="min">Minimum</option>
                                        <option value="max">Maximum</option>
                                        <option value="none">No Aggregation (First Value)</option>
                                    </select>
                                </div>
                                
                                {/* Update Button */}
                                <button onClick={handleRegenerateChart} disabled={!xAxisField || yAxisFields.length === 0} className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                    <RefreshCw size={16} /> Update Chart Data
                                </button>
                            </div>
                        )}

                        {/* Current Configuration Summary */}
                        {selectedDataSet && graphData.labels && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <h5 className="font-medium text-blue-800 text-sm mb-2">Current Configuration</h5>
                                <div className="text-xs text-blue-700 space-y-1">
                                    <div>Data Points: {graphData.labels.length}</div>
                                    <div>Data Series: {graphData.datasets?.length || 0}</div>
                                    <div>Categories: {graphData.labels?.slice(0, 3).join(', ')}
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
                                        <label className="block text-xs text-gray-500 mb-1">Bar Width</label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                            value={graphData.barWidth ?? 0.6}
                                            onChange={e => setGraphData(prev => ({ ...prev, barWidth: parseFloat(e.target.value) }))}
                                            className="w-full bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Bar Style</label>
                                        <select
                                            value={graphData.barStyle || 'solid'}
                                            onChange={e => setGraphData(prev => ({ ...prev, barStyle: e.target.value }))}
                                            className="w-full p-2 border border-gray-300 rounded text-sm text-black"
                                        >
                                            <option value="solid">Solid</option>
                                            <option value="striped">Striped</option>
                                            <option value="gradient">Gradient</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Legend</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showLegend: !prev.showLegend }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showLegend !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showLegend !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Data Labels</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showDataLabels: !prev.showDataLabels }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showDataLabels !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showDataLabels !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    {graphData.showDataLabels !== false && (
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Label Position</label>
                                            <select
                                                value={graphData.labelPosition || 'top'}
                                                onChange={e => setGraphData(prev => ({ ...prev, labelPosition: e.target.value }))}
                                                className="w-full p-2 border border-gray-300 rounded text-sm text-black"
                                            >
                                                <option value="top">Top</option>
                                                <option value="center">Center</option>
                                                <option value="bottom">Bottom</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button onClick={() => onUpdate && onUpdate(graphData)} className="w-full py-2 px-3 bg-blue-50 border-2 border-indigo-300 text-indigo-600 rounded-md text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default BarChartSetting;