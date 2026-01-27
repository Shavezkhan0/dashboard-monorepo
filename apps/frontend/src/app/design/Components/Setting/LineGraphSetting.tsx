'use client';
'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Minus, ChevronDown, X, Play, Pause, RotateCcw } from 'lucide-react';

const LineGraphSetting = ({ initialData, onUpdate, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('data');
  const [isRealTime, setIsRealTime] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    details: false,
    datasets: true,
    realtime: false,
    xaxis: false,
    yaxis: false,
    properties: false
  });

  const defaultData = {
    title: 'Real-time Visitors Data',
    labels: ['Jan 22', 'Feb 22', 'Mar 22', 'Apr 22', 'May 22', 'Jun 22'],
    datasets: [
      {
        id: 1,
        name: 'Dataset 1',
        dataPoints: [30, 40, 15, 60, 40, 20],
        color: '#4F46E5'
      },
    ],
    showTitle: true,
    showXAxis: true,
    showXAxisTitle: true,
    showYAxis: true,
    showYAxisTitle: true,
    strokeWidth: 2,
    lineStyle: 'solid',
    showMarkers: true,
    markerStyle: 'circle',
    markerSize: 6,
    yMin: 0,
    yMax: 100,
    yStep: 5
  };

  const [graphData, setGraphData] = useState(defaultData);

  // Real-time data simulation
  useEffect(() => {
    let interval;
    if (isRealTime) {
      interval = setInterval(() => {
        setGraphData(prev => {
          const newData = { ...prev };
          newData.datasets = newData.datasets.map(dataset => ({
            ...dataset,
            dataPoints: dataset.dataPoints.map(point => {
              const variation = (Math.random() - 0.5) * 20;
              return Math.max(0, Math.round(point + variation));
            })
          }));
          if (onUpdate) onUpdate(newData);
          return newData;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRealTime, onUpdate]);

  useEffect(() => {
    setMounted(true);
    if (initialData) {
      setGraphData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleTitleChange = (e) => {
    if (!mounted) return;
    const newData = { ...graphData, title: e.target.value };
    setGraphData(newData);
  };

  const handleLabelChange = (index, value) => {
    if (!mounted) return;
    const newLabels = [...graphData.labels];
    newLabels[index] = value;
    const newData = { ...graphData, labels: newLabels };
    setGraphData(newData);
  };

  const handleDataPointChange = (datasetIndex, pointIndex, value) => {
    if (!mounted) return;
    const newDatasets = [...graphData.datasets];
    newDatasets[datasetIndex].dataPoints[pointIndex] = parseFloat(value) || 0;
    const newData = { ...graphData, datasets: newDatasets };
    setGraphData(newData);
  };

  const handleDatasetColorChange = (datasetIndex, color) => {
    if (!mounted) return;
    const newDatasets = [...graphData.datasets];
    newDatasets[datasetIndex].color = color;
    const newData = { ...graphData, datasets: newDatasets };
    setGraphData(newData);
  };

  const handleDatasetNameChange = (datasetIndex, name) => {
    if (!mounted) return;
    const newDatasets = [...graphData.datasets];
    newDatasets[datasetIndex].name = name;
    const newData = { ...graphData, datasets: newDatasets };
    setGraphData(newData);
  };

  const addDataPoint = () => {
    if (!mounted) return;
    const newData = {
      ...graphData,
      labels: [...graphData.labels, `Label ${graphData.labels.length + 1}`],
      datasets: graphData.datasets.map(dataset => ({
        ...dataset,
        dataPoints: [...dataset.dataPoints, Math.floor(Math.random() * 50) + 10]
      }))
    };
    setGraphData(newData);
  };

  const removeDataPoint = (index) => {
    if (!mounted || graphData.labels.length <= 2) return;
    const newData = {
      ...graphData,
      labels: graphData.labels.filter((_, i) => i !== index),
      datasets: graphData.datasets.map(dataset => ({
        ...dataset,
        dataPoints: dataset.dataPoints.filter((_, i) => i !== index)
      }))
    };
    setGraphData(newData);
  };

  const addDataset = () => {
    if (!mounted) return;
    const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    const newDataset = {
      id: Math.max(...graphData.datasets.map(d => d.id)) + 1,
      name: `Dataset ${graphData.datasets.length + 1}`,
      dataPoints: new Array(graphData.labels.length).fill(0).map(() => Math.floor(Math.random() * 80) + 20),
      color: colors[graphData.datasets.length % colors.length]
    };
    const newData = {
      ...graphData,
      datasets: [...graphData.datasets, newDataset]
    };
    setGraphData(newData);
  };

  const removeDataset = (datasetIndex) => {
    if (!mounted || graphData.datasets.length <= 1) return;
    const newData = {
      ...graphData,
      datasets: graphData.datasets.filter((_, i) => i !== datasetIndex)
    };
    setGraphData(newData);
  };

  const resetData = () => {
    setGraphData(defaultData);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!mounted) {
    return (
      <div className="w-80 h-full bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className=" pr-2 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200 ">
        <h2 className="text-lg font-semibold">Edit Line Chart</h2>
        <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><X size={16} /></button>
      </div>

      {/* Real-time Status */}
      {isRealTime && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-200">
          <div className="flex items-center space-x-2 text-sm text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live updates active</span>
          </div>
        </div>
      )}

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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'data' && (
          <div className="p-4">
            {/* Chart Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title</label>
              <input
                type="text"
                value={graphData.title}
                onChange={handleTitleChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter chart title"
              />
            </div>

            {/* Labels Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">X-Axis Labels</h3>
                <span className="text-xs text-gray-500">{graphData.labels.length} points</span>
              </div>

              <div className="space-y-2 mb-3">
                {graphData.labels.map((label, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => handleLabelChange(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder={`Label ${index + 1}`}
                    />
                    {graphData.labels.length > 2 && (
                      <button
                        onClick={() => removeDataPoint(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addDataPoint}
                className="w-full py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Point</span>
              </button>
            </div>

            {/* Datasets Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Datasets</h3>
                <button
                  onClick={addDataset}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Dataset</span>
                </button>
              </div>

              <div className="space-y-4">
                {graphData.datasets.map((dataset, datasetIndex) => (
                  <div key={dataset.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: dataset.color }}
                        ></div>
                        <input
                          type="text"
                          value={dataset.name}
                          onChange={(e) => handleDatasetNameChange(datasetIndex, e.target.value)}
                          className="font-medium text-sm bg-transparent border-none outline-none text-gray-700 min-w-0 flex-1"
                        />
                      </div>
                      {graphData.datasets.length > 1 && (
                        <button
                          onClick={() => removeDataset(datasetIndex)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {dataset.dataPoints.map((point, pointIndex) => (
                        <div key={pointIndex}>
                          <label className="block text-xs text-gray-500 mb-1">
                            {graphData.labels[pointIndex]}
                          </label>
                          <input
                            type="number"
                            value={point}
                            onChange={(e) => handleDataPointChange(datasetIndex, pointIndex, e.target.value)}
                            className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={dataset.color}
                          onChange={(e) => handleDatasetColorChange(datasetIndex, e.target.value)}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={dataset.color}
                          onChange={(e) => handleDatasetColorChange(datasetIndex, e.target.value)}
                          className="flex-1 p-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          placeholder="#4F46E5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-16 p-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Max</label>
                          <input
                            type="number"
                            value={graphData.yMax ?? 100}
                            onChange={e => setGraphData(prev => ({ ...prev, yMax: parseFloat(e.target.value) }))}
                            className="w-16 p-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Step Size</label>
                          <input
                            type="number"
                            value={graphData.yStep ?? 5}
                            onChange={e => setGraphData(prev => ({ ...prev, yStep: parseFloat(e.target.value) }))}
                            className="w-16 p-1 border border-gray-300 rounded text-sm"
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
                      className="w-full bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Line Style</label>
                    <select
                      value={graphData.lineStyle || 'solid'}
                      onChange={e => setGraphData(prev => ({ ...prev, lineStyle: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
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
                          className="p-1 border border-gray-300 rounded text-sm"
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
      {/* Save Button */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => {
            console.log('Saving graphData:', graphData);
            onUpdate && onUpdate(graphData)
            canvasEditor.renderAll();
          }}
          className="w-full py-2 px-3 bg-blue-50 border-2 border-indigo-300
    text-indigo-600 rounded-md
    text-sm font-medium
    transition-all duration-200
    hover:text-white hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default LineGraphSetting;
