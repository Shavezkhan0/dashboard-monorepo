'use client';
'use client';

import React, { memo } from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
// 1. Import the new datalabels plugin
import ChartDataLabels from 'chartjs-plugin-datalabels';

// 2. Register the plugin with Chart.js
Chart.register(
    ArcElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels // <-- Register it here
);

function PieChartWidget({ title, labels = [], datasets = [], showTitle = true }) {
    const data = {
        labels: labels,
        datasets: datasets.map(ds => ({
            data: ds.dataPoints,
            backgroundColor: ds.colors,
            borderColor: '#ffffff',
            borderWidth: 2,
        }))
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                bottom: 20 // Keep bottom padding for the datalabels
            }
        },
        plugins: {
            // Re-enable the legend and move it to the right
            legend: {
                display: true,
                position: 'right',
            },
            title: {
                display: showTitle,
                text: title,
                font: { size: 16 },
                padding: { top: 10, bottom: 20 },
                align: 'start' // Align title to the left
            },
            // Configure the datalabels plugin to show only percentages outside
            datalabels: {
                anchor: 'end',
                align: 'end',
                offset: 8,
                color: '#333', // Label text color
                textAlign: 'center',
                font: {
                    weight: 'bold',
                    size: 11,
                },
                // This function formats the text to show only the percentage
                formatter: (value, context) => {
                    // Get the total of all values
                    const total = context.chart.data.datasets[0].data.reduce((sum, data) => sum + data, 0);
                    // Calculate and return only the percentage
                    const percentage = ((value / total) * 100).toFixed(0) + '%';
                    return percentage;
                },
            },
        }
    };

    return (
        <div className="w-full h-full p-4 box-border">
            <Pie data={data} options={options} />
        </div>
    );
}

export default memo(PieChartWidget);
