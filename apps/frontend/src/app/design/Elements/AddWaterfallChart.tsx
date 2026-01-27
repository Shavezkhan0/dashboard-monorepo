'use client';
'use client';
import React, { useState, useMemo } from 'react';
import { useCanvasHook } from '../Context/CanvasContext';
import WaterfallChartWidget from './Widgets/WaterfallChartWidget';
import Papa from 'papaparse';
import { X } from 'lucide-react';

const AddWaterfallChart = ({ onClose }) => {
    const { addWidget } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);

    const [chartProps, setChartProps] = useState({
        title: 'Monthly Revenue Change',
        labels: ['Jan Sales', 'Feb Sales', 'Mar Returns', 'Apr Sales', 'May Sales', 'Jun Returns'],
        dataPoints: [100, 80, -25, 60, 45, -30],
        initialValue: 200,
        showTitle: true,
        showXAxis: true,
        showYAxis: true,
        yAxisTitle: 'Revenue ($)',
    });

    const yAxisRange = useMemo(() => {
        const { dataPoints, initialValue } = chartProps;
        if (dataPoints.length === 0) return { min: 0, max: 100 };

        let maxVal = initialValue;
        let minVal = initialValue;
        let currentTotal = initialValue;

        // Calculate the range including all intermediate values
        for (const value of dataPoints) {
            currentTotal += value;
            maxVal = Math.max(maxVal, currentTotal, initialValue + value);
            minVal = Math.min(minVal, currentTotal, initialValue);
        }

        // Add padding
        const range = maxVal - minVal;
        const padding = Math.max(range * 0.1, 10);
        
        return {
            min: Math.floor(minVal - padding),
            max: Math.ceil(maxVal + padding)
        };
    }, [chartProps.dataPoints, chartProps.initialValue]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true, 
                dynamicTyping: true, 
                skipEmptyLines: true,
                delimitersToGuess: [',', '\t', '|', ';'],
                complete: (results) => {
                    console.log('CSV parsed:', results);
                    setParsedData(results);
                },
                error: (error) => {
                    console.error('CSV parsing error:', error);
                    alert('Error parsing CSV file. Please check the format.');
                }
            });
        }
    };

    const handleDataMapped = (mappedData) => {
        console.log('Mapped waterfall data:', mappedData);
        setChartProps(prev => ({
            ...prev,
            labels: mappedData.labels,
            dataPoints: mappedData.dataPoints,
            initialValue: mappedData.initialValue
        }));
        setParsedData(null);
    };

    const handleAdd = () => {
        const finalProps = { ...chartProps, yMin: yAxisRange.min, yMax: yAxisRange.max };
        console.log('Adding waterfall widget with props:', finalProps);
        addWidget({ type: 'waterfall', props: finalProps });
        if (onClose) onClose();
    };

    return (
        <div className="space-y-2">
            <div className="h-[300px] w-full bg-white rounded-md shadow-inner">
                <WaterfallChartWidget {...chartProps} yMin={yAxisRange.min} yMax={yAxisRange.max} />
            </div>

            {parsedData ? (
                <DataMapper 
                    data={parsedData} 
                    onMap={handleDataMapped} 
                    onCancel={() => setParsedData(null)}
                />
            ) : (
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                        <input 
                            type="text" 
                            value={chartProps.title} 
                            onChange={(e) => setChartProps(p => ({ ...p, title: e.target.value }))} 
                            className="w-full p-2 text-sm border border-gray-300 rounded" 
                        />
                    </div>
                    <div>
                        <label 
                            htmlFor="csv-upload-waterfall" 
                            className="w-full text-center block py-2 px-4 text-sm font-medium bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                        >
                            Import Data from CSV
                        </label>
                        <input 
                            id="csv-upload-waterfall" 
                            type="file" 
                            accept=".csv" 
                            className="hidden" 
                            onChange={handleFileChange} 
                        />
                    </div>
                </div>
            )}

            <button 
                onClick={handleAdd} 
                className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer"
            >
                Add Waterfall Chart to Canvas
            </button>
        </div>
    );
};

const DataMapper = ({ data, onMap, onCancel }) => {
    const headers = data.meta.fields || [];
    const [labelField, setLabelField] = useState(headers[0] || '');
    const [valueField, setValueField] = useState(headers[1] || headers[0] || '');
    const [initialValue, setInitialValue] = useState(0);

    const handleGenerate = () => {
        if (!data.data || data.data.length === 0) {
            alert('No data found in CSV file.');
            return;
        }

        try {
            const labels = data.data
                .map(row => String(row[labelField] || 'Unknown'))
                .filter(label => label.trim() !== '');

            const dataPoints = data.data
                .map(row => {
                    const value = Number(row[valueField]);
                    return isNaN(value) ? 0 : value;
                })
                .slice(0, labels.length); // Match array lengths

            console.log('Generated waterfall data:', { labels, dataPoints, initialValue });
            
            if (labels.length === 0 || dataPoints.length === 0) {
                alert('No valid data found. Please check your column mappings.');
                return;
            }

            onMap({ labels, dataPoints, initialValue });
        } catch (error) {
            console.error('Error mapping data:', error);
            alert('Error processing data. Please check your CSV format.');
        }
    };

    if (!headers || headers.length === 0) {
        return (
            <div className="space-y-4 p-4 border bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-700">Map CSV Data</h4>
                    <button onClick={onCancel} className="p-1 text-gray-500 hover:text-gray-800">
                        <X size={16} />
                    </button>
                </div>
                <p className="text-sm text-red-600">No headers found in CSV file. Please ensure your CSV has a header row.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 border bg-gray-100 rounded-lg">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-700">Map CSV Data</h4>
                <button onClick={onCancel} className="p-1 text-gray-500 hover:text-gray-800">
                    <X size={16} />
                </button>
            </div>
            
            <div className="text-xs text-gray-600 mb-2">
                Found {data.data?.length || 0} rows with columns: {headers.join(', ')}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                    Initial Starting Value
                </label>
                <input
                    type="number"
                    value={initialValue}
                    onChange={(e) => setInitialValue(Number(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="Enter starting value (e.g., 0, 100, 1000)"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Label Column</label>
                <select 
                    value={labelField} 
                    onChange={(e) => setLabelField(e.target.value)} 
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                    Value Column (Changes/Increments)
                </label>
                <select 
                    value={valueField} 
                    onChange={(e) => setValueField(e.target.value)} 
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    Positive values = increases, Negative values = decreases
                </p>
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

export default AddWaterfallChart;
