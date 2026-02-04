import React, { memo, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '@/contexts/ThemeContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function BarChartWidget({
    // Main properties
    title = 'Sample Bar Chart',
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets = [
        { 
            id: 1, 
            name: 'Dataset 1', 
            dataPoints: [12, 19, 3, 5, 2, 3], 
            color: '#3B82F6' 
        },
        { 
            id: 2, 
            name: 'Dataset 2', 
            dataPoints: [2, 3, 20, 5, 1, 4], 
            color: '#10B981' 
        }
    ],
    // Customization properties with defaults
    showTitle = true,
    showXAxis = true,
    showXAxisTitle = false,
    xAxisTitle = 'X-Axis',
    showYAxis = true,
    showYAxisTitle = false,
    yAxisTitle = 'Y-Axis',
    yMin,
    yMax,
    yStep = 5,
    borderWidth = 0,
    barStyle = 'grouped',
    showLegend = false,
    borderRadius = 2,
    barThickness = 'flex',
    categoryGap = 0.4,
    barGap = 0.1,
}) {
    const { resolvedTheme } = useTheme();
    
    // Theme-aware colors
    const getThemeColors = () => ({
        gridColor: resolvedTheme === 'dark' ? '#374151' : '#e5e7eb',
        textColor: resolvedTheme === 'dark' ? '#f3f4f6' : '#374151',
        axisColor: resolvedTheme === 'dark' ? '#6b7280' : '#6b7280',
        titleColor: resolvedTheme === 'dark' ? '#f3f4f6' : '#111827',
        legendColor: resolvedTheme === 'dark' ? '#f3f4f6' : '#666'
    });
    
    // State for client-side only rendering to avoid hydration issues
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Don't render chart until we're on the client side
    if (!isClient) {
        return (
            <div className="w-full h-full min-h-[300px] p-6 bg-white rounded-lg shadow-sm flex items-center justify-center" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
                <div className="text-gray-500">Loading chart...</div>
            </div>
        );
    }

    // Calculate min/max if not provided
    const calculateRange = () => {
        if (datasets.length === 0) return { min: 0, max: 100 };
        
        const allValues = datasets.flatMap(ds => ds.dataPoints || []);
        if (allValues.length === 0) return { min: 0, max: 100 };
        
        const dataMin = Math.min(...allValues);
        const dataMax = Math.max(...allValues);
        
        // Add some padding (Power BI style)
        const padding = (dataMax - dataMin) * 0.1;
        const calculatedMin = dataMin >= 0 ? 0 : Math.floor(dataMin - padding);
        const calculatedMax = dataMax + padding;
        
        return {
            min: yMin !== undefined ? yMin : Math.floor(calculatedMin),
            max: yMax !== undefined ? yMax : Math.ceil(calculatedMax)
        };
    };

    const range = calculateRange();

    // Power BI color palette
    const powerBIColors = [
        '#118DFF', '#12239E', '#E66C37', '#6B007B', '#E044A7', 
        '#744EC2', '#D9B300', '#D64550', '#197278', '#1AAA55', 
        '#FFA800', '#00BCF2'
    ];

    // Prepare the data structure for Chart.js (Power BI style)
    const data = {
        labels: labels,
        datasets: datasets.map((ds, index) => ({
            label: ds.name || `Dataset ${index + 1}`,
            data: ds.dataPoints || [],
            backgroundColor: ds.color || powerBIColors[index % powerBIColors.length],
            borderColor: 'transparent',
            borderWidth: borderWidth,
            borderRadius: borderRadius,
            borderSkipped: false,
            categoryPercentage: 1 - categoryGap,
            barPercentage: 1 - barGap,
        }))
    };

    // Prepare the options structure for Chart.js (Power BI style)
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0
        },
        interaction: {
            intersect: false,
            mode: 'index', 
        },
        plugins: {
            legend: {
                display: showLegend,
                position: 'bottom',
                align: 'start',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'rect',
                    padding: 20,
                    font: {
                        size: 12,
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    },
                    color: getThemeColors().legendColor,
                    generateLabels: function(chart) {
                        const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
                        const labels = original.call(this, chart);
                        
                        labels.forEach(label => {
                            label.pointStyle = 'rect';
                            label.borderRadius = 2;
                        });
                        
                        return labels;
                    }
                },
                onClick: function(e, legendItem, legend) {
                    const index = legendItem.datasetIndex;
                    const chart = legend.chart;
                    
                    if (chart.isDatasetVisible(index)) {
                        chart.hide(index);
                        legendItem.hidden = true;
                    } else {
                        chart.show(index);
                        legendItem.hidden = false;
                    }
                    
                    chart.update('none');
                }
            },
            title: {
                display: showTitle,
                text: title,
                font: { 
                    size: 16,
                    weight: '600',
                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                },
                color: '#333',
                align: 'start',
                padding: { top: 0, bottom: 20 }
            },
            tooltip: {
                enabled: true,
                mode: 'point', // Only show the hovered segment
                intersect: true, // Only trigger when directly over a segment
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                titleFont: {
                    size: 13,
                    weight: '600'
                },
                bodyColor: 'white',
                bodyFont: {
                    size: 12
                },
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 4,
                displayColors: true,
                caretPadding: 6,
                padding: 8,
                filter: function(tooltipItem) {
                    // Only show tooltip for the specific item being hovered
                    return true;
                },
                callbacks: {
                    // Customize what shows in the tooltip
                    title: function(context) {
                        return context[0].label; // Show category name
                    },
                    label: function(context) {
                        const datasetLabel = context.dataset.label;
                        const value = context.parsed.y;
                        return `${datasetLabel}: ${value}`;
                    }
                }
            },
            datalabels: {
                display: false
            }
        },
        scales: {
            x: {
                display: showXAxis,
                stacked: true, // Enable stacking for Power BI look
                title: {
                    display: showXAxisTitle,
                    text: xAxisTitle,
                    font: {
                        size: 12,
                        weight: '600',
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    },
                    color: '#666'
                },
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 11,
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    },
                    color: '#666',
                    maxRotation: 0,
                    padding: 8
                },
                border: {
                    display: false
                }
            },
            y: {
                display: showYAxis,
                stacked: true, // Enable stacking for Power BI look
                min: range.min,
                max: range.max,
                ticks: {
                    stepSize: yStep,
                    font: {
                        size: 11,
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    },
                    color: getThemeColors().legendColor,
                    padding: 8,
                    callback: function(value) {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        }
                        if (value >= 1000) {
                            return (value / 1000).toFixed(1) + 'K';
                        }
                        return value;
                    }
                },
                title: {
                    display: showYAxisTitle,
                    text: yAxisTitle,
                    font: {
                        size: 12,
                        weight: '600',
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    },
                    color: '#666'
                },
                grid: {
                    display: true,
                    color: getThemeColors().gridColor,
                    lineWidth: 1,
                    drawBorder: false
                },
                border: {
                    display: false
                }
            },
        },
        elements: {
            bar: {
                borderCapStyle: 'round',
                borderJoinStyle: 'round',
            }
        },
        layout: {
            padding: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }
        }
    };

    return (
        <div className="w-full h-full min-h-[200px] p-4 bg-white dark:bg-gray-800 rounded-lg">
            <Bar data={data} options={options} />
        </div>
    );
}

export default memo(BarChartWidget);