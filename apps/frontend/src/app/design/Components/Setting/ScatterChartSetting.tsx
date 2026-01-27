'use client';
'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, X, Database } from 'lucide-react';
import { useCanvasHook } from '../../Context/CanvasContext';

const ScatterChartSetting = ({ initialData, onUpdate, onClose }) => {
    const { storedDataSets } = useCanvasHook();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({
        details: false,
        datasets: true,
        xaxis: false,
        yaxis: false,
        properties: false,
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
        const newDataset = {
            id: 1,
            name: `${mappedData.yAxisField} vs ${mappedData.xAxisField}`,
            dataPoints: mappedData.dataPoints,
            color: '#EF4444'
        };
        const updatedGraphData = {
            ...graphData,
            datasets: [newDataset],
            xAxisTitle: mappedData.xAxisField,
            yAxisTitle: mappedData.yAxisField,
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
    
    const handleNumericPropChange = (field, value) => {
        const numericValue = parseFloat(value);
        setGraphData(prev => ({
            ...prev,
            [field]: isNaN(numericValue) ? 'auto' : numericValue
        }));
    };

    const handleDatasetColorChange = (datasetIndex, color) => {
        const newDatasets = JSON.parse(JSON.stringify(graphData.datasets));
        newDatasets[datasetIndex].color = color;
        setGraphData(prev => ({ ...prev, datasets: newDatasets }));
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!mounted || !graphData) {
        return <div className="p-4 text-gray-500">Loading settings...</div>;
    }

    return (
        <div className="pr-2 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold text-black">Edit Scatter Chart</h2>
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
                    <div className="space-y-2">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('details')}>
                                <h3 className="text-sm font-medium text-gray-700">Details</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.details ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.details && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Title</span>
                                        <button onClick={() => handlePropChange('showTitle', !graphData.showTitle)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showTitle ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    {graphData.showTitle && (
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Title Text</label>
                                            <input type="text" value={graphData.title} onChange={(e) => handlePropChange('title', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm text-black" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('xaxis')}>
                                <h3 className="text-sm font-medium text-gray-700">X-Axis</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.xaxis ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.xaxis && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show X-Axis Title</span>
                                        <button onClick={() => handlePropChange('showXAxisTitle', !graphData.showXAxisTitle)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showXAxisTitle ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showXAxisTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    {graphData.showXAxisTitle && (
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">X-Axis Title</label>
                                            <input type="text" value={graphData.xAxisTitle} onChange={(e) => handlePropChange('xAxisTitle', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm text-black" />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="block text-xs text-gray-500 mb-1">X Min</label><input type="text" value={graphData.xMin} onChange={(e) => handleNumericPropChange('xMin', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded text-black" /></div>
                                        <div><label className="block text-xs text-gray-500 mb-1">X Max</label><input type="text" value={graphData.xMax} onChange={(e) => handleNumericPropChange('xMax', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded text-black" /></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('yaxis')}>
                                <h3 className="text-sm font-medium text-gray-700">Y-Axis</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.yaxis ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.yaxis && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Y-Axis Title</span>
                                        <button onClick={() => handlePropChange('showYAxisTitle', !graphData.showYAxisTitle)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showYAxisTitle ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showYAxisTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    {graphData.showYAxisTitle && (
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Y-Axis Title</label>
                                            <input type="text" value={graphData.yAxisTitle} onChange={(e) => handlePropChange('yAxisTitle', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm text-black" />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="block text-xs text-gray-500 mb-1">Y Min</label><input type="text" value={graphData.yMin} onChange={(e) => handleNumericPropChange('yMin', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded text-black" /></div>
                                        <div><label className="block text-xs text-gray-500 mb-1">Y Max</label><input type="text" value={graphData.yMax} onChange={(e) => handleNumericPropChange('yMax', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded text-black" /></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('properties')}>
                                <h3 className="text-sm font-medium text-gray-700">Properties</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.properties ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.properties && (
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-600">Marker Size: {graphData.markerSize}</label>
                                        <input type="range" min="2" max="30" value={graphData.markerSize} onChange={(e) => handlePropChange('markerSize', parseInt(e.target.value))} className="w-full" />
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

    const [xAxisField, setXAxisField] = useState(headers.find(isNumericColumn) || headers[0]);
    const [yAxisField, setYAxisField] = useState(headers.filter(isNumericColumn).slice(1, 2)[0] || headers[1] || headers[0]);


    const handleGenerate = () => {
        const dataPoints = data.data.map(row => ({
            x: row[xAxisField],
            y: row[yAxisField]
        })).filter(p => typeof p.x === 'number' && typeof p.y === 'number'); // Ensure both are numbers
        onMap({ xAxisField, yAxisField, dataPoints });
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
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">X-Axis</label>
                    <div className="max-h-32 overflow-y-auto p-2 border border-gray-300 rounded text-sm bg-white">
                        {headers.map(header => {
                            const isNumeric = isNumericColumn(header);
                            return (
                                <label key={`x-${header}`} className="flex items-center px-1 py-0.5 rounded cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        name="xAxisField"
                                        value={header}
                                        checked={xAxisField === header}
                                        onChange={(e) => setXAxisField(e.target.value)}
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
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Y-Axis</label>
                    <div className="max-h-32 overflow-y-auto p-2 border border-gray-300 rounded text-sm bg-white">
                        {headers.map(header => {
                            const isNumeric = isNumericColumn(header);
                            return (
                                <label key={`y-${header}`} className="flex items-center px-1 py-0.5 rounded cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        name="yAxisField"
                                        value={header}
                                        checked={yAxisField === header}
                                        onChange={(e) => setYAxisField(e.target.value)}
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
                </div>
            </div>
            <button onClick={handleGenerate} className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer">
                Update Chart
            </button>
        </div>
    );
}

export default ScatterChartSetting;






