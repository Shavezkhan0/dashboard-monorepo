'use client';
'use client';
import React, { useState, useEffect,useMemo } from 'react';
import { ChevronDown, X, Database } from 'lucide-react';
import { useCanvasHook } from '../../Context/CanvasContext';

const GaugeChartSetting = ({ initialData, onUpdate, onClose }) => {
    const { storedDataSets } = useCanvasHook();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({
        general: true,
        value: true,
        colors: true,
    });
    const [graphData, setGraphData] = useState(initialData);
    const [parsedData, setParsedData] = useState(null); // To trigger DataMapper

    useEffect(() => {
        setMounted(true);
        if (initialData) {
            setGraphData(initialData);
        }
    }, [initialData]);

    const handleDataSetSelect = (dataSet) => {
        const dataForMapper = {
            data: dataSet.data,
            meta: { fields: dataSet.headers },
            id: dataSet.id
        };
        setParsedData(dataForMapper);
    };

    const handleDataMapped = (mappedData) => {
        const updatedGraphData = {
            ...graphData,
            value: mappedData.value,
            minValue: mappedData.minValue,
            maxValue: mappedData.maxValue,
            target: mappedData.target,
            dataSourceId: parsedData.id
        };
        setGraphData(updatedGraphData);
        onUpdate && onUpdate(updatedGraphData);
        setParsedData(null);
    };

    const handleBackToDataSelection = () => {
        setParsedData(null);
    };

    const handlePropChange = (field, value) => {
        setGraphData(prev => ({ ...prev, [field]: value }));
    };

    const handleNumericPropChange = (field, value) => {
        setGraphData(prev => ({ ...prev, [field]: Number(value) }));
    };

    const handleColorChange = (index, newColor) => {
        setGraphData(prev => {
            const newColors = [...prev.colors];
            newColors[index] = newColor;
            return { ...prev, colors: newColors };
        });
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!mounted || !graphData) return <div className="p-4">Loading...</div>;

    return (
        <div className="h-full bg-white border-r border-gray-200 flex flex-col shadow-lg pr-2">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold text-black">Edit Gauge Chart</h2>
                <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><X size={16} /></button>
            </div>

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

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'data' && (
                    parsedData ? (
                        <DataMapper
                            data={parsedData}
                            onMap={handleDataMapped}
                            onBack={handleBackToDataSelection}
                        />
                    ) : (
                        <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                            <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                                <Database size={16} className="text-indigo-600" />
                                <span>Data Source</span>
                            </h4>
                            {storedDataSets.length > 0 ? (
                                <div className="space-y-2 max-h-50 overflow-y-auto">
                                    {storedDataSets.map(dataSet => (
                                        <button
                                            key={dataSet.id}
                                            onClick={() => handleDataSetSelect(dataSet)}
                                            className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                                        >
                                            <div className="font-medium text-gray-800">{dataSet.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {dataSet.rowCount} rows • {dataSet.headers.length} columns
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    <Database size={24} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No datasets available</p>
                                    <p className="text-xs">Import data using the "Data" tab first</p>
                                </div>
                            )}
                        </div>
                    )
                )}

                {activeTab === 'customize' && (
                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('general')}>
                                <h3 className="text-sm font-medium text-gray-700">General</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.general ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.general && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Title</span>
                                        <button onClick={() => handlePropChange('showTitle', !graphData.showTitle)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showTitle ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    {graphData.showTitle && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Title Text</label>
                                            <input type="text" value={graphData.title} onChange={(e) => handlePropChange('title', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded text-black" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('value')}>
                                <h3 className="text-sm font-medium text-gray-700">Value & Range</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.value ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.value && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Target</span>
                                        <button onClick={() => handlePropChange('showTarget', !graphData.showTarget)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showTarget ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showTarget ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Current Value</label>
                                        <input type="number" value={graphData.value} onChange={(e) => handleNumericPropChange('value', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded text-black" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Target</label>
                                            <input type="number" value={graphData.target} onChange={(e) => handleNumericPropChange('target', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded text-black" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                                            <input type="text" value={graphData.unit} onChange={(e) => handlePropChange('unit', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded text-black" placeholder="e.g., K, M, %" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Min Value</label>
                                            <input type="number" value={graphData.minValue} onChange={(e) => handleNumericPropChange('minValue', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded text-black" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Max Value</label>
                                            <input type="number" value={graphData.maxValue} onChange={(e) => handleNumericPropChange('maxValue', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded text-black" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('colors')}>
                                <h3 className="text-sm font-medium text-gray-700">Colors</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.colors ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.colors && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-gray-600">Needle Color</label>
                                        <input type="color" value={graphData.needleColor} onChange={(e) => handlePropChange('needleColor', e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-gray-600">Low Color (Zone 1)</label>
                                        <input type="color" value={graphData.colors[0]} onChange={(e) => handleColorChange(0, e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-gray-600">Mid Color (Zone 2)</label>
                                        <input type="color" value={graphData.colors[1]} onChange={(e) => handleColorChange(1, e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-gray-600">High Color (Zone 3)</label>
                                        <input type="color" value={graphData.colors[2]} onChange={(e) => handleColorChange(2, e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t bg-gray-50">
                <button onClick={() => onUpdate && onUpdate(graphData)} className="w-full py-2 px-3 bg-blue-50 border-2 border-indigo-300 text-indigo-600 rounded-md text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 transition-colors">
                    Save Changes
                </button>
            </div>
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
        
        let targetValue;
        if (targetField === 'manual') {
            targetValue = manualTarget;
        } else if (targetField === 'average') {
            targetValue = columnStats.avg;
        } else if (targetField === 'max') {
            targetValue = columnStats.max;
        } else {
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
                Update Chart
            </button>
        </div>
    );
};

export default GaugeChartSetting;
