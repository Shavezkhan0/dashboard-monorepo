'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { useCanvasHook } from '@/contexts/CanvasContext';
import TreemapWidget from '@/components/design/widgets/TreemapWidget';
import { Database, Info, TrendingUp } from 'lucide-react';

const AddTreemap = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);

    // Default chart data with Power BI-style colors
    const [chartProps, setChartProps] = useState({
        title: 'Title Goes Here',
        data: [
            { id: 'electronics', parent: '', name: 'Electronics', value: 300, color: '#118DFF' },
            { id: 'phones', parent: 'electronics', name: 'Phones', value: 150, color: '#12239E' },
            { id: 'laptops', parent: 'electronics', name: 'Laptops', value: 100, color: '#E66C37' },
            { id: 'tablets', parent: 'electronics', name: 'Tablets', value: 50, color: '#6B007B' },
            { id: 'clothing', parent: '', name: 'Clothing', value: 200, color: '#E044A7' },
        ],
        showTitle: true,
        showDataLabels: true,
        showValues: true,
        colorScheme: 'powerbi',
        enableShades: true,
        shadeIntensity: 0.5,
        isEmpty: true
    });

    const handleStoredDataSelect = useCallback((dataSet) => {
        const mockResults = {
            data: dataSet.data,
            meta: { fields: dataSet.headers },
            id: dataSet.id
        };
        setParsedData(mockResults);
    }, []);

    const handleDataMapped = useCallback(({ mappedData, categoryField, valueField, parentField, aggregationType, generatedTitle }) => {
        setChartProps(prev => ({
            ...prev,
            title: generatedTitle,
            data: mappedData,
            categoryField,
            valueField,
            parentField,
            aggregationType,
            isEmpty: false
        }));
    }, []);

    const handleBackToDataSelection = useCallback(() => {
        setParsedData(null);
        setChartProps(prev => ({
            ...prev,
            title: 'Title Goes Here',
            data: [
                { id: 'electronics', parent: '', name: 'Electronics', value: 300, color: '#118DFF' },
                { id: 'phones', parent: 'electronics', name: 'Phones', value: 150, color: '#12239E' },
                { id: 'laptops', parent: 'electronics', name: 'Laptops', value: 100, color: '#E66C37' },
                { id: 'tablets', parent: 'electronics', name: 'Tablets', value: 50, color: '#6B007B' },
                { id: 'clothing', parent: '', name: 'Clothing', value: 200, color: '#E044A7' },
            ],
            isEmpty: true
        }));
    }, []);

    const handleAdd = useCallback(() => {
        const finalProps = { ...chartProps };
        delete finalProps.isEmpty;
        addWidget({ type: 'treemap', props: finalProps });
        if (onClose) onClose();
    }, [chartProps, addWidget, onClose]);

    const handleTitleChange = useCallback((value) => {
        setChartProps(p => ({ ...p, title: value }));
    }, []);

    return (
        <div className="space-y-4">
            {/* Chart Preview */}
            <div className="h-[300px] w-full rounded-lg shadow-inner relative border border-gray-200 dark:border-gray-600 overflow-hidden">
                <div className="bg-white dark:bg-gray-800 h-full">
                    <TreemapWidget {...chartProps} />
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

                    {/* Chart Options - only show when data is configured */}
                    {!chartProps.isEmpty && (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">Chart Options</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={chartProps.showDataLabels}
                                            onChange={(e) => setChartProps(p => ({ ...p, showDataLabels: e.target.checked }))}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-200">Show Labels</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={chartProps.showValues}
                                            onChange={(e) => setChartProps(p => ({ ...p, showValues: e.target.checked }))}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-200">Show Values</span>
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
                                            className="w-full text-left p-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                Select a dataset to configure your treemap with hierarchical data visualization.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium text-green-800">Data Configured</span>
                            </div>
                            <p className="text-xs text-green-700 mt-1">
                                Your treemap is ready to be added to the canvas.
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
                        ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                        : 'bg-blue-50 text-indigo-600 hover:text-white border-2 border-indigo-300 hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'
                }`}
            >
                {chartProps.isEmpty ? 'Select Data to Continue' : 'Add Treemap to Canvas'}
            </button>
        </div>
    );
};

// Enhanced Data Mapper Component with advanced features
const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields || [];
    
    // Detect numeric columns
    const isNumericColumn = useCallback((columnName) => {
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
    }, [data.data]);

    // Smart defaults
    const [categoryField, setCategoryField] = useState(() => {
        const categoryField = headers.find(h => 
            ['name', 'category', 'type', 'group', 'label'].some(keyword => 
                h.toLowerCase().includes(keyword)
            )
        );
        const firstNonNumeric = headers.find(h => !isNumericColumn(h));
        return categoryField || firstNonNumeric || headers[0] || '';
    });

    const [valueField, setValueField] = useState(() => {
        const numericFields = headers.filter(h => h !== categoryField && isNumericColumn(h));
        const valueField = numericFields.find(h => 
            ['value', 'amount', 'total', 'sum', 'count', 'quantity'].some(keyword => 
                h.toLowerCase().includes(keyword)
            )
        );
        return valueField || numericFields[0] || headers[1] || '';
    });

    const [parentField, setParentField] = useState(''); // Optional for hierarchical data
    const [aggregationType, setAggregationType] = useState('sum');

    // Generate dynamic title
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

    const handleGenerate = useCallback(() => {
        if (!data.data || data.data.length === 0) {
            alert('No data found in the dataset.');
            return;
        }

        if (!categoryField || !valueField) {
            alert('Please select both category and value fields.');
            return;
        }

        try {
            const processedData = new Map();

            // Process data with aggregation
            data.data.forEach(row => {
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

            if (mappedData.length === 0) {
                alert('No valid data rows found. Please check your column selections.');
                return;
            }

            const generatedTitle = generateTitle(categoryField, valueField, parentField, aggregationType);

            onMap({
                mappedData,
                categoryField,
                valueField,
                parentField,
                aggregationType,
                generatedTitle
            });
        } catch (error) {
            console.error('Error mapping data:', error);
            alert('Error processing data: ' + error.message);
        }
    }, [data.data, categoryField, valueField, parentField, aggregationType, generateTitle, onMap]);

    if (!headers || headers.length === 0) {
        return (
            <div className="space-y-4 p-4 border bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200">Map Data</h4>
                    <button onClick={onBack} className="text-xs text-indigo-600 hover:text-indigo-800 underline">
                        ← Back
                    </button>
                </div>
                <p className="text-sm text-red-600">No headers found in the data.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 border bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200">Configure Treemap</h4>
                <button
                    onClick={onBack}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                >
                    ← Back to Data Selection
                </button>
            </div>

            {/* Preview of generated title */}
            {categoryField && valueField && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <Info size={16} className="text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-800">Generated Title Preview</span>
                    </div>
                    <p className="text-sm text-indigo-700 mt-1 font-medium">
                        "{generateTitle(categoryField, valueField, parentField, aggregationType)}"
                    </p>
                </div>
            )}

            {/* Field Selection in Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Category Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        <TrendingUp size={16} className="inline mr-1" />
                        Category Field (Labels)
                    </label>
                    <select
                        value={categoryField}
                        onChange={(e) => setCategoryField(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- Select Field --</option>
                        {headers.map(h => (
                            <option key={h} value={h}>
                                {isNumericColumn(h) ? 'Σ ' : ''}{h}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Value Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Value Field (Sizes)
                    </label>
                    <select
                        value={valueField}
                        onChange={(e) => setValueField(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- Select Field --</option>
                        {headers.filter(h => h !== categoryField).map(h => (
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
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Parent Field (Optional)
                    </label>
                    <select
                        value={parentField}
                        onChange={(e) => setParentField(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">No hierarchy</option>
                        {headers.filter(h => h !== categoryField && h !== valueField).map(h => (
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

                {/* Aggregation Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Value Calculation</label>
                    <select
                        value={aggregationType}
                        onChange={(e) => setAggregationType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

            {/* Data Info */}
            <div className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                <span className="font-medium">Data Preview:</span> {data.data?.length || 0} rows found
            </div>

            <button
                onClick={handleGenerate}
                disabled={!categoryField || !valueField}
                className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                Generate Treemap
            </button>
        </div>
    );
};

export default AddTreemap;
