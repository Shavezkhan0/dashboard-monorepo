'use client';
'use client';

import React, { memo } from 'react';
import { Line } from 'react-chartjs-2'; // Area charts are a type of Line chart in Chart.js
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    Filler // <-- Required for filling the area
} from 'chart.js';

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    Filler // <-- Register the Filler plugin
);

function AreaChartWidget({
    title = 'Chart Title',
    labels = [],
    datasets = [],
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
    showMarkers = true,
    markerSize = 6
}) {
    const data = {
        labels: labels,
        datasets: datasets.map(ds => ({
            label: ds.name,
            data: ds.dataPoints,
            borderColor: ds.color,
            // Use a semi-transparent version of the color for the fill
            backgroundColor: ds.color + '4D', // '4D' is ~30% opacity in hex
            borderWidth: strokeWidth,
            fill: true, // <-- This is the key property for area charts
            tension: 0.4,
            pointRadius: showMarkers ? markerSize / 2 : 0,
            pointHoverRadius: showMarkers ? (markerSize / 2) + 2 : 0,
        }))
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: showTitle,
                text: title,
                font: { size: 16 },
                padding: { top: 5, bottom: 5 }
            },
            tooltip: { enabled: true },
            datalabels: {
                display: false // This will hide the data point values
            }
        },
        scales: {
            x: {
                display: showXAxis,
                title: { display: showXAxisTitle, text: xAxisTitle },
            },
            y: {
                display: showYAxis,
                min: yMin,
                max: yMax,
                ticks: { stepSize: yStep },
                title: { display: showYAxisTitle, text: yAxisTitle },
            },
        },
    };

    return (
        <div className="w-full h-full p-4 box-border">
            <Line data={data} options={options} />
        </div>
    );
}

export default memo(AreaChartWidget);
