'use client';
'use client';

import React, { memo, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

// Register the required components
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

// This helper function takes raw data and groups it into bins
const createHistogramData = (rawData = [], binCount = 5) => {
    if (rawData.length === 0) {
        return { labels: [], counts: [] };
    }

    const min = Math.min(...rawData);
    const max = Math.max(...rawData);
    const binWidth = (max - min) / binCount;
    
    // Ensure binWidth is not zero
    if (binWidth === 0) {
        return { labels: [`${min}`], counts: [rawData.length] };
    }

    const bins = new Array(binCount).fill(0);
    const labels = new Array(binCount);

    for (let i = 0; i < binCount; i++) {
        const binStart = min + i * binWidth;
        const binEnd = binStart + binWidth;
        labels[i] = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
    }

    for (const value of rawData) {
        let binIndex = Math.floor((value - min) / binWidth);
        // Special case for the max value to fall into the last bin
        if (value === max) {
            binIndex = binCount - 1;
        }
        if (binIndex >= 0 && binIndex < binCount) {
            bins[binIndex]++;
        }
    }

    return { labels, counts: bins };
};

function HistogramWidget({
    title = 'Histogram',
    dataset = { name: 'Frequency', rawData: [], color: '#112DCFFF' },
    numberOfBins = 10,
    showTitle = true,
    showXAxis = true,
    xAxisTitle = 'Value Bins',
    showYAxis = true,
    yAxisTitle = 'Frequency',
    showXAxisTitle = false,
    showYAxisTitle = false,
}) {
    // useMemo recalculates the bins only when rawData or numberOfBins changes
    const { labels, counts } = useMemo(() => createHistogramData(dataset.rawData, numberOfBins), [dataset.rawData, numberOfBins]);

    const data = {
        labels: labels,
        datasets: [{
            label: dataset.name,
            data: counts,
            backgroundColor: dataset.color,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: showTitle,
                text: title,
                font: { size: 16 },
                padding: { top: 5, bottom: 5 }
            }
        },
        scales: {
            x: {
                display: showXAxis,
                title: { display: showXAxisTitle, text: xAxisTitle },
                // These two options make the bars touch, which is characteristic of a histogram
                barPercentage: 1.0,
                categoryPercentage: 1.0,
            },
            y: {
                display: showYAxis,
                title: { display: showYAxisTitle, text: yAxisTitle },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="w-full h-full p-4 box-border">
            <Bar data={data} options={options} />
        </div>
    );
}

export default memo(HistogramWidget);
