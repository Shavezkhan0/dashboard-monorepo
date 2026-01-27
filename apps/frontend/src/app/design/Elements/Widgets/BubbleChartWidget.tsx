'use client';
'use client';
import React, { memo } from 'react';
import { Bubble } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';

// Register the necessary components for a Bubble Chart
ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

function BubbleChartWidget({
    title = 'Bubble Chart',
    datasets = [],
    showTitle = true,
    showXAxis = true,
    showYAxis = true,
    xAxisTitle = 'X-Axis',
    yAxisTitle = 'Y-Axis',
    xMin, xMax,
    yMin, yMax,
}) {
    const data = {
        datasets: datasets.map(ds => ({
            label: ds.name,
            data: ds.data, // Expects an array of {x: number, y: number, r: number}
            backgroundColor: ds.color,
            borderColor: '#FFFFFF',
            borderWidth: 2,
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
                padding: { top: 0, bottom: 0 },
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label || '';
                        const x = context.raw.x;
                        const y = context.raw.y;
                        const r = context.raw.r;
                        return [`${label}`, `X: ${x}`, `Y: ${y}`, `Radius: ${r}`];
                    }
                }
            },
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                display: showXAxis,
                min: xMin,
                max: xMax,
                title: { display: true, text: xAxisTitle },
            },
            y: {
                type: 'linear',
                display: showYAxis,
                min: yMin,
                max: yMax,
                title: { display: true, text: yAxisTitle },
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

