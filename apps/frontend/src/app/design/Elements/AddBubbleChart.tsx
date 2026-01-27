'use client';
'use client';
import React, { useState, useMemo } from 'react';
import { useCanvasHook } from '../Context/CanvasContext';
import BubbleChartWidget from './Widgets/BubbleChartWidget';
import Papa from 'papaparse';
import { X } from 'lucide-react';

const AddBubbleChart = ({ onClose }) => {
    const { addWidget } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);

    const [chartProps, setChartProps] = useState({
        title: 'Product Sales vs. Price vs. Size',
        datasets: [{
            id: 1,
            name: 'Products',
            data: [
                { x: 20, y: 30, r: 15 },
                { x: 40, y: 10, r: 10 },
                { x: 60, y: 25, r: 20 },
                { x: 80, y: 50, r: 25 },
                { x: 90, y: 40, r: 12 },
            ],
            color: '#4338CA'
        }],
        showTitle: true,
        showXAxis: true,
        xAxisTitle: 'Price',
        showYAxis: true,
        yAxisTitle: 'Sales',
        xMin: 0,
        xMax: 100,
        yMin: 0,
        yMax: 100,
    });

    const axisRange = useMemo(() => {
        const { datasets } = chartProps;
        if (!datasets || datasets.length === 0) {
            return { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
        }

        const allXPoints = datasets.flatMap(ds => ds.data.map(p => p.x));
        const allYPoints = datasets.flatMap(ds => ds.data.map(p => p.y));

        if (allXPoints.length === 0) {
            return { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
        }

        const minX = Math.min(...allXPoints);
        const maxX = Math.max(...allXPoints);
        const minY = Math.min(...allYPoints);
        const maxY = Math.max(...allYPoints);

        return {
            xMin: Math.floor(minX * 0.9), xMax: Math.ceil(maxX * 1.1),
            yMin: Math.floor(minY * 0.9), yMax: Math.ceil(maxY * 1.1),
        };
    }, [chartProps.datasets]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true, dynamicTyping: true, skipEmptyLines: true,
                complete: (results) => setParsedData(results)
            });
        }
    };

    const handleDataMapped = (mappedData) => {
        const colors = ['#4338CA', '#1D4ED8', '#2563EB', '#F59E0B', '#10B981', '#EF4444', '#6366F1'];
        const newDatasets = mappedData.datasets.map((ds, index) => ({
            id: index + 1,
            name: ds.name,
            data: ds.data,
            color: colors[index % colors.length]
        }));
        setChartProps(prev => ({ ...prev, datasets: newDatasets, xAxisTitle: mappedData.xAxisField, yAxisTitle: mappedData.yAxisField }));
        setParsedData(null);
    };

    const handleAdd = () => {
        const finalProps = { ...chartProps, ...axisRange };
        addWidget({ type: 'bubble', props: finalProps });
        if (onClose) onClose();
    };

    return (
        <div className="space-y-2">
            <div className="h-[300px] w-full bg-white rounded-md shadow-inner">
                <BubbleChartWidget {...chartProps} {...axisRange} />
            </div>

            {parsedData ? (
                <DataMapper data={parsedData} onMap={handleDataMapped} />
            ) : (
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                        <input type="text" value={chartProps.title} onChange={(e) => setChartProps(p => ({ ...p, title: e.target.value }))} className="w-full p-2 text-sm border border-gray-300 rounded" />
                    </div>
                    <div>
                        <label htmlFor="csv-upload-bubble" className="w-full text-center block py-2 px-4 text-sm font-medium bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                            Import Data from CSV
                        </label>
                        <input id="csv-upload-bubble" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                    </div>
                </div>
            )}

            <button onClick={handleAdd} className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer">
                Add Bubble Chart to Canvas
            </button>
        </div>
    );
};

const DataMapper = ({ data, onMap }) => {
    const headers = data.meta.fields;
    const [xAxisField, setXAxisField] = useState(headers[0]);
    const [yAxisField, setYAxisField] = useState(headers[1] || headers[0]);
    const [rAxisField, setRAxisField] = useState(headers[2] || headers[0]);

    const handleGenerate = () => {
        const dataPoints = data.data.map(row => ({
            x: row[xAxisField],
            y: row[yAxisField],
            r: row[rAxisField]
        })).filter(p => typeof p.x === 'number' && typeof p.y === 'number' && typeof p.r === 'number' && p.r > 0);
        
        onMap({ 
            xAxisField: xAxisField,
            yAxisField: yAxisField,
            datasets: [{ data: dataPoints }]
        });
    };

    return (
        <div className="space-y-4 p-4 border bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-gray-700">Map CSV Data</h4>
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">X-Axis</label>
                    <select value={xAxisField} onChange={(e) => setXAxisField(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm">
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Y-Axis</label>
                    <select value={yAxisField} onChange={(e) => setYAxisField(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm">
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Radius (R)</label>
                    <select value={rAxisField} onChange={(e) => setRAxisField(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm">
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
            </div>
            <button onClick={handleGenerate} className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer">
                Generate Chart
            </button>
        </div>
    );
};

export default AddBubbleChart;

