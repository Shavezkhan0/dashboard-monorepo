'use client';
'use client';

import React, { memo, useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function ScatterChartWidget({
    title = 'Scatter Plot',
    datasets = [], // Expects dataPoints in [{x: val, y: val}] format
    showTitle = true,
    showXAxis = true,
    showXAxisTitle = false,
    xAxisTitle = 'X-Axis',
    showYAxis = true,
    showYAxisTitle = false,
    yAxisTitle = 'Y-Axis',
    yMin,
    yMax,
    xMin,
    xMax,
    markerSize = 8,
}) {
    const data = {
        datasets: datasets.map(ds => ({
            label: ds.name,
            data: ds.dataPoints,
            backgroundColor: ds.color,
            pointRadius: markerSize / 2,
            pointHoverRadius: (markerSize / 2) + 2,
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
                display: false
            }
            // toolbar:{
            //     enabled:true
            // }
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
            <Scatter data={data} options={options} />
        </div>
    );
}

export default memo(ScatterChartWidget);
