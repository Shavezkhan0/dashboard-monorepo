'use client';
'use client';
import React, { useState, useMemo } from 'react'; // 1. Import useMemo
import { useCanvasHook } from '../Context/CanvasContext';
import LineChartWidget from './Widgets/LineChartWidget';
import Papa from 'papaparse';

const AddLineGraph = ({ onClose }) => {
    const { addWidget } = useCanvasHook();
    const [parsedData, setParsedData] = useState(null);

    const [chartProps, setChartProps] = useState({
        title: 'New Visitors Chart',
        labels: ['Jan 22', 'Feb 22', 'Mar 22', 'Apr 22', 'May 22', 'Jun 22'],
        datasets: [{ id: 1, name: 'Dataset 1', dataPoints: [30, 40, 15, 60, 40, 20], color: '#4F46E5' }],
        showTitle: true, showXAxis: true, showXAxisTitle: false, xAxisTitle: 'Months',
        showYAxis: true, showYAxisTitle: false, yAxisTitle: 'Visitors',
        strokeWidth: 2, lineStyle: 'solid', showMarkers: true,
        markerStyle: 'circle', markerSize: 8, yStep: 10
        // yMin and yMax are removed, as they are now dynamic
    });

    // 2. Add the useMemo hook to dynamically calculate the Y-axis range
    const yAxisRange = useMemo(() => {
        const { datasets } = chartProps;
        if (!datasets || datasets.length === 0) {
            return { min: 0, max: 100 };
        }

        const allDataPoints = datasets.flatMap(ds => ds.dataPoints);
        if (allDataPoints.length === 0) {
            return { min: 0, max: 100 };
        }

        const dataMin = Math.min(...allDataPoints);
        const dataMax = Math.max(...allDataPoints);
        const paddedMax = dataMax * 1.1;
        const suggestedMin = dataMin < 0 ? dataMin * 1.1 : 0;

        return {
            min: Math.floor(suggestedMin),
            max: Math.ceil(paddedMax)
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
        const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#FBBF24', '#F87171'];
        const newDatasets = mappedData.datasets.map((ds, index) => ({
            id: index + 1,
            name: ds.name,
            dataPoints: ds.dataPoints,
            color: colors[index % colors.length]
        }));
        setChartProps(prev => ({ ...prev, labels: mappedData.labels, datasets: newDatasets }));
        setParsedData(null);
    };

    const handleAdd = () => {
        // 3. Add the dynamic range to the props before adding the widget
        const finalChartProps = {
            ...chartProps,
            yMin: yAxisRange.min,
            yMax: yAxisRange.max,
        };
        addWidget({ type: 'line', props: finalChartProps });
        if (onClose) onClose();
    };

    return (
        <div className="space-y-2">
            <div className="h-[300px] w-full bg-white rounded-md shadow-inner">
                {/* 4. Pass the dynamic range to the preview widget */}
                <LineChartWidget {...chartProps} yMin={yAxisRange.min} yMax={yAxisRange.max} />
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
                        <label htmlFor="csv-upload-line" className="w-full text-center block py-2 px-4 text-sm font-medium bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                            Import Data from CSV
                        </label>
                        <input id="csv-upload-line" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                    </div>
                </div>
            )}

            <button onClick={handleAdd} className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 ">
                Add Line Graph to Canvas
            </button>
        </div>
    );
};


// Data Mapper sub-component
const DataMapper = ({ data, onMap }) => {
    const headers = data.meta.fields;
    const [xAxis, setXAxis] = useState(headers[0]);
    const [yAxes, setYAxes] = useState([headers[1] || headers[0]]);

    const handleYAxisToggle = (header) => {
        setYAxes(prev =>
            prev.includes(header)
                ? (prev.length > 1 ? prev.filter(h => h !== header) : prev)
                : [...prev, header]
        );
    };

    const handleGenerate = () => {
        const labels = data.data.map(row => row[xAxis]);
        const datasets = yAxes.map(yAxisField => ({
            name: yAxisField,
            dataPoints: data.data.map(row => row[yAxisField])
        }));
        onMap({ labels, datasets });
    };

    return (
        <div className="space-y-4 p-4 border bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-gray-700">Map CSV Data</h4>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">X-Axis (Labels)</label>
                <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm">
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-gray-700">Y-Axis (Values)</label>
                    <div className="space-x-3">
                        <button onClick={() => setYAxes(headers.filter(h => h !== xAxis))} className="text-xs font-medium text-indigo-600 hover:underline">Select All</button>
                        <button onClick={() => setYAxes([])} className="text-xs font-medium text-indigo-600 hover:underline">Unselect All</button>
                    </div>
                </div>
                <div className="max-h-24 overflow-y-auto p-2 border bg-white rounded-md space-y-1">
                    {headers.filter(h => h !== xAxis).map(header => (
                        <div key={header} className="flex items-center">
                            <input
                                id={`cb-line-${header}`}
                                type="checkbox"
                                checked={yAxes.includes(header)}
                                onChange={() => handleYAxisToggle(header)}
                                className="h-4 w-4 rounded border-gray-300" />
                            <label htmlFor={`cb-line-${header}`} className="ml-2 block text-sm text-gray-900">{header}</label>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={handleGenerate} className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer">
                Generate Chart
            </button>
        </div>
    );
}

export default AddLineGraph;
