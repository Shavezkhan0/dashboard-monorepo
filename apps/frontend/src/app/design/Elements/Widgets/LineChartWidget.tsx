'use client';
// src/app/design/Elements/Widgets/LineChartWidget.jsx
'use client';

import React, { memo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    Tooltip,
    Legend
} from 'chart.js';

// Register all the necessary components for Chart.js
Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    Tooltip,
    Legend
);

/**
 * Renders an interactive line chart based on props from the settings panel.
 * @param {object} props - The configuration for the chart.
 */
function LineChartWidget({
    // Main properties
    title = 'Chart Title',
    labels = [],
    datasets = [],
    // Customization properties with defaults
    showTitle = true,
    showXAxis = true,
    showXAxisTitle = false,
    xAxisTitle = 'X-Axis',
    showYAxis = true,
    showYAxisTitle = false,
    yAxisTitle = 'Y-Axis',
    yMin = 0,
    yMax = 100,
    yStep = 10,
    strokeWidth = 2,
    lineStyle = 'solid',
    showMarkers = true,
    markerStyle = 'circle',
    markerSize = 6
}) {

    // Helper to convert line style string to Chart.js borderDash array
    const getBorderDash = (style) => {
        switch (style) {
            case 'dashed':
                return [5, 5]; // [line length, space length]
            case 'dotted':
                return [1, 3];
            case 'solid':
            default:
                return []; // An empty array means a solid line
        }
    };

    // Prepare the data structure for Chart.js
    const data = {
        labels: labels,
        datasets: datasets.map(ds => ({
            label: ds.name,
            data: ds.dataPoints,
            borderColor: ds.color,
            backgroundColor: ds.color,
            borderWidth: strokeWidth,
            borderDash: getBorderDash(lineStyle),
            fill: false,
            tension: 0.4,
            // Marker / Point properties
            pointStyle: markerStyle,
            pointRadius: showMarkers ? markerSize / 2 : 0, // Set radius to 0 to hide markers
            pointHoverRadius: showMarkers ? (markerSize / 2) + 2 : 0,
        }))
    };

    // Prepare the options structure for Chart.js
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true, // You can make this a prop too if needed
                position: 'top',
            },
            title: {
                display: showTitle,
                text: title,
                font: { size: 16 },
                padding: { top: 5, bottom: 5 }
            },
            tooltip: {
                enabled: true,
            },
            datalabels: {
                display: false // This will hide the data point values
            }
        },
        scales: {
            x: {
                display: showXAxis,
                title: {
                    display: showXAxisTitle,
                    text: xAxisTitle,
                },
            },
            y: {
                display: showYAxis,
                min: yMin,
                max: yMax,
                ticks: {
                    stepSize: yStep,
                },
                title: {
                    display: showYAxisTitle,
                    text: yAxisTitle,
                },
            },
        },
    };

    return (
        <div className="w-full h-full p-4 box-border">
            <Line data={data} options={options} />
        </div>
    );
}

export default memo(LineChartWidget);
