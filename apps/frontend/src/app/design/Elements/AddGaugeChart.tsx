'use client';
'use client';
import React, { useState, useMemo } from 'react';
import { useCanvasHook } from '../Context/CanvasContext';
import GaugeChartWidget from './Widgets/GaugeChartWidget';
import { Database } from 'lucide-react';

const AddGaugeChart = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);
    const [dataSource, setDataSource] = useState('default');

    const [chartProps, setChartProps] = useState({
        title: 'Title goes here',
        value: 40,
        target: 50,
        maxValue: 100,
        minValue: 0,
        unit: 'K',
        labels: ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'],
        colors: ['#2B2A84', '#6F6DE2', '#9796F5', '#C4C4F5'],
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

    const handleDataMapped = (mappedData) => {
        setChartProps(prev => ({
            ...prev,
            value: mappedData.value,
            minValue: mappedData.minValue,
            maxValue: mappedData.maxValue,
            target: mappedData.target,
            isEmpty: false
        }));
        setParsedData(null); // Hide the mapper UI
        setDataSource('configured');
    };

    const handleBackToDataSelection = () => {
        setParsedData(null);
        setDataSource('default');
    };

    const handlePropChange = (field, value) => {
        setChartProps(prev => ({ ...prev, [field]: value }));
    };

    const handleAdd = () => {
        const finalProps = { ...chartProps };
        delete finalProps.isEmpty;
        addWidget({
            type: 'gauge',
            props: finalProps
        });
        if (onClose) onClose();
    };

    return (
        <div className="space-y-4">
            <div className="h-[300px] w-full bg-white rounded-md shadow-inner relative border border-gray-200 overflow-hidden">
                <GaugeChartWidget {...chartProps} />
            </div>

            {parsedData ? (
                <DataMapper
                    data={parsedData}
                    onMap={handleDataMapped}
                    onBack={handleBackToDataSelection}
                />
            ) : (
                <div className="space-y-4">
                    {!chartProps.isEmpty && (
                        <div className="space-y-2">
                             <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Chart Title</label>
                                <input
                                    type="text"
                                    value={chartProps.title}
                                    onChange={(e) => handlePropChange('title', e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-300 rounded text-black"
                                    placeholder="Enter chart title"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Min Value</label>
                                    <input 
                                        type="number" 
                                        value={chartProps.minValue} 
                                        onChange={(e) => handlePropChange('minValue', Number(e.target.value))} 
                                        className="w-full p-2 text-sm border border-gray-300 rounded text-black" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Max Value</label>
                                    <input 
                                        type="number" 
                                        value={chartProps.maxValue} 
                                        onChange={(e) => handlePropChange('maxValue', Number(e.target.value))} 
                                        className="w-full p-2 text-sm border border-gray-300 rounded text-black" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Target</label>
                                    <input 
                                        type="number" 
                                        value={chartProps.target} 
                                        onChange={(e) => handlePropChange('target', Number(e.target.value))} 
                                        className="w-full p-2 text-sm border border-gray-300 rounded text-black" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                                    <input 
                                        type="text" 
                                        value={chartProps.unit} 
                                        onChange={(e) => handlePropChange('unit', e.target.value)} 
                                        className="w-full p-2 text-sm border border-gray-300 rounded text-black" 
                                        placeholder="e.g., K, M, %" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

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

                    {chartProps.isEmpty ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-sm font-medium text-blue-800">Preview Mode</span>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">
                                Default chart preview shown. Select a dataset to configure your gauge chart.
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

            <button
                onClick={handleAdd}
                disabled={chartProps.isEmpty}
                className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                    chartProps.isEmpty
                        ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                        : 'bg-blue-50 text-indigo-600 hover:text-white border-2 border-indigo-300 hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'
                }`}
            >
                {chartProps.isEmpty ? 'Select Data to Continue' : 'Add Gauge Chart to Canvas'}
            </button>
        </div>
    );
};

const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields;

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
    
    const [valueField, setValueField] = useState(headers.find(isNumericColumn) || headers[0]);
    const [targetField, setTargetField] = useState('manual');
    const [manualTarget, setManualTarget] = useState(50);

    // Calculate statistics for the selected column
    const columnStats = useMemo(() => {
        if (!valueField) return { min: 0, max: 100, values: [] };
        
        const values = data.data
            .map(row => Number(row[valueField]))
            .filter(val => !isNaN(val) && isFinite(val));
        
        if (values.length === 0) return { min: 0, max: 100, values: [] };
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        return { min, max, avg: Math.round(avg * 100) / 100, values };
    }, [valueField, data]);

    const handleGenerate = () => {
        const firstValue = columnStats.values[0] || 0;
        
        // Determine target value based on selection
        let targetValue;
        if (targetField === 'manual') {
            targetValue = manualTarget;
        } else if (targetField === 'average') {
            targetValue = columnStats.avg;
        } else if (targetField === 'max') {
            targetValue = columnStats.max;
        } else {
            // It's a column name
            const targetValues = data.data
                .map(row => Number(row[targetField]))
                .filter(val => !isNaN(val) && isFinite(val));
            targetValue = targetValues[0] || columnStats.avg;
        }
        
        onMap({ 
            value: firstValue,
            minValue: columnStats.min,
            maxValue: columnStats.max,
            target: targetValue
        });
    };

    return (
        <div className="space-y-4 p-4 border bg-white rounded-lg">
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
                <label className="block text-sm font-medium text-gray-600 mb-1">Select Value Column</label>
                <div className="max-h-32 overflow-y-auto p-2 border border-gray-300 rounded text-sm bg-white">
                    {headers.map(header => {
                        const isNumeric = isNumericColumn(header);
                        return (
                            <label key={header} className="flex items-center px-1 py-0.5 rounded cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    name="valueField"
                                    value={header}
                                    checked={valueField === header}
                                    onChange={(e) => setValueField(e.target.value)}
                                    className="h-3 w-3 border-gray-300 mr-3"
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
                <p className="text-xs text-gray-500 mt-1">The first number in this column will be used as the gauge's value.</p>
            </div>

            {/* Data Statistics Display */}
            {valueField && columnStats.values.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Data Statistics for "{valueField}"</h5>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="text-center">
                            <div className="font-semibold text-gray-800">{columnStats.min}</div>
                            <div className="text-gray-500">Min</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-gray-800">{columnStats.avg}</div>
                            <div className="text-gray-500">Average</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-gray-800">{columnStats.max}</div>
                            <div className="text-gray-500">Max</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Target Value Selection */}
            {valueField && columnStats.values.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Target Value</label>
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    name="targetField"
                                    value="manual"
                                    checked={targetField === 'manual'}
                                    onChange={(e) => setTargetField(e.target.value)}
                                    className="h-3 w-3 border-gray-300 mr-2"
                                />
                                <span className="text-sm text-gray-700">Manual</span>
                            </label>
                            <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    name="targetField"
                                    value="average"
                                    checked={targetField === 'average'}
                                    onChange={(e) => setTargetField(e.target.value)}
                                    className="h-3 w-3 border-gray-300 mr-2"
                                />
                                <span className="text-sm text-gray-700">Average ({columnStats.avg})</span>
                            </label>
                            <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    name="targetField"
                                    value="max"
                                    checked={targetField === 'max'}
                                    onChange={(e) => setTargetField(e.target.value)}
                                    className="h-3 w-3 border-gray-300 mr-2"
                                />
                                <span className="text-sm text-gray-700">Maximum ({columnStats.max})</span>
                            </label>
                            <div>
                                <select
                                    value={targetField !== 'manual' && targetField !== 'average' && targetField !== 'max' ? targetField : ''}
                                    onChange={(e) => setTargetField(e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-300 rounded text-black"
                                >
                                    <option value="">From Column...</option>
                                    {headers.filter(header => isNumericColumn(header) && header !== valueField).map(header => (
                                        <option key={header} value={header}>{header}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {targetField === 'manual' && (
                            <div className="mt-2">
                                <input
                                    type="number"
                                    value={manualTarget}
                                    onChange={(e) => setManualTarget(Number(e.target.value))}
                                    placeholder="Enter target value"
                                    className="w-full p-2 text-sm border border-gray-300 rounded text-black"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button 
                onClick={handleGenerate} 
                className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer"
            >
                Generate Chart
            </button>
        </div>
    );
};

export default AddGaugeChart;
