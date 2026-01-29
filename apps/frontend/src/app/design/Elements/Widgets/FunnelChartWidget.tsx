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
    showLegend = false,
    showValues = false,
    funnelStyle = 'classic',
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
        indexAxis: funnelStyle === 'bar' ? 'x' : 'y', // Dynamic axis based on style
        plugins: {
            legend: {
                display: showLegend,
                position: 'right',
                align: 'start',
                labels: {
                    boxWidth: 14,
                    boxHeight: 14,
                    padding: 10,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 12,
                        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        weight: '500'
                    }
                }
            },
            title: {
                display: showTitle,
                text: title,
                font: { size: 16 },
                padding: { top: 5, bottom: 5 }
            },
            datalabels: {
                display: showValues,
                color: '#FFFFFF',
                font: {
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