'use client';
import React, { useState, useMemo } from 'react';
import { useCanvasHook } from '@/contexts/CanvasContext';
import GaugeChartWidget from '@/components/design/widgets/GaugeChartWidget';
import { Database, TrendingUp } from 'lucide-react';

const AddGaugeChart = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);
    const [dataSource, setDataSource] = useState('default');

    const [chartProps, setChartProps] = useState({
        title: 'Gauge Chart',
        showTitle: true,
        value: 40,
        target: 50,
        maxValue: 100,
        minValue: 0,
        unit: '',
        labels: ['Low', 'Medium', 'High'],
        colors: ['#EF4444', '#F59E0B', '#10B981'],
        showTarget: true,
        needleColor: '#1e40af',
        valueFormat: 'default', // default, currency, percentage, compact
        isEmpty: true // Flag to indicate no real data is selected
    });

    const handleStoredDataSelect = (dataSet) => {
        const mockResults = {
            data: dataSet.data,
            meta: { fields: dataSet.headers || dataSet.columns || [] },
            id: dataSet.id
        };
        setParsedData(mockResults);
        setDataSource('stored');
    };

    const handleDataMapped = (mappedData) => {
        setChartProps(prev => ({
            ...prev,
            title: mappedData.title || prev.title,
            value: mappedData.value,
            minValue: mappedData.minValue,
            maxValue: mappedData.maxValue,
            target: mappedData.target,
            dataSourceId: mappedData.dataSourceId,
            valueField: mappedData.valueField,
            targetField: mappedData.targetField,
            isEmpty: false
        }));
        setParsedData(null); // Hide the mapper UI
        setDataSource('configured');
    };

    const handleBackToDataSelection = () => {
        setParsedData(null);
        setDataSource('default');
        setChartProps(prev => ({
            ...prev,
            title: 'Gauge Chart',
            value: 40,
            target: 50,
            maxValue: 100,
            minValue: 0,
            unit: '',
            isEmpty: true
        }));
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
            <div className="h-[300px] w-full bg-background rounded-md shadow-inner relative border border-border overflow-hidden">
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
                        <div className="space-y-3">
                             <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Chart Title</label>
                                <input
                                    type="text"
                                    value={chartProps.title}
                                    onChange={(e) => handlePropChange('title', e.target.value)}
                                    className="w-full p-2 text-sm border border-border rounded text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter chart title"
                                />
                            </div>

                            {/* Format Options Section */}
                            <div className="border border-border rounded-lg p-3 bg-muted">
                                <h4 className="text-sm font-medium text-foreground mb-3">Format Options</h4>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">Unit / Prefix</label>
                                        <input 
                                            type="text" 
                                            value={chartProps.unit} 
                                            onChange={(e) => handlePropChange('unit', e.target.value)} 
                                            className="w-full p-2 text-sm border border-border rounded text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                                            placeholder="e.g., $, K, M, %" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">Value Format</label>
                                        <select 
                                            value={chartProps.valueFormat} 
                                            onChange={(e) => handlePropChange('valueFormat', e.target.value)} 
                                            className="w-full p-2 text-sm border border-border rounded text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="default">Default</option>
                                            <option value="currency">Currency</option>
                                            <option value="percentage">Percentage</option>
                                            <option value="compact">Compact (K, M)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                            className="w-full text-left p-3 text-sm bg-background border border-border rounded hover:bg-indigo-500/10 hover:bg-muted hover:border-border transition-colors"
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

                    {chartProps.isEmpty ? (
                        <div className="bg-muted border border-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-sm font-medium text-foreground">Preview Mode</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Default chart preview shown. Select a dataset to configure your gauge chart.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-muted border border-border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm font-medium text-foreground">Data Configured</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
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
                        ? 'bg-muted text-muted-foreground border-2 border-border cursor-not-allowed'
                        : 'bg-muted text-indigo-600 hover:text-white border-2 border-border hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'
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
    const [customTitle, setCustomTitle] = useState('');

    // Generate dynamic title
    const generateTitle = () => {
        if (customTitle.trim()) return customTitle;
        if (!valueField) return 'Gauge Chart';
        
        let title = valueField;
        
        if (targetField && targetField !== 'manual') {
            if (targetField === 'average') {
                title += ' vs Average';
            } else if (targetField === 'max') {
                title += ' vs Maximum';
            } else {
                title += ` vs ${targetField}`;
            }
        }
        
        return title;
    };

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
            title: generateTitle(),
            value: firstValue,
            minValue: columnStats.min,
            maxValue: columnStats.max,
            target: targetValue,
            dataSourceId: data.id,
            valueField: valueField,
            targetField: targetField
        });
    };

    return (
        <div className="space-y-4 p-4 border bg-background rounded-lg">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Configure Gauge Data</h4>
                <button
                    onClick={onBack}
                    className="text-xs text-indigo-600 hover:text-foreground underline"
                >
                    ← Back to Data Selection
                </button>
            </div>

            {/* Dynamic Title Preview */}
            {valueField && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-indigo-700 mb-1">Gauge Title Preview</div>
                    <div className="text-lg font-bold text-indigo-900">{generateTitle()}</div>
                </div>
            )}

            {/* Value Field Selection */}
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                    <TrendingUp size={16} className="inline mr-1" />
                    Value Column
                </label>
                <select
                    value={valueField}
                    onChange={(e) => setValueField(e.target.value)}
                    className="w-full p-2 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {headers.map(header => {
                        const isNumeric = isNumericColumn(header);
                        return (
                            <option key={header} value={header}>
                                {isNumeric ? 'Σ ' : ''}{header}
                            </option>
                        );
                    })}
                </select>
                <p className="text-xs text-muted-foreground mt-1">The first value in this column will be displayed on the gauge.</p>
            </div>

            {/* Data Statistics Display */}
            {valueField && columnStats.values.length > 0 && (
                <div className="bg-muted border border-border rounded-lg p-3">
                    <h5 className="text-sm font-medium text-foreground mb-3">Data Statistics for "{valueField}"</h5>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="text-center bg-background rounded p-2">
                            <div className="font-bold text-lg text-foreground">{columnStats.min}</div>
                            <div className="text-muted-foreground mt-1">Minimum</div>
                        </div>
                        <div className="text-center bg-background rounded p-2">
                            <div className="font-bold text-lg text-indigo-600">{columnStats.avg}</div>
                            <div className="text-muted-foreground mt-1">Average</div>
                        </div>
                        <div className="text-center bg-background rounded p-2">
                            <div className="font-bold text-lg text-foreground">{columnStats.max}</div>
                            <div className="text-muted-foreground mt-1">Maximum</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Target Value Selection */}
            {valueField && columnStats.values.length > 0 && (
                <div className="border border-border rounded-lg p-3 bg-muted">
                    <label className="block text-sm font-medium text-foreground mb-3">Target Configuration</label>
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <label className={`flex items-center p-2 border-2 rounded cursor-pointer transition-all ${
                                targetField === 'manual' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-background hover:bg-muted'
                            }`}>
                                <input
                                    type="radio"
                                    name="targetField"
                                    value="manual"
                                    checked={targetField === 'manual'}
                                    onChange={(e) => setTargetField(e.target.value)}
                                    className="h-4 w-4 border-border mr-2 text-indigo-600"
                                />
                                <span className="text-sm text-foreground font-medium">Manual</span>
                            </label>
                            <label className={`flex items-center p-2 border-2 rounded cursor-pointer transition-all ${
                                targetField === 'average' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-background hover:bg-muted'
                            }`}>
                                <input
                                    type="radio"
                                    name="targetField"
                                    value="average"
                                    checked={targetField === 'average'}
                                    onChange={(e) => setTargetField(e.target.value)}
                                    className="h-4 w-4 border-border mr-2 text-indigo-600"
                                />
                                <span className="text-sm text-foreground font-medium">Average ({columnStats.avg})</span>
                            </label>
                            <label className={`flex items-center p-2 border-2 rounded cursor-pointer transition-all ${
                                targetField === 'max' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-background hover:bg-muted'
                            }`}>
                                <input
                                    type="radio"
                                    name="targetField"
                                    value="max"
                                    checked={targetField === 'max'}
                                    onChange={(e) => setTargetField(e.target.value)}
                                    className="h-4 w-4 border-border mr-2 text-indigo-600"
                                />
                                <span className="text-sm text-foreground font-medium">Maximum ({columnStats.max})</span>
                            </label>
                            <div>
                                <select
                                    value={targetField !== 'manual' && targetField !== 'average' && targetField !== 'max' ? targetField : ''}
                                    onChange={(e) => setTargetField(e.target.value)}
                                    className="w-full p-2 text-sm border border-border rounded text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">From Column...</option>
                                    {headers.filter(header => isNumericColumn(header) && header !== valueField).map(header => (
                                        <option key={header} value={header}>
                                            Σ {header}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {targetField === 'manual' && (
                            <div className="mt-2">
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Enter Target Value</label>
                                <input
                                    type="number"
                                    value={manualTarget}
                                    onChange={(e) => setManualTarget(Number(e.target.value))}
                                    placeholder="Enter target value"
                                    className="w-full p-2 text-sm border border-border rounded text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Custom Title (Optional) */}
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Custom Title (Optional)</label>
                <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Leave empty for auto-generated title"
                    className="w-full p-2 border border-border rounded text-sm bg-background text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-muted-foreground mt-1">If empty, title will be auto-generated from selected fields</p>
            </div>

            <button 
                onClick={handleGenerate} 
                disabled={!valueField}
                className="w-full py-2 px-4 bg-muted text-indigo-600 hover:text-white transition-all duration-200 border-2 border-border rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Generate Gauge Chart
            </button>
        </div>
    );
};

export default AddGaugeChart;