'use client';
'use client';

import React, { memo } from 'react';
import { Doughnut } from 'react-chartjs-2'; // Use Doughnut component
import {
    Chart,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register the required components
Chart.register(
    ArcElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

function DonutChartWidget({ title, labels = [], datasets = [], showTitle = true }) {
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
        cutout: '50%', // This creates the "hole" in the middle, making it a donut chart
        layout: {
            padding: {
                bottom: 20, // Add padding to the bottom to ensure labels are not cut off
                top: 10
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'right',
            },
            title: {
                display: showTitle,
                text: title,
                font: { size: 16 },
                padding: { top: 10, bottom: 20 },
                align: 'start'
            },
            datalabels: {
                anchor: 'end',
                align: 'end',
                offset: 8,
                color: '#333',
                textAlign: 'center',
                font: {
                    weight: 'bold',
                    size: 11,
                },
                formatter: (value, context) => {
                    const total = context.chart.data.datasets[0].data.reduce((sum, data) => sum + data, 0);
                    const percentage = ((value / total) * 100).toFixed(0) + '%';
                    return percentage;
                },
            },
        }
    };

    return (
        <div className="w-full h-full p-4 box-border">
            <Doughnut data={data} options={options} />
        </div>
    );
}

export default memo(DonutChartWidget);
