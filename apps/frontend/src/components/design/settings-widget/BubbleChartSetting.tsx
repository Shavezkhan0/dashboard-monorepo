'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, X, Database, RefreshCw, Info } from 'lucide-react';
import { useCanvasHook } from '@/contexts/CanvasContext';

const BubbleChartSetting = ({ initialData, onUpdate, onClose }) => {
    const { storedDataSets } = useCanvasHook();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [expandedSections, setExpandedSections] = useState({
        details: false,
        datasets: true,
        xaxis: false,
        yaxis: false,
        properties: false,
        display: true, // Added
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

    const handleDataMapped = ({ xAxisField, yAxisField, rAxisField, dataPoints, generatedTitle }) => {
        const newDataset = {
            id: 1,
            name: `${yAxisField} vs ${xAxisField}`,
            dataPoints: dataPoints,
            color: '#EF4444'
        };
        const updatedGraphData = {
            ...graphData,
            title: generatedTitle || graphData.title, // Use generated title
            datasets: [newDataset],
            xAxisTitle: xAxisField,
            yAxisTitle: yAxisField,
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
        return <div className="p-4 text-muted-foreground">Loading settings...</div>;
    }

    return (
        <div className="pr-2 h-full bg-background border-r border-gray-200 flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold text-foreground">Edit Bubble Chart</h2>
                <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-md"><X size={16} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('data')}
                    className={`relative flex-1 py-3 px-4 text-sm font-medium transition-all
                    ${activeTab === 'data'
                            ? 'text-blue-600 bg-blue-50 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-800 after:via-indigo-700 after:to-purple-600 after:content-[""]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
                    `}
                >
                    Data
                </button>

                <button
                    onClick={() => setActiveTab('customize')}
                    className={`relative flex-1 py-3 px-4 text-sm font-medium transition-all
                    ${activeTab === 'customize'
                            ? 'text-blue-600 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-gradient-to-r after:from-blue-800 bg-blue-50 after:via-indigo-700 after:to-purple-600 after:content-[""]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
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
                        <div className="border border-border rounded-lg p-2 bg-muted">
                            <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                                <Database size={16} className="text-indigo-600" />
                                <span>Data Source</span>
                            </h4>
                            {storedDataSets.length > 0 ? (
                                <div className="space-y-2 max-h-50 overflow-y-auto">
                                    {storedDataSets.map(dataSet => (
                                        <button
                                            key={dataSet.id}
                                            onClick={() => handleDataSetSelect(dataSet)}
                                            className="w-full text-left p-2 text-sm bg-background border border-border rounded hover:bg-indigo-500/10 hover:border-indigo-300 transition-colors"
                                        >
                                            <div className="font-medium text-foreground">{dataSet.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {dataSet.rowCount} rows • {dataSet.headers.length} columns
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                    <Database size={24} className="mx-auto mb-2" />
                                    <p className="text-sm">No datasets available</p>
                                    <p className="text-xs">Import data using the "Data" tab first</p>
                                </div>
                            )}
                        </div>
                    )
                )}

                
 {activeTab === 'customize' && (
                    <div className="space-y-2">
                        <div className="border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('details')}>
                                <h3 className="text-sm font-medium text-foreground">Details</h3>
                                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections.details ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.details && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Show Title</span>
                                        <button onClick={() => handlePropChange('showTitle', !graphData.showTitle)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showTitle ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    {graphData.showTitle && (
                                        <div>
                                            <label className="block text-xs text-muted-foreground mb-1">Title Text</label>
                                            <input type="text" value={graphData.title} onChange={(e) => handlePropChange('title', e.target.value)} className="w-full p-2 border border-border rounded-md text-sm text-foreground" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('xaxis')}>
                                <h3 className="text-sm font-medium text-foreground">X-Axis</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.xaxis ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.xaxis && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Show X-Axis Title</span>
                                        <button onClick={() => handlePropChange('showXAxisTitle', !graphData.showXAxisTitle)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showXAxisTitle ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showXAxisTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    {graphData.showXAxisTitle && (
                                        <div>
                                            <label className="block text-xs text-muted-foreground mb-1">X-Axis Title</label>
                                            <input type="text" value={graphData.xAxisTitle} onChange={(e) => handlePropChange('xAxisTitle', e.target.value)} className="w-full p-2 border border-border rounded-md text-sm text-foreground" />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="block text-xs text-muted-foreground mb-1">X Min</label><input type="text" value={graphData.xMin} onChange={(e) => handleNumericPropChange('xMin', e.target.value)} className="w-full p-2 text-sm border border-border rounded text-foreground" /></div>
                                        <div><label className="block text-xs text-muted-foreground mb-1">X Max</label><input type="text" value={graphData.xMax} onChange={(e) => handleNumericPropChange('xMax', e.target.value)} className="w-full p-2 text-sm border border-border rounded text-foreground" /></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('yaxis')}>
                                <h3 className="text-sm font-medium text-foreground">Y-Axis</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.yaxis ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.yaxis && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Show Y-Axis Title</span>
                                        <button onClick={() => handlePropChange('showYAxisTitle', !graphData.showYAxisTitle)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showYAxisTitle ? 'bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600' : 'bg-gray-200'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showYAxisTitle ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    {graphData.showYAxisTitle && (
                                        <div>
                                            <label className="block text-xs text-muted-foreground mb-1">Y-Axis Title</label>
                                            <input type="text" value={graphData.yAxisTitle} onChange={(e) => handlePropChange('yAxisTitle', e.target.value)} className="w-full p-2 border border-border rounded-md text-sm text-foreground" />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="block text-xs text-muted-foreground mb-1">Y Min</label><input type="text" value={graphData.yMin} onChange={(e) => handleNumericPropChange('yMin', e.target.value)} className="w-full p-2 text-sm border border-border rounded text-foreground" /></div>
                                        <div><label className="block text-xs text-muted-foreground mb-1">Y Max</label><input type="text" value={graphData.yMax} onChange={(e) => handleNumericPropChange('yMax', e.target.value)} className="w-full p-2 text-sm border border-border rounded text-foreground" /></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Display Options Section */}
                        <div className="border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('display')}>
                                <h3 className="text-sm font-medium text-foreground">Display Options</h3>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.display ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedSections.display && (
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Show Legend</span>
                                            <p className="text-xs text-muted-foreground mt-1">Display legend on the top of chart</p>
                                        </div>
                                        <button 
                                            onClick={() => setGraphData(prev => ({ 
                                                ...prev, 
                                                showLegend: !prev.showLegend
                                            }))} 
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showLegend ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showLegend ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Show Values</span>
                                            <p className="text-xs text-muted-foreground mt-1">Display coordinate values on data points</p>
                                        </div>
                                        <button 
                                            onClick={() => setGraphData(prev => ({ 
                                                ...prev, 
                                                showValues: !prev.showValues
                                            }))} 
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${graphData.showValues ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${graphData.showValues ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-muted">
                <button onClick={() => onUpdate && onUpdate(graphData)} className="w-full py-2 px-3 bg-blue-50 border-2 border-indigo-300 text-indigo-600 rounded-md text-sm font-medium transition-all duration-200 hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields;
    const [aggregationType, setAggregationType] = useState('sum');

    const isNumericColumn = (columnName) => {
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
    };

    const [xAxisField, setXAxisField] = useState(headers.find(isNumericColumn) || headers[0]);
    const [yAxisField, setYAxisField] = useState(headers.filter(isNumericColumn).slice(1, 2)[0] || headers[1] || headers[0]);
    const [rAxisField, setRAxisField] = useState(headers.filter(isNumericColumn).slice(2, 3)[0] || headers[2] || headers[0]);

    // Function to generate dynamic title
    const generateTitle = (xField, yField, rField, aggregation) => {
        const aggregationLabels = {
            'sum': 'Sum',
            'count': 'Count',
            'average': 'Average',
            'min': 'Minimum',
            'max': 'Maximum',
            'distinct_count': 'Distinct Count'
        };

        // Format: X vs Y vs R - Aggregation
        // Example: "Sales vs Revenue vs Size - Sum"
        return `${xField} vs ${yField} vs ${rField} - ${aggregationLabels[aggregation]}`;
    };

    const handleGenerate = () => {
        // For bubble charts, we create data points directly from the raw data
        const dataPoints = data.data.map(row => ({
            x: Number(row[xAxisField]) || 0,
            y: Number(row[yAxisField]) || 0,
            r: Number(row[rAxisField]) || 0
        })).filter(p => !isNaN(p.x) && !isNaN(p.y) && !isNaN(p.r) && p.r > 0);
        
        // Generate the dynamic title
        const generatedTitle = generateTitle(xAxisField, yAxisField, rAxisField, aggregationType);
        
        onMap({ xAxisField, yAxisField, rAxisField, dataPoints, generatedTitle });
    };

    return (
        <div className="space-y-4 p-4 border bg-background rounded-lg">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Configure Chart Data</h4>
                <button
                    onClick={onBack}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                >
                    ← Back to Data Selection
                </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">X-Axis</label>
                    <select value={xAxisField} onChange={(e) => setXAxisField(e.target.value)} className="w-full p-2 border border-border rounded text-sm text-foreground">
                        {headers.map(h => <option key={`x-${h}`} value={h}>{h}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Y-Axis</label>
                    <select value={yAxisField} onChange={(e) => setYAxisField(e.target.value)} className="w-full p-2 border border-border rounded text-sm text-foreground">
                        {headers.map(h => <option key={`y-${h}`} value={h}>{h}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Radius (R)</label>
                    <select value={rAxisField} onChange={(e) => setRAxisField(e.target.value)} className="w-full p-2 border border-border rounded text-sm text-foreground">
                        {headers.map(h => <option key={`r-${h}`} value={h}>{h}</option>)}
                    </select>
                </div>
            </div>

            {/* Preview of generated title */}
            {xAxisField && yAxisField && rAxisField && (
            <div className="bg-muted border border-border rounded-lg p-3">
                <div className="flex items-center space-x-2">
                    <Info size={16} className="text-indigo-600" />
                    <span className="text-sm font-medium text-foreground">Generated Title Preview</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                    "{generateTitle(xAxisField, yAxisField, rAxisField, aggregationType)}"
                </p>
            </div>
            )}

            {/* Aggregation Selection */}
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Data Processing</label>
                <select
                    value={aggregationType}
                    onChange={(e) => setAggregationType(e.target.value)}
                    className="w-full p-2 border border-border rounded text-sm bg-background text-foreground"
                >
                    <option value="sum">Sum</option>
                    <option value="count">Count</option>
                    <option value="average">Average</option>
                    <option value="min">Minimum</option>
                    <option value="max">Maximum</option>
                    <option value="distinct_count">Distinct Count</option>
                </select>
            </div>

            <button onClick={handleGenerate} className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer">
                Update Chart
            </button>
        </div>
    );
};

export default BubbleChartSetting;

