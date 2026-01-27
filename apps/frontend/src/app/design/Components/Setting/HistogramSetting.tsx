'use client';
'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, X, Database, RefreshCw } from 'lucide-react';
import { useCanvasHook } from '../../Context/CanvasContext';

const HistogramSetting = ({ initialData, onUpdate, onClose }) => {
    const { storedDataSets } = useCanvasHook();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({
        details: false,
        binning: true,
        xaxis: false,
        yaxis: false,
    });
    const [graphData, setGraphData] = useState(initialData || {});
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
            dataset: { ...graphData.dataset, rawData: mappedData.rawData },
            dataSourceId: parsedData.id
        };
        setGraphData(updatedGraphData);
        onUpdate && onUpdate(updatedGraphData); // Immediately update the chart
        setParsedData(null);
    };

    const handleBackToDataSelection = () => {
        setParsedData(null);
    };

    const handlePropChange = (field, value) => {
        setGraphData(prev => ({ ...prev, [field]: value }));
    };

    const handleDatasetPropChange = (field, value) => {
        setGraphData(prev => ({
            ...prev,
            dataset: { ...prev.dataset, [field]: value }
        }));
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!mounted) {
        return (
            <div className="w-full h-full bg-white flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="pr-2 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg text-black font-semibold">Edit Histogram</h2>
                <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><X size={16} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('data')}
                    className={`relative flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'data'
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    Data
                    {activeTab === 'data' && (
                        <span className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600"></span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('customize')}
                    className={`relative flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'customize'
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    Customize
                    {activeTab === 'customize' && (
                        <span className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600"></span>
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'data' && (
                    parsedData ? (
                        <DataMapper
                            data={parsedData}
                            onMap={handleDataMapped}
                            onBack={handleBackToDataSelection}
                        />
                    ) : (
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title</label>
                                <input type="text" value={graphData.title} onChange={(e) => handlePropChange('title', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm text-black" />
                            </div>
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
                        </div>
                    )
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
                                                className="w-full text-black p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                                        className="w-full text-black p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                                        className="w-full text-black p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Y label"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-2 mt-2">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Min</label>
                                                    <input
                                                        type="number"
                                                        value={graphData.yMin ?? 0}
                                                        onChange={e => setGraphData(prev => ({ ...prev, yMin: parseFloat(e.target.value) }))}
                                                        className="w-16 p-1 text-black border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Max</label>
                                                    <input
                                                        type="number"
                                                        value={graphData.yMax ?? 100}
                                                        onChange={e => setGraphData(prev => ({ ...prev, yMax: parseFloat(e.target.value) }))}
                                                        className="w-16 p-1 text-black border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Step Size</label>
                                                    <input
                                                        type="number"
                                                        value={graphData.yStep ?? 5}
                                                        onChange={e => setGraphData(prev => ({ ...prev, yStep: parseFloat(e.target.value) }))}
                                                        className="w-16 text-black p-1 border border-gray-300 rounded text-sm"
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
                                            className="w-full text-black bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Line Style</label>
                                        <select
                                            value={graphData.lineStyle || 'solid'}
                                            onChange={e => setGraphData(prev => ({ ...prev, lineStyle: e.target.value }))}
                                            className="w-full p-2 text-black border border-gray-300 rounded text-sm"
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
                                                    className="p-1 text-black border border-gray-300 rounded text-sm"
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

            <div className="p-4 border-t bg-gray-50">
                <button onClick={() => onUpdate && onUpdate(graphData)} className="w-full py-2 px-3 bg-blue-50 border-2 border-indigo-300 text-indigo-600 rounded-md text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

// Data Mapper for Histograms
const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields;

    // Helper to check if a column is likely numeric
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

    const [dataField, setDataField] = useState(headers.find(isNumericColumn) || headers[0]);

    const handleGenerate = () => {
        // Extract all numbers from the selected column
        const rawData = data.data.map(row => Number(row[dataField])).filter(n => !isNaN(n));
        onMap({ rawData });
    };

    return (
        <div className="space-y-4 p-4 border-2 border-dashed bg-white border-gray-200 rounded-lg">
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
                <label className="block text-sm font-medium text-gray-600 mb-1">Select Data Column</label>
                <div className="max-h-32 overflow-y-auto p-2 border border-gray-300 rounded text-sm bg-white">
                    {headers.map(header => {
                        const isNumeric = isNumericColumn(header);
                        return (
                            <label key={header} className="flex items-center px-1 py-0.5 rounded cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="dataField"
                                    value={header}
                                    checked={dataField === header}
                                    onChange={(e) => setDataField(e.target.value)}
                                    className="h-3 w-3 rounded border-gray-300 mr-3"
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
                Update Chart
            </button>
        </div>
    );
}

export default HistogramSetting;



