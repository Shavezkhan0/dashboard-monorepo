'use client';
'use client';

import React, { memo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { FunnelController, TrapezoidElement } from 'chartjs-chart-funnel';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register all necessary components for Chart.js
ChartJS.register(
    FunnelController,
    TrapezoidElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

function FunnelChartWidget({
    title = 'Funnel Chart',
    labels = [],
    datasets = [],
    showTitle = true,
}) {
    const data = {
        labels: labels,
        datasets: datasets.map(ds => ({
            label: ds.name,
            data: ds.dataPoints,
            backgroundColor: ds.colors,
            borderColor: '#FFFFFF',
            borderWidth: 2,
        }))
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Keep this for the classic funnel shape
        plugins: {
            legend: {
                display: false // Typically hidden for funnels
            },
            title: {
                display: showTitle,
                text: title,
                font: { size: 16 },
                padding: { top: 5, bottom: 5 }
            },
            datalabels: {
                color: '#FFFFFF',
                font: {
                    // weight: 'semibold',
                    size: 10
                },
                formatter: (value, context) => {
                    const label = context.chart.data.labels[context.dataIndex];
                    return `${label}\n${value}`;
                },
            }
        },
        scales: {
             x: { display: false },
             y: { display: false },
        },
    };

    return (
        <div className="w-full h-full p-4 box-border">
            <Chart type='funnel' data={data} options={options} />
        </div>
    );
}

export default memo(FunnelChartWidget);
