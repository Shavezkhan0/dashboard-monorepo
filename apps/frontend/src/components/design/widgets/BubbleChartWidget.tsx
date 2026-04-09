'use client';

import React, { memo, useMemo } from 'react';
import { Bubble } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function BubbleChartWidget({
    title = 'Bubble Chart',
    datasets = [], // Expects dataPoints in [{x: val, y: val, r: val}] format
    showTitle = true,
    showXAxis = true,
    showXAxisTitle = false,
    xAxisTitle = 'X-Axis',
    showYAxis = true,
    showYAxisTitle = false,
    yAxisTitle = 'Y-Axis',
    showLegend = false, // Added
    showValues = false, // Added
    yMin,
    yMax,
    xMin,
    xMax,
}) {
    const data = {
        datasets: datasets.map(ds => ({
            label: ds.name,
            data: ds.dataPoints || ds.data, // Support both formats
            backgroundColor: ds.color,
            borderColor: '#FFFFFF',
            borderWidth: 2,
        }))
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                display: showLegend,
                position: 'top',
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
            tooltip: { 
                enabled: true,
                callbacks: {
                    label: function(context) {
                        if (showValues) {
                            const label = context.dataset.label || '';
                            const x = context.raw.x;
                            const y = context.raw.y;
                            const r = context.raw.r;
                            return [`${label}: (${x}, ${y}, r:${r})`];
                        }
                        const label = context.dataset.label || '';
                        const x = context.raw.x;
                        const y = context.raw.y;
                        const r = context.raw.r;
                        return [`${label}`, `X: ${x}`, `Y: ${y}`, `Radius: ${r}`];
                    }
                }
            },
            datalabels: {
                display: showValues,
                color: '#000000',
                font: {
                    size: 10,
                    weight: 'bold'
                },
                formatter: (value, context) => {
                    return `(${value.x}, ${value.y})`;
                }
            }
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                display: showXAxis,
                min: xMin,
                max: xMax,
                title: { display: showXAxisTitle, text: xAxisTitle },
            },
            y: {
                display: showYAxis,
                min: yMin,
                max: yMax,
                title: { display: showYAxisTitle, text: yAxisTitle },
            },
        },
    };

    return (
        <div className="w-full h-full p-4 box-border">
            <Bubble data={data} options={options} />
        </div>
    );
}

export default memo(BubbleChartWidget);
