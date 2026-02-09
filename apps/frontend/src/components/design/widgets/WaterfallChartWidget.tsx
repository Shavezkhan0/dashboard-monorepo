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
    valueFormat = 'default', // default, currency, percentage, compact
    showDataLabels = false,
    positiveColor = '#10B981',
    negativeColor = '#EF4444',
    totalColor = '#3B82F6',
    yMin, yMax
}) {
    // Format value based on valueFormat prop
    const formatValue = (val) => {
        const roundedVal = Math.round(val * 100) / 100;
        
        if (valueFormat === 'currency') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(roundedVal);
        } else if (valueFormat === 'percentage') {
            return `${roundedVal.toFixed(1)}%`;
        } else if (valueFormat === 'compact') {
            if (roundedVal >= 1000000) {
                return `${(roundedVal / 1000000).toFixed(1)}M`;
            } else if (roundedVal >= 1000) {
                return `${(roundedVal / 1000).toFixed(1)}K`;
            }
            return roundedVal.toString();
        }
        return roundedVal % 1 === 0 ? roundedVal.toString() : roundedVal.toFixed(2);
    };

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
        colors.push(totalColor);

        // Change bars
        for (let i = 0; i < dataPoints.length; i++) {
            const change = dataPoints[i];
            const previousTotal = totals[i];

            if (change >= 0) {
                // Positive change: invisible base up to previous total
                invisibleBases.push(previousTotal);
                visibleBars.push(change);
                colors.push(positiveColor);
            } else {
                // Negative change: invisible base up to new total (after decrease)
                invisibleBases.push(previousTotal + change);
                visibleBars.push(-change); // Make positive for display
                colors.push(negativeColor);
            }
        }

        // Final total
        invisibleBases.push(0);
        visibleBars.push(Math.abs(currentTotal));
        colors.push(totalColor);

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
                        barThickness: 40,
                        datalabels: { display: false }
                    },
                    {
                        label: 'Values',
                        data: visibleBars,
                        backgroundColor: colors,
                        borderColor: colors,
                        borderWidth: 2,
                        stack: 'waterfall',
                        barThickness: 40
                    }
                ]
            },
            runningTotals: totals
        };
    }, [labels, dataPoints, initialValue, positiveColor, negativeColor, totalColor]);

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
                font: { size: 16, weight: 'bold', family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
                padding: { top: 8, bottom: 8 },
                align: 'start'
            },
            datalabels: {
                display: showDataLabels,
                anchor: 'end',
                align: 'top',
                formatter: function(value, context) {
                    if (context.datasetIndex === 0) return ''; // Don't show for invisible base
                    if (context.dataIndex === 0) return formatValue(initialValue);
                    if (context.dataIndex === chartData.labels.length - 1) {
                        return formatValue(runningTotals[runningTotals.length - 1]);
                    }
                    const change = dataPoints[context.dataIndex - 1];
                    return formatValue(change);
                },
                color: '#374151',
                font: {
                    weight: 'bold',
                    size: 10
                }
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 13,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 12
                },
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
                            return `Starting Value: ${formatValue(initialValue)}`;
                        } else if (dataIndex === chartData.labels.length - 1) {
                            const finalTotal = runningTotals[runningTotals.length - 1];
                            return `Final Total: ${formatValue(finalTotal)}`;
                        } else {
                            const change = dataPoints[dataIndex - 1];
                            const runningTotal = runningTotals[dataIndex];

                            return [
                                `Change: ${change >= 0 ? '+' : ''}${formatValue(change)}`,
                                `Running Total: ${formatValue(runningTotal)}`
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
                    text: yAxisTitle,
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                },
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    callback: function (value) {
                        return typeof value === 'number' ? formatValue(value) : value;
                    },
                    font: {
                        size: 11
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