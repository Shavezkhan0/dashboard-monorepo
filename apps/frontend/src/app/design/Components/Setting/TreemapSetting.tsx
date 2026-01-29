'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, X, Database, RefreshCw, Info } from 'lucide-react';
import { useCanvasHook } from '../../Context/CanvasContext';

const TreemapSetting = ({ initialData, onUpdate, onClose }) => {
    const { storedDataSets } = useCanvasHook();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({
        details: false,
        appearance: true,
        colors: false,
        dataLabels: false,
    });

    const [graphData, setGraphData] = useState(initialData);
    
    // Enhanced data mapping UI states
    const [selectedDataSet, setSelectedDataSet] = useState(null);
    const [categoryField, setCategoryField] = useState(initialData?.categoryField || '');
    const [valueField, setValueField] = useState(initialData?.valueField || '');
    const [parentField, setParentField] = useState(initialData?.parentField || '');
    const [aggregationType, setAggregationType] = useState(initialData?.aggregationType || 'sum');

    // Derived state for available columns
    const availableColumns = useMemo(() => selectedDataSet?.headers || [], [selectedDataSet]);

    // Function to detect if a column contains numeric data
    const isNumericColumn = useCallback((columnName) => {
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
    }, [selectedDataSet]);

    // Function to generate dynamic title
    const generateTitle = useCallback((category, value, parent, aggregation) => {
        const aggregationLabels = {
            'sum': 'Total',
            'count': 'Count of',
            'average': 'Average',
            'min': 'Minimum',
            'max': 'Maximum',
            'none': ''
        };

        let title = `${value} by ${category}`;
        
        if (aggregation !== 'none' && aggregationLabels[aggregation]) {
            title = `${aggregationLabels[aggregation]} ${value} by ${category}`;
        }
        
        if (parent) {
            title += ` (Grouped by ${parent})`;
        }
        
        return title;
    }, []);

    useEffect(() => {
        setMounted(true);
        if (initialData) {
            setGraphData(prev => ({
                ...prev,
                showTitle: initialData.showTitle !== false,
                showDataLabels: initialData.showDataLabels !== false,
                showValues: initialData.showValues !== false
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
        const categoryField = dataSet.headers.find(h => 
            ['name', 'category', 'type', 'group', 'label'].some(keyword => 
                h.toLowerCase().includes(keyword)
            )
        );
        const firstNonNumeric = dataSet.headers.find(h => !isNumericColumn(h));
        const newCategory = categoryField || firstNonNumeric || dataSet.headers[0] || '';
        setCategoryField(newCategory);

        const numericFields = dataSet.headers.filter(h => h !== newCategory && isNumericColumn(h));
        const valueField = numericFields.find(h => 
            ['value', 'amount', 'total', 'sum', 'count', 'quantity'].some(keyword => 
                h.toLowerCase().includes(keyword)
            )
        );
        setValueField(valueField || numericFields[0] || '');
        setParentField('');
        setAggregationType('sum');
    };

    // Enhanced data processing logic
    const handleRegenerateChart = () => {
        if (!selectedDataSet || !categoryField || !valueField) {
            console.error('Please select a data source, category, and value field.');
            return;
        }

        try {
            const processedData = new Map();

            // Process data with aggregation
            selectedDataSet.data.forEach(row => {
                const category = String(row[categoryField] || 'Unknown');
                const value = Number(row[valueField]) || 0;
                const parent = parentField ? String(row[parentField] || '') : '';

                // Skip invalid entries
                if (category === 'Unknown' || category === '' || isNaN(value)) return;

                const key = parentField ? `${parent}|${category}` : category;

                if (!processedData.has(key)) {
                    processedData.set(key, {
                        category,
                        parent,
                        values: []
                    });
                }
                processedData.get(key).values.push(value);
            });

            // Apply aggregation and create final data structure
            const powerBIColors = [
                '#118DFF', '#12239E', '#E66C37', '#6B007B', '#E044A7', 
                '#744EC2', '#D9B300', '#D64550', '#197278', '#1AAA55', 
                '#FFA800', '#00BCF2'
            ];

            const mappedData = Array.from(processedData.entries()).map(([key, item], index) => {
                const values = item.values;
                let aggregatedValue = 0;

                switch (aggregationType) {
                    case 'sum':
                        aggregatedValue = values.reduce((a, b) => a + b, 0);
                        break;
                    case 'average':
                        aggregatedValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                        break;
                    case 'count':
                        aggregatedValue = values.length;
                        break;
                    case 'min':
                        aggregatedValue = Math.min(...values);
                        break;
                    case 'max':
                        aggregatedValue = Math.max(...values);
                        break;
                    default:
                        aggregatedValue = values[0] || 0;
                }

                return {
                    id: item.category.toLowerCase().replace(/\s+/g, '-'),
                    parent: item.parent,
                    name: item.category,
                    value: aggregatedValue,
                    color: powerBIColors[index % powerBIColors.length]
                };
            }).filter(item => item.value > 0);

            const generatedTitle = generateTitle(categoryField, valueField, parentField, aggregationType);

            setGraphData(prev => {
        const updatedGraphData = {
                    ...prev,
                    title: generatedTitle,
            data: mappedData,
                    dataSourceId: selectedDataSet.id,
                    categoryField,
                    valueField,
                    parentField,
                    aggregationType
                };
                onUpdate(updatedGraphData);
                return updatedGraphData;
            });
        } catch (error) {
            console.error('Error processing data:', error);
            alert('Error processing data: ' + error.message);
        }
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
                <h2 className="text-lg font-semibold text-black">Edit Treemap</h2>
                <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                    <X size={16} />
                </button>
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
                            ? 'text-blue-600 bg-blue-50 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-800 after:via-indigo-700 after:to-purple-600 after:content-[""]'
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
                                                <button
                                                    onClick={() => setSelectedDataSet(null)}
                                                    className="text-green-600 hover:text-green-800 text-sm underline"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {storedDataSets.map(dataSet => (
                                        <button
                                            key={dataSet.id}
                                            onClick={() => handleDataSetSelect(dataSet)}
                                            className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                                        >
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
                                {/* Field Selection in Grid Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Category Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Category Field (Labels)
                                        </label>
                                        <select
                                            value={categoryField}
                                            onChange={(e) => setCategoryField(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black"
                                        >
                                            <option value="">-- Select Field --</option>
                                            {availableColumns.map(h => (
                                                <option key={h} value={h}>
                                                    {isNumericColumn(h) ? 'Σ ' : ''}{h}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Value Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Value Field (Sizes)
                                        </label>
                                        <select
                                            value={valueField}
                                            onChange={(e) => setValueField(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black"
                                        >
                                            <option value="">-- Select Field --</option>
                                            {availableColumns.filter(h => h !== categoryField).map(h => (
                                                <option key={h} value={h}>
                                                    {isNumericColumn(h) ? 'Σ ' : ''}{h}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Parent Field and Aggregation in Grid Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Parent Field (Optional) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Parent Field (Optional)
                                        </label>
                                        <select
                                            value={parentField}
                                            onChange={(e) => setParentField(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black"
                                        >
                                            <option value="">No hierarchy</option>
                                            {availableColumns.filter(h => h !== categoryField && h !== valueField).map(h => (
                                                <option key={h} value={h}>
                                                    {isNumericColumn(h) ? 'Σ ' : ''}{h}
                                                </option>
                                            ))}
                                        </select>
                                        {parentField && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Creates nested rectangles
                                            </p>
                                        )}
                                    </div>

                                    {/* Aggregation */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Value Calculation</label>
                                        <select
                                            value={aggregationType}
                                            onChange={(e) => setAggregationType(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-black"
                                        >
                                            <option value="sum">Sum</option>
                                            <option value="count">Count</option>
                                            <option value="average">Average</option>
                                            <option value="min">Minimum</option>
                                            <option value="max">Maximum</option>
                                            <option value="none">No Aggregation</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Update Button */}
                                <button
                                    onClick={handleRegenerateChart}
                                    disabled={!categoryField || !valueField}
                                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw size={16} /> Update Chart Data
                                </button>
                            </div>
                        )}

                        {/* Current Configuration Summary */}
                        {selectedDataSet && graphData.data && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <h5 className="font-medium text-blue-800 text-sm mb-2">Current Configuration</h5>
                                <div className="text-xs text-blue-700 space-y-1">
                                    <div>Data Items: {graphData.data.length}</div>
                                    {categoryField && <div>Category: {categoryField}</div>}
                                    {valueField && <div>Value: {valueField}</div>}
                                    {parentField && <div>Hierarchy: {parentField}</div>}
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

                        {/* Data Labels Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('dataLabels')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">Data Labels</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.dataLabels ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.dataLabels && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Labels</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showDataLabels: !prev.showDataLabels }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showDataLabels !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showDataLabels !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                </button>
            </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Values</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, showValues: !prev.showValues }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showValues !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showValues !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                    </button>
                </div>
            </div>
                            )}
            </div>
            
                        {/* Appearance Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('appearance')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">Appearance</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.appearance ? 'rotate-180' : ''}`} />
            </div>
                            {expandedSections.appearance && (
                                <div className="mt-3 space-y-3">
            <div>
                                        <label className="block text-xs text-gray-500 mb-1">Tooltip Format</label>
                <select 
                                            value={graphData.tooltipFormat || 'default'}
                                            onChange={e => setGraphData(prev => ({ ...prev, tooltipFormat: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded text-sm text-black"
                >
                                            <option value="default">Default (1,234)</option>
                                            <option value="compact">Compact (1.2K)</option>
                                            <option value="currency">Currency ($1,234)</option>
                                            <option value="percentage">Percentage (12.3%)</option>
                </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Border Radius</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10"
                                            step="1"
                                            value={graphData.borderRadius ?? 4}
                                            onChange={e => setGraphData(prev => ({ ...prev, borderRadius: parseFloat(e.target.value) }))}
                                            className="w-full"
                                        />
                                        <span className="text-xs text-gray-500">{graphData.borderRadius ?? 4}px</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Enable Shades</span>
                                        <button
                                            onClick={() => setGraphData(prev => ({ ...prev, enableShades: !prev.enableShades }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.enableShades !== false ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.enableShades !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            )}
            </div>
            
                        {/* Colors Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('colors')}
                            >
                                <h3 className="text-sm font-medium text-gray-700">Colors</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.colors ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.colors && (
                                <div className="mt-3 space-y-3">
            <div>
                                        <label className="block text-xs text-gray-500 mb-1">Color Scheme</label>
                <select 
                                            value={graphData.colorScheme || 'powerbi'}
                                            onChange={e => setGraphData(prev => ({ ...prev, colorScheme: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded text-sm text-black"
                >
                                            <option value="powerbi">Power BI</option>
                                            <option value="default">Default</option>
                                            <option value="pastel">Pastel</option>
                                            <option value="vibrant">Vibrant</option>
                </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Shade Intensity</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={graphData.shadeIntensity ?? 0.5}
                                            onChange={e => setGraphData(prev => ({ ...prev, shadeIntensity: parseFloat(e.target.value) }))}
                                            className="w-full"
                                        />
                                        <span className="text-xs text-gray-500">{((graphData.shadeIntensity ?? 0.5) * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button 
                    onClick={() => onUpdate && onUpdate(graphData)}
                    className="w-full py-2 px-3 bg-blue-50 border-2 border-indigo-300 text-indigo-600 rounded-md text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600"
            >
                    Save Changes
            </button>
            </div>
        </div>
    );
};

export default TreemapSetting;
