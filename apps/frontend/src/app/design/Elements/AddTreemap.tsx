'use client';
'use client';
import React, { useState, useMemo } from 'react';
import { useCanvasHook } from '../Context/CanvasContext';
import TreemapWidget from './Widgets/TreemapWidget';
import { Database, X } from 'lucide-react';

const AddTreemap = ({ onClose }) => {
    const { addWidget, storedDataSets } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);
    const [dataSource, setDataSource] = useState('default');

    const [chartProps, setChartProps] = useState({
        title: 'Title Goes Here',
        data: [
            { id: 'electronics', parent: '', name: 'Electronics', value: 300 },
            { id: 'phones', parent: 'electronics', name: 'Phones', value: 150 },
            { id: 'laptops', parent: 'electronics', name: 'Laptops', value: 100 },
            { id: 'tablets', parent: 'electronics', name: 'Tablets', value: 50 },
            { id: 'clothing', parent: '', name: 'Clothing', value: 200 },
        ],
        showTitle: true,
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
            data: mappedData,
            isEmpty: false
        }));
        setParsedData(null);
        setDataSource('configured');
    };

    const handleBackToDataSelection = () => {
        setParsedData(null);
        setDataSource('default');
    };

    const handleAdd = () => {
        const finalProps = { ...chartProps };
        delete finalProps.isEmpty;
        addWidget({ type: 'treemap', props: finalProps });
        if (onClose) onClose();
    };

    return (
        <div className="space-y-4">
            <div className="h-[300px] w-full bg-white rounded-md shadow-inner relative border border-gray-200 overflow-hidden">
                <TreemapWidget {...chartProps} />
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
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Chart Title</label>
                            <input
                                type="text"
                                value={chartProps.title}
                                onChange={(e) => setChartProps(p => ({ ...p, title: e.target.value }))}
                                className="w-full p-2 text-sm border border-gray-300 rounded text-black"
                                placeholder="Enter chart title"
                            />
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
                                Default chart preview shown. Select a dataset to configure your treemap.
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
                {chartProps.isEmpty ? 'Select Data to Continue' : 'Add Treemap to Canvas'}
            </button>
        </div>
    );
};

const DataMapper = ({ data, onMap, onBack }) => {
    const headers = data.meta.fields || [];
    const [nameField, setNameField] = useState(headers[0] || 'name');
    const [valueField, setValueField] = useState(headers[1] || 'value');

    const handleGenerate = () => {
        if (!data.data || data.data.length === 0) {
            alert('No data found in the dataset.');
            return;
        }

        try {
            const mappedData = data.data
                .map(row => ({
                    id: String(row[nameField] || ''), // The ID is derived from the name
                    parent: '', // Treemaps from this component are flat
                    name: String(row[nameField] || 'Unknown'),
                    value: Number(row[valueField]) || 0
                }))
                .filter(item => 
                    item.name !== 'Unknown' && 
                    !isNaN(item.value) && 
                    item.value > 0
                );

            if (mappedData.length === 0) {
                alert('No valid data rows found. Please check your column selections.');
                return;
            }

            onMap(mappedData);
        } catch (error) {
            console.error('Error mapping data:', error);
            alert('Error processing data.');
        }
    };

    if (!headers || headers.length === 0) {
        return (
            <div className="space-y-4 p-4 border bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-700">Map Data</h4>
                    <button onClick={onBack} className="p-1 text-gray-500 hover:text-gray-800">
                        <X size={16} />
                    </button>
                </div>
                <p className="text-sm text-red-600">No headers found in the data.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 border bg-white rounded-lg">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-700">Configure Chart Data</h4>
                <button onClick={onBack} className="text-xs text-indigo-600 hover:text-indigo-800 underline">
                    ← Back to Data Selection
                </button>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Name Column</label>
                <select 
                    value={nameField} 
                    onChange={(e) => setNameField(e.target.value)} 
                    className="w-full p-2 border border-gray-300 rounded text-sm text-black"
                >
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Value Column</label>
                <select 
                    value={valueField} 
                    onChange={(e) => setValueField(e.target.value)} 
                    className="w-full p-2 border border-gray-300 rounded text-sm text-black"
                >
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
            </div>
            
            <button 
                onClick={handleGenerate} 
                className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer"
            >
                Generate Chart
            </button>
        </div>
    );
};

export default AddTreemap;

