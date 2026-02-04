'use client';
import React, { memo, useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

Chart.register(
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Helper function to format numbers like Power BI
const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return parseFloat(num.toFixed(2));
};

// Improved plugin with collision detection and better label positioning
const externalLabelsPlugin = {
    id: 'externalLabelsDonut',
    afterDraw: (chart) => {
        const ctx = chart.ctx;
        const data = chart.data;
        const datasets = data.datasets;
        
        if (!datasets || !datasets[0] || !datasets[0].data) return;
        
        // Check if showValues is enabled
        const showValues = chart.options.plugins?.showValues !== false;
        if (!showValues) return;
        
        // Only show labels for visible segments
        const visibleData = datasets[0].data.filter((value, index) => 
            chart.getDataVisibility(index) !== false
        );
        
        const total = visibleData.reduce((sum, value) => sum + value, 0);
        const chartArea = chart.chartArea;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        
        // Collect label positions to avoid overlaps
        const labelPositions = [];
        
        chart.getDatasetMeta(0).data.forEach((element, index) => {
            // Skip if data point is hidden
            if (chart.getDataVisibility(index) === false) return;
            
            const value = datasets[0].data[index];
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            
            // Only show labels for segments > 2% to reduce clutter
            if (parseFloat(percentage) > 2) {
                const angle = element.startAngle + (element.endAngle - element.startAngle) / 2;
                const baseRadius = element.outerRadius + 40; // Base distance from chart
                
                // Calculate initial position
                const x = centerX + Math.cos(angle) * baseRadius;
                const y = centerY + Math.sin(angle) * baseRadius;
                
                labelPositions.push({
                    x,
                    y,
                    angle,
                    label: data.labels[index],
                    percentage,
                    value,
                    element,
                    index
                });
            }
        });
        
        // Sort positions by angle to handle overlaps systematically
        labelPositions.sort((a, b) => a.angle - b.angle);
        
        // Adjust overlapping positions
        const minDistance = 25; // Minimum distance between labels
        for (let i = 0; i < labelPositions.length; i++) {
            for (let j = i + 1; j < labelPositions.length; j++) {
                const pos1 = labelPositions[i];
                const pos2 = labelPositions[j];
                
                const distance = Math.sqrt(
                    Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
                );
                
                if (distance < minDistance) {
                    // Move the second label further out
                    const adjustedRadius = pos2.element.outerRadius + 60;
                    pos2.x = centerX + Math.cos(pos2.angle) * adjustedRadius;
                    pos2.y = centerY + Math.sin(pos2.angle) * adjustedRadius;
                }
            }
        }
        
        // Draw labels with improved positioning
        labelPositions.forEach(pos => {
            const { x, y, angle, label, percentage, element } = pos;
            
            // Draw connecting line
            const lineStartRadius = element.outerRadius + 5;
            const lineStartX = centerX + Math.cos(angle) * lineStartRadius;
            const lineStartY = centerY + Math.sin(angle) * lineStartRadius;
            
            ctx.save();
            ctx.strokeStyle = '#666666';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(lineStartX, lineStartY);
            ctx.lineTo(x - (x > centerX ? 20 : -20), y);
            ctx.stroke();
            
            // Draw horizontal line
            ctx.beginPath();
            ctx.moveTo(x - (x > centerX ? 20 : -20), y);
            ctx.lineTo(x - (x > centerX ? 8 : -8), y);
            ctx.stroke();
            
            // Draw background for better text visibility
            const text = `${label}: ${percentage}%`;
            ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = '#333333';
            ctx.textAlign = x > centerX ? 'left' : 'right';
            ctx.textBaseline = 'middle';
            
            // Add subtle background for better readability
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            const textHeight = 16;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(
                x > centerX ? x - 2 : x - textWidth - 2,
                y - textHeight / 2,
                textWidth + 4,
                textHeight
            );
            
            // Draw text
            ctx.fillStyle = '#333333';
            ctx.fillText(text, x, y);
            
            ctx.restore();
        });
    }
};

Chart.register(externalLabelsPlugin);

function DonutChartWidget({ 
    title, 
    labels = [], 
    datasets = [], 
    showTitle = true, 
    showLegend = false,
    showValues = true,
    innerRadius = 50,
    showExternalLabels = true,
    cutout = '50%' // Default donut hole size, can be customized
}) {
    const [chartInstance, setChartInstance] = useState(null);
    const [hiddenDatasets, setHiddenDatasets] = useState(new Set());

    // Handle legend click
    const handleLegendClick = (event, legendItem, legend) => {
        const index = legendItem.index;
        const chart = legend.chart;
        
        // Toggle visibility
        const isVisible = chart.getDataVisibility(index);
        chart.toggleDataVisibility(index);
        chart.update('none'); // Update without animation for better performance
        
        // Update hidden datasets state for styling
        setHiddenDatasets(prev => {
            const newSet = new Set(prev);
            if (isVisible) {
                newSet.add(index);
            } else {
                newSet.delete(index);
            }
            return newSet;
        });
    };

    const data = {
        labels: labels,
        datasets: datasets.map(ds => ({
            data: ds.dataPoints,
            backgroundColor: ds.colors,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverBackgroundColor: ds.colors?.map(color => {
                // Lighten colors on hover for better interaction feedback
                const hex = color.replace('#', '');
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                return `rgba(${r}, ${g}, ${b}, 0.8)`;
            }),
        }))
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: `${innerRadius}%`, // This creates the "hole" in the middle, making it a donut chart
        layout: {
            padding: {
                top: showTitle ? 40 : 60,    // More space at top for external labels
                bottom: 60,                   // Space for bottom labels
                left: 60,                     // Space for left labels
                right: showLegend ? 120 : 60  // Extra space for legend if shown
            }
        },
        plugins: {
            showValues: showValues, // Pass showValues to the plugin
            legend: {
                display: showLegend,
                position: 'right',
                align: 'start',
                onClick: handleLegendClick, // Custom legend click handler
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
                    },
                    generateLabels: function(chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            const visibleData = data.datasets[0].data.filter((value, index) => 
                                chart.getDataVisibility(index) !== false
                            );
                            const total = visibleData.reduce((sum, value) => sum + value, 0);
                            
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const isHidden = chart.getDataVisibility(i) === false;
                                const percentage = total > 0 && !isHidden ? ((value / total) * 100).toFixed(1) : '0.0';
                                const formattedValue = formatNumber(value);
                                
                                return {
                                    text: `${label}: ${formattedValue} (${percentage}%)`,
                                    fillStyle: isHidden ? '#9CA3AF' : data.datasets[0].backgroundColor[i], // Gray when hidden
                                    strokeStyle: isHidden ? '#9CA3AF' : '#ffffff',
                                    fontColor: isHidden ? '#9CA3AF' : '#374151', // Gray text when hidden
                                    lineWidth: 2,
                                    index: i,
                                    hidden: isHidden
                                };
                            });
                        }
                        return [];
                    }
                }
            },
            title: {
                display: false, // We'll render title manually for better control
            },
            datalabels: {
                display: false // This will hide the data point values
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#1f2937',
                bodyColor: '#374151',
                borderColor: '#d1d5db',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                boxPadding: 4,
                padding: 12,
                titleFont: {
                    size: 13,
                    weight: '600'
                },
                bodyFont: {
                    size: 12,
                    weight: '500'
                },
                filter: function(tooltipItem) {
                    // Only show tooltip for visible segments
                    return tooltipItem.chart.getDataVisibility(tooltipItem.dataIndex) !== false;
                },
                callbacks: {
                    title: function(context) {
                        return context[0].label || '';
                    },
                    label: function(context) {
                        const value = context.parsed;
                        const chart = context.chart;
                        
                        // Calculate total from visible data only
                        const visibleData = chart.data.datasets[0].data.filter((data, index) => 
                            chart.getDataVisibility(index) !== false
                        );
                        const total = visibleData.reduce((sum, data) => sum + data, 0);
                        
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0.0%';
                        const formattedValue = formatNumber(value);
                        
                        return `Value: ${formattedValue} (${percentage})`;
                    }
                }
            },
            externalLabelsDonut: {
                display: showExternalLabels
            }
        },
        elements: {
            arc: {
                borderAlign: 'center',
                hoverBorderWidth: 4
            }
        },
        interaction: {
            intersect: false,
            mode: 'point'
        },
        animation: {
            animateRotate: true,
            animateScale: false,
            duration: 1000,
            easing: 'easeOutQuart'
        },
        onHover: (event, activeElements, chart) => {
            event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
        }
    };

    return (
        <div className="w-full h-full relative">
            {/* Custom title positioned like Power BI */}
            {showTitle && title && (
                <div className="absolute top-0 left-0 z-10">
                    <h3 className="text-xm font-semibold text-gray-800 dark:text-gray-100 bg-white/90 dark:bg-gray-800/90 px-1 rounded">
                        {title}
                    </h3>
                </div>
            )}
            
            {/* Chart container */}
            <div className="w-full h-full p-3 pt-8">
                <div className="w-full h-full">
                    <Doughnut 
                        data={data} 
                        options={options}
                        ref={(ref) => {
                            if (ref) {
                                setChartInstance(ref);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default memo(DonutChartWidget);