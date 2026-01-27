'use client';
'use client';
import React, { memo, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function WaterfallChartWidget({
    title = 'Waterfall Chart',
    labels = [],
    dataPoints = [],
    initialValue = 0,
    showTitle = true,
    showXAxis = true,
    showYAxis = true,
    yAxisTitle = 'Value',
    yMin, yMax
}) {
    const { chartData, runningTotals } = useMemo(() => {
        if (labels.length === 0 || dataPoints.length === 0) {
            return {
                chartData: {
                    labels: ['No Data'],
                    datasets: [{
                        label: 'No Data',
                        data: [0],
                        backgroundColor: '#E5E7EB'
                    }]
                },
                runningTotals: [0]
            };
        }

        // Calculate running totals
        const totals = [initialValue];
        let currentTotal = initialValue;

        dataPoints.forEach(value => {
            currentTotal += value;
            totals.push(currentTotal);
        });

        // Create chart labels - ENSURE THESE ARE STRINGS ONLY
        const chartLabels = ['Start', ...labels, 'Total'];
        
        // Verify labels are strings (debug)
        console.log('Chart Labels (should be strings only):', chartLabels);

        // For waterfall, we'll create invisible base bars and visible change bars
        const invisibleBases = [];
        const visibleBars = [];
        const colors = [];

        // Start value
        invisibleBases.push(0);
        visibleBars.push(initialValue);
        colors.push(initialValue >= 0 ? '#10B981' : '#EF4444');

        // Change bars
        for (let i = 0; i < dataPoints.length; i++) {
            const change = dataPoints[i];
            const previousTotal = totals[i];

            if (change >= 0) {
                // Positive change: invisible base up to previous total
                invisibleBases.push(previousTotal);
                visibleBars.push(change);
                colors.push('#10B981');
            } else {
                // Negative change: invisible base up to new total (after decrease)
                invisibleBases.push(previousTotal + change);
                visibleBars.push(-change); // Make positive for display
                colors.push('#EF4444');
            }
        }

        // Final total
        invisibleBases.push(0);
        visibleBars.push(Math.abs(currentTotal));
        colors.push(currentTotal >= 0 ? '#10B981' : '#EF4444');

        console.log('Waterfall calculation:', {
            chartLabels, // Check this in console
            totals,
            invisibleBases,
            visibleBars,
            colors
        });

        return {
            chartData: {
                labels: chartLabels,
                datasets: [
                    {
                        label: 'Invisible Base',
                        data: invisibleBases,
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderColor: 'rgba(0,0,0,0)',
                        borderWidth: 0,
                        stack: 'waterfall',
                        barThickness: 40
                    },
                    {
                        label: 'Values',
                        data: visibleBars,
                        backgroundColor: colors,
                        borderColor: colors.map(color => color === '#10B981' ? '#059669' : '#DC2626'),
                        borderWidth: 1,
                        stack: 'waterfall',
                        barThickness: 40
                    }
                ]
            },
            runningTotals: totals
        };
    }, [labels, dataPoints, initialValue]);

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
                font: { size: 16, weight: 'bold' },
                padding: { top: 5, bottom: 5 }
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                filter: function (tooltipItem) {
                    return tooltipItem.datasetIndex === 1; // Only show tooltip for visible bars
                },
                callbacks: {
                    title: function (tooltipItems) {
                        return tooltipItems[0].label;
                    },
                    label: function (context) {
                        const dataIndex = context.dataIndex;

                        if (dataIndex === 0) {
                            return `Starting Value: ${initialValue}`;
                        } else if (dataIndex === chartData.labels.length - 1) {
                            const finalTotal = runningTotals[runningTotals.length - 1];
                            return `Final Total: ${finalTotal}`;
                        } else {
                            const change = dataPoints[dataIndex - 1];
                            const runningTotal = runningTotals[dataIndex];

                            return [
                                `Change: ${change >= 0 ? '+' : ''}${change}`,
                                `Running Total: ${runningTotal}`
                            ];
                        }
                    },
                    labelColor: function (context) {
                        return {
                            borderColor: context.dataset.borderColor[context.dataIndex],
                            backgroundColor: context.dataset.backgroundColor[context.dataIndex]
                        };
                    }
                }
            }
        },
        scales: {
            x: {
                display: showXAxis,
                stacked: true,
                type: 'category',
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 0,
                    // REMOVE THE CUSTOM CALLBACK - this might be causing the issue
                    // callback: function (value, index) {
                    //     return this.getLabelForValue(value);
                    // }
                }
            },
            y: {
                display: showYAxis,
                stacked: true,
                min: yMin,
                max: yMax,
                beginAtZero: false,
                title: {
                    display: !!yAxisTitle,
                    text: yAxisTitle
                },
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    callback: function (value) {
                        return typeof value === 'number' ? value.toLocaleString() : value;
                    }
                }
            }
        }
    };

    return (
        <div className="w-full h-full p-4 box-border">
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default memo(WaterfallChartWidget);
