'use client';
'use client';

import React, { memo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register the required components for a Bar Chart
Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
);

function BarChartWidget({
    // Main properties
    title = 'Chart Title',
    labels = [],
    datasets = [],
    // Customization properties with defaults (now matching LineChartWidget)
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
    borderWidth = 1 // Added for consistency
}) {
    const data = {
        labels: labels,
        datasets: datasets.map(ds => ({
            label: ds.name,
            data: ds.dataPoints,
            backgroundColor: ds.color,
            borderColor: ds.color, // Use the same color for the border
            borderWidth: borderWidth,
            borderRadius: 4, // Adds a nice rounded corner to the bars
        }))
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: showTitle,
                text: title,
                font: { size: 16 },
                padding: { top: 5, bottom: 5 }
            },
            // Added tooltip config for consistency
            tooltip: {
                enabled: false,
            },
            datalabels: { display: false  // Disable data labels by default
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
            <Bar data={data} options={options} />
        </div>
    );
}

export default memo(BarChartWidget);
