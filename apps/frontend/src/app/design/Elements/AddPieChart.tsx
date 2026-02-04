'use client';

import React, { useState } from 'react';

import PieChartWidget from './Widgets/PieChartWidget';

import { Database, Info } from 'lucide-react';

import { useCanvasHook } from '../Context/CanvasContext';



const AddPieChart = ({ onClose }) => {

    const { addWidget, storedDataSets } = useCanvasHook();

    const [parsedData, setParsedData] = useState(null);



    const [chartProps, setChartProps] = useState({

        title: 'Title Goes Here',

        labels: ['North', 'South', 'East', 'West'],

        datasets: [{

            id: 1,

            dataPoints: [300, 500, 100, 250],

            colors: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444']

        }],

        showTitle: true,

        isEmpty: true

    });



    const handleStoredDataSelect = (dataSet) => {

        const mockResults = {

            data: dataSet.data,

            meta: { fields: dataSet.headers }

        };

        setParsedData(mockResults);

    };



    const handleDataMapped = ({ labels, dataPoints, generatedTitle }) => {

        const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#FBBF24', '#F87171'];

        const generatedColors = labels.map((_, i) => colors[i % colors.length]);



        setChartProps(prev => ({

            ...prev,

            title: generatedTitle, // Use the generated title

            labels: labels,

            datasets: [{ ...prev.datasets[0], dataPoints: dataPoints, colors: generatedColors }],

            isEmpty: false

        }));

    };



    const handleBackToDataSelection = () => {

        setParsedData(null);

    };



    const handleAdd = () => {

        const finalChartProps = { ...chartProps };

        delete finalChartProps.isEmpty;

        addWidget({ type: 'pie', props: finalChartProps });

        if (onClose) onClose();

    };



    return (

        <div className="space-y-4">

            {/* Chart Preview */}

            <div className="h-[300px] w-full rounded-lg shadow-inner relative border border-gray-200 dark:border-gray-600 overflow-hidden">

                <div className="bg-white h-full">

                    <PieChartWidget {...chartProps} />

                </div>

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

                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Chart Title</label>

                            <input

                                type="text"

                                value={chartProps.title}

                                onChange={(e) => setChartProps(p => ({ ...p, title: e.target.value }))}

                                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white dark:text-white"

                                placeholder="Enter chart title"

                            />

                        </div>

                    )}



                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">

                        <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">Data Source</h4>



                        {storedDataSets.length > 0 ? (

                            <div className="space-y-2">

                                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">

                                    <Database size={16} className="text-indigo-600" />

                                    <span>Available Datasets</span>

                                </div>

                                <div className="space-y-2 max-h-40 overflow-y-auto">

                                    {storedDataSets.map(dataSet => (

                                        <button

                                            key={dataSet.id}

                                            onClick={() => handleStoredDataSelect(dataSet)}

                                            className="w-full text-left p-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 transition-colors"

                                        >

                                            <div className="font-medium text-gray-800 dark:text-gray-100">{dataSet.name}</div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">

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

                            <div className="text-center py-6 text-gray-500 dark:text-gray-400">

                                <Database size={32} className="mx-auto mb-3 text-gray-300" />

                                <p className="text-sm font-medium">No datasets available</p>

                                <p className="text-xs mt-1">Import data using the "Data" tab first</p>

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

                                Select a dataset to configure your pie chart.

                            </p>

                        </div>

                    ) : (

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">

                            <div className="flex items-center space-x-2">

                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>

                                <span className="text-sm font-medium text-green-800">Data Configured</span>

                            </div>

                            <p className="text-xs text-green-700 mt-1">

                                Your chart is ready to be added to the canvas.

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

                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-2 border-gray-200 cursor-not-allowed'

                        : 'bg-blue-50 text-indigo-600 hover:text-white border-2 border-indigo-300 hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer'

                }`}

            >

                {chartProps.isEmpty ? 'Select Data to Continue' : 'Add Pie Chart to Canvas'}

            </button>

        </div>

    );

};



// DataMapper with Aggregation Logic and Dynamic Title Generation

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



    const [legendField, setLegendField] = useState(headers.find(h => !isNumericColumn(h)) || headers[0]);

    const [valueField, setValueField] = useState(headers.find(h => isNumericColumn(h)) || headers[1] || headers[0]);



    // Function to generate dynamic title

    const generateTitle = (legend, value, aggregation) => {

        const aggregationLabels = {

            'sum': 'Sum',

            'count': 'Count',

            'average': 'Average',

            'min': 'Minimum',

            'max': 'Maximum',

            'distinct_count': 'Distinct Count'

        };



        // Format: Legend - Values - Value Calculation

        // Example: "Region - Sales - Sum" or "Category - Revenue - Average"

        return `${legend} - ${value} - ${aggregationLabels[aggregation]}`;

    };



    const handleGenerate = () => {

        const aggregationMap = new Map();



        data.data.forEach(row => {

            const category = row[legendField];

            const value = row[valueField];



            if (category == null || category === '') return;



            if (!aggregationMap.has(category)) {

                switch (aggregationType) {

                    case 'average': aggregationMap.set(category, { sum: 0, count: 0 }); break;

                    case 'min': aggregationMap.set(category, Infinity); break;

                    case 'max': aggregationMap.set(category, -Infinity); break;

                    case 'distinct_count': aggregationMap.set(category, new Set()); break;

                    default: aggregationMap.set(category, 0); break;

                }

            }



            const numericValue = Number(value) || 0;



            switch (aggregationType) {

                case 'sum':

                    aggregationMap.set(category, aggregationMap.get(category) + numericValue);

                    break;

                case 'count':

                    if (value != null) aggregationMap.set(category, aggregationMap.get(category) + 1);

                    break;

                case 'average':

                    const avgData = aggregationMap.get(category);

                    avgData.sum += numericValue;

                    avgData.count++;

                    break;

                case 'min':

                    aggregationMap.set(category, Math.min(aggregationMap.get(category), numericValue));

                    break;

                case 'max':

                    aggregationMap.set(category, Math.max(aggregationMap.get(category), numericValue));

                    break;

                case 'distinct_count':

                    if (value != null) aggregationMap.get(category).add(value);

                    break;

            }

        });



        const labels = Array.from(aggregationMap.keys());

        let dataPoints = [];



        switch (aggregationType) {

            case 'average':

                dataPoints = labels.map(label => {

                    const { sum, count } = aggregationMap.get(label);

                    return count > 0 ? sum / count : 0;

                });

                break;

            case 'distinct_count':

                dataPoints = labels.map(label => aggregationMap.get(label).size);

                break;

            case 'min':

                dataPoints = labels.map(label => (aggregationMap.get(label) === Infinity ? 0 : aggregationMap.get(label)));

                break;

            case 'max':

                dataPoints = labels.map(label => (aggregationMap.get(label) === -Infinity ? 0 : aggregationMap.get(label)));

                break;

            default:

                dataPoints = Array.from(aggregationMap.values());

        }



        // Generate the dynamic title

        const generatedTitle = generateTitle(legendField, valueField, aggregationType);



        onMap({ labels, dataPoints, generatedTitle });

    };



    return (

        <div className="space-y-4 p-4 border bg-gray-50 dark:bg-gray-700 rounded-lg">

            <div className="flex items-center justify-between">

                <h4 className="font-semibold text-gray-700 dark:text-gray-200">Configure Chart Data</h4>

                <button onClick={onBack} className="text-xs text-indigo-600 hover:text-indigo-800 underline">

                    ← Back to Data Selection

                </button>

            </div>

           

            {/* Preview of generated title */}

            {legendField && valueField && (

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">

                    <div className="flex items-center space-x-2">

                        <Info size={16} className="text-indigo-600" />

                        <span className="text-sm font-medium text-indigo-800">Generated Title Preview</span>

                    </div>

                    <p className="text-sm text-indigo-700 mt-1 font-medium">

                        "{generateTitle(legendField, valueField, aggregationType)}"

                    </p>

                </div>

            )}

           

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Column Selection */}

                <div>

                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Legend (Categories)</label>

                    <div className="max-h-36 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white">

                        {headers.map(h => <ColumnSelector key={`leg-${h}`} header={h} checked={legendField === h} onChange={setLegendField} name="legendField" isNumeric={isNumericColumn(h)} />)}

                    </div>

                </div>

                <div>

                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Values (Slice Sizes)</label>

                    <div className="max-h-36 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white">

                        {headers.map(h => <ColumnSelector key={`val-${h}`} header={h} checked={valueField === h} onChange={setValueField} name="valueField" isNumeric={isNumericColumn(h)} />)}

                    </div>

                </div>

            </div>



            {/* Aggregation Selection */}

            <div>

                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Value Calculation</label>

                 <select

                    value={aggregationType}

                    onChange={(e) => setAggregationType(e.target.value)}

                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white text-black dark:text-white"

                 >

                    <option value="sum">Sum</option>

                    <option value="count">Count</option>

                    <option value="average">Average</option>

                    <option value="min">Minimum</option>

                    <option value="max">Maximum</option>

                    <option value="distinct_count">Distinct Count</option>

                 </select>

            </div>



            <button

                onClick={handleGenerate}

                disabled={!legendField || !valueField}

                className="w-full py-2 px-4 bg-blue-50 text-indigo-600 hover:text-white transition-all duration-200 border-2 border-indigo-300 rounded-md font-medium hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

            >

                Generate Chart

            </button>

        </div>

    );

};



const ColumnSelector = ({ header, checked, onChange, name, isNumeric }) => (

    <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:bg-gray-700 px-1 py-1 rounded">

        <input

            type="checkbox"

            name={name}

            value={header}

            checked={checked}

            onChange={(e) => onChange(e.target.value)}

            className="h-4 w-4 border-gray-300 dark:border-gray-600 mr-3 text-indigo-600 focus:ring-indigo-500"

        />

        <div className="flex items-center space-x-2 min-w-0 flex-1">

            {isNumeric && <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">Σ</span>}

            <span className={`text-sm text-gray-900 truncate ${!isNumeric && 'pl-6'}`}>{header}</span>

        </div>

    </label>

);



export default AddPieChart;