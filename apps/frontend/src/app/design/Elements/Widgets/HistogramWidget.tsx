'use client';

import React, { memo, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register the required components
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ChartDataLabels);

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
    dataset = { name: 'Frequency', rawData: [], color: '#118DFF' },
    numberOfBins = 10,
    showTitle = true,
    showXAxis = true,
    xAxisTitle = 'Value Bins',
    showYAxis = true,
    yAxisTitle = 'Frequency',
    showXAxisTitle = false,
    showYAxisTitle = false,
    showDataLabels = false,
    yMin,
    yMax
}) {
    // useMemo recalculates the bins only when rawData or numberOfBins changes
    const { labels, counts } = useMemo(() => createHistogramData(dataset.rawData, numberOfBins), [dataset.rawData, numberOfBins]);

    const data = {
        labels: labels,
        datasets: [{
            label: dataset.name,
            data: counts,
            backgroundColor: dataset.color,
            borderColor: dataset.color,
            borderWidth: 1,
            borderRadius: 2
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: { 
                display: false 
            },
            title: {
                display: showTitle,
                text: title,
                font: { 
                    size: 16, 
                    weight: 'bold',
                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                },
                padding: { top: 8, bottom: 8 },
                align: 'start'
            },
            datalabels: {
                display: showDataLabels,
                anchor: 'end',
                align: 'top',
                formatter: (value) => value > 0 ? value : '',
                color: '#374151',
                font: {
                    weight: 'bold',
                    size: 10
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 13,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 12
                },
                callbacks: {
                    title: function(tooltipItems) {
                        return `Range: ${tooltipItems[0].label}`;
                    },
                    label: function(context) {
                        return `Frequency: ${context.parsed.y}`;
                    }
                }
            }
        },
        scales: {
            x: {
                display: showXAxis,
                title: { 
                    display: showXAxisTitle, 
                    text: xAxisTitle,
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                },
                // These two options make the bars touch, which is characteristic of a histogram
                barPercentage: 1.0,
                categoryPercentage: 1.0,
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 0,
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                display: showYAxis,
                title: { 
                    display: showYAxisTitle, 
                    text: yAxisTitle,
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                },
                beginAtZero: true,
                min: yMin,
                max: yMax,
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
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