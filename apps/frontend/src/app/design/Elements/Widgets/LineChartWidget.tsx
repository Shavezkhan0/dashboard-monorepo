import React, { memo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function LineChartWidget({
    // Main properties
    title = 'Sample Line Chart',
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets = [
        { 
            id: 1, 
            name: 'Dataset 1', 
            dataPoints: [12, 19, 3, 5, 2, 3], 
            color: '#4F46E5' 
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
    strokeWidth = 2,
    lineStyle = 'solid',
    showMarkers = true,
    markerStyle = 'circle',
    markerSize = 6,
    showLegend = false, // Default to false - data shown on hover only
}) {
    // Helper to convert line style string to Chart.js borderDash array
    const getBorderDash = (style) => {
        switch (style) {
            case 'dashed':
                return [5, 5];
            case 'dotted':
                return [1, 3];
            case 'solid':
            default:
                return [];
        }
    };

    // Calculate min/max if not provided
    const calculateRange = () => {
        if (datasets.length === 0) return { min: 0, max: 100 };
        
        const allValues = datasets.flatMap(ds => ds.dataPoints || []);
        if (allValues.length === 0) return { min: 0, max: 100 };
        
        const dataMin = Math.min(...allValues);
        const dataMax = Math.max(...allValues);
        
        // Add some padding
        const padding = (dataMax - dataMin) * 0.1;
        const calculatedMin = Math.max(0, dataMin - padding);
        const calculatedMax = dataMax + padding;
        
        return {
            min: yMin !== undefined ? yMin : Math.floor(calculatedMin),
            max: yMax !== undefined ? yMax : Math.ceil(calculatedMax)
        };
    };

    const range = calculateRange();

    // Prepare the data structure for Chart.js
    const data = {
        labels: labels,
        datasets: datasets.map((ds, index) => ({
            label: ds.name || `Dataset ${index + 1}`,
            data: ds.dataPoints || [],
            borderColor: ds.color || `hsl(${index * 137.508}, 50%, 50%)`,
            backgroundColor: ds.color || `hsl(${index * 137.508}, 50%, 50%)`,
            borderWidth: strokeWidth,
            borderDash: getBorderDash(lineStyle),
            fill: false,
            tension: 0.1,
            pointStyle: markerStyle,
            pointRadius: showMarkers ? markerSize / 2 : 0,
            pointHoverRadius: showMarkers ? (markerSize / 2) + 2 : 0,
            pointBackgroundColor: ds.color || `hsl(${index * 137.508}, 50%, 50%)`,
            pointBorderColor: ds.color || `hsl(${index * 137.508}, 50%, 50%)`,
        }))
    };

    // Prepare the options structure for Chart.js
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: true, // Changed to true - only show data for the line being hovered
            mode: 'point', // Changed back to 'point' - only show single point data
        },
        plugins: {
            legend: {
                display: showLegend, // Controlled entirely by showLegend prop
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 11
                    }
                }
            },
            title: {
                display: showTitle,
                text: title,
                font: { 
                    size: 16,
                    weight: 'bold'
                },
                padding: { top: 10, bottom: 20 }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                displayColors: true, // Show colored squares in tooltip
                mode: 'point', // Only show tooltip for the specific point being hovered
                intersect: true, // Only trigger tooltip when directly over a point/line
                filter: function(tooltipItem) {
                    // Limit tooltip items to prevent performance issues
                    return tooltipItem.datasetIndex < 10;
                },
                callbacks: {
                    // Custom label format to show dataset name and value
                    label: function(context) {
                        const datasetLabel = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${datasetLabel}: ${value}`;
                    }
                }
            },
            datalabels:{
                display: false
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
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    maxTicksLimit: 10 // Limit number of ticks for performance
                }
            },
            y: {
                display: showYAxis,
                min: range.min,
                max: range.max,
                ticks: {
                    stepSize: yStep,
                    font: {
                        size: 11
                    },
                    maxTicksLimit: 8 // Limit number of ticks for performance
                },
                title: {
                    display: showYAxisTitle,
                    text: yAxisTitle,
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                },
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)',
                },
            },
        },
        elements: {
            line: {
                borderCapStyle: 'round',
                borderJoinStyle: 'round',
            },
            point: {
                hoverBorderWidth: 2,
            }
        },
        // Add performance optimizations
        animation: {
            duration: datasets.length > 5 ? 0 : 750, // Disable animation for complex charts
        },
        parsing: {
            xAxisKey: false,
            yAxisKey: false
        }
    };

    return (
        <div className="w-full h-full min-h-[200px] p-4 bg-white rounded-lg">
            <Line data={data} options={options} />
        </div>
    );
}

export default memo(LineChartWidget);