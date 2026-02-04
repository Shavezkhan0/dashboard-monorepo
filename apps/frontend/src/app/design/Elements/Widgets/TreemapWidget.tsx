'use client';
import React, { memo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with a loading fallback
const ApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-gray-500">Loading Treemap...</div>,
});

function TreemapWidget({
    title = 'Treemap Chart',
    data = [],
    showTitle = true,
    showDataLabels = true,
    showValues = true,
    colorScheme = 'powerbi',
    enableShades = true,
    shadeIntensity = 0.5,
    customColors = null,
    tooltipFormat = 'default',
    borderRadius = 4,
    borderWidth = 2
}) {
    // State to track if the component has mounted on the client
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // This ensures the chart only renders after the component has mounted
        setIsMounted(true);
    }, []);

    // Color schemes
    const colorSchemes = {
        powerbi: [
            '#118DFF', '#12239E', '#E66C37', '#6B007B', '#E044A7',
            '#744EC2', '#D9B300', '#D64550', '#197278', '#1AAA55',
            '#FFA800', '#00BCF2'
        ],
        default: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#14B8A6'
        ],
        pastel: [
            '#93C5FD', '#86EFAC', '#FCD34D', '#FCA5A5', '#C4B5FD',
            '#A5F3FC', '#FDBA74', '#BEF264', '#F9A8D4', '#5EEAD4'
        ],
        vibrant: [
            '#2563EB', '#16A34A', '#EA580C', '#DC2626', '#7C3AED',
            '#0891B2', '#D97706', '#65A30D', '#DB2777', '#0D9488'
        ]
    };

    // Get colors based on scheme
    const getColors = () => {
        if (customColors && customColors.length > 0) return customColors;
        return colorSchemes[colorScheme] || colorSchemes.powerbi;
    };

    // Transform hierarchical data to format that ApexCharts expects
    const transformDataForApex = (hierarchicalData) => {
        if (!hierarchicalData || hierarchicalData.length === 0) return [];

        // Handle hierarchical structure if parent field exists
        const hasHierarchy = hierarchicalData.some(item => item.parent && item.parent !== '');

        if (hasHierarchy) {
            // Build hierarchical structure
            const buildTreemapData = (parentId = '') => {
                const children = hierarchicalData.filter(item => (item.parent || '') === parentId);
                
                return children.map(child => {
                    const grandchildren = hierarchicalData.filter(item => item.parent === child.id);
                    
                    if (grandchildren.length > 0) {
                        return {
                            x: child.name,
                            y: child.value,
                            fillColor: child.color
                        };
                    }
                    
                    return {
                        x: child.name,
                        y: child.value,
                        fillColor: child.color
                    };
                });
            };

            return buildTreemapData('');
        } else {
            // Flat structure
            return hierarchicalData
                .filter(item => item.value > 0)
                .map(item => ({
                    x: item.name,
                    y: item.value,
                    fillColor: item.color
                }));
        }
    };

    // Format values for display
    const formatValue = (value) => {
        if (tooltipFormat === 'currency') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        } else if (tooltipFormat === 'percentage') {
            return `${value.toFixed(1)}%`;
        } else if (tooltipFormat === 'compact') {
            if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toString();
        }
        return value.toLocaleString();
    };

    // ApexCharts data and options configuration
    const transformedData = transformDataForApex(data);
    const chartData = [{
        data: transformedData
    }];

    const selectedColors = getColors();

    const options = {
        legend: {
            show: false
        },
        chart: {
            toolbar: {
                show: false
            },
            type: 'treemap',
            height: '100%',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 600,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        title: {
            text: showTitle ? title : '',
            align: 'start',
            margin: 10,
            offsetX: 0,
            offsetY: 0,
            floating: false,
            style: {
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                color: '#333'
            }
        },
        plotOptions: {
            treemap: {
                enableShades: enableShades,
                shadeIntensity: shadeIntensity,
                reverseNegativeShade: true,
                distributed: true,
                useFillColorAsStroke: false,
                borderRadius: borderRadius,
                dataLabels: {
                    format: showValues ? 'scale' : 'truncate'
                }
            }
        },
        dataLabels: {
            enabled: showDataLabels,
            style: {
                fontSize: '10px',
                fontWeight: '600',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                colors: ['#fff']
            },
            formatter: function(text, op) {
                if (!showValues) {
                    return text;
                }
                return [text, formatValue(op.value)];
            },
            offsetY: -4
        },
        tooltip: {
            enabled: true,
            followCursor: true,
            theme: 'dark',
            style: {
                fontSize: '12px',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
            custom: function({ seriesIndex, dataPointIndex, w }) {
                const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                const label = data.x;
                const value = data.y;
                
                // Format value based on tooltipFormat
                let formattedValue;
                if (tooltipFormat === 'currency') {
                    formattedValue = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(value);
                } else if (tooltipFormat === 'percentage') {
                    formattedValue = `${value.toFixed(1)}%`;
                } else if (tooltipFormat === 'compact') {
                    if (value >= 1000000) {
                        formattedValue = `${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
                        formattedValue = `${(value / 1000).toFixed(1)}K`;
                    } else {
                        formattedValue = value.toString();
                    }
                } else {
                    formattedValue = value.toLocaleString();
                }
                
                return `
                    <div style="padding: 8px 12px; background: rgba(0, 0, 0, 0.85); border-radius: 4px;">
                        <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">${label}</div>
                        <div style="color: #e0e0e0; font-size: 11px;">Value: ${formattedValue}</div>
                    </div>
                `;
            },
            marker: {
                show: false
            }
        },
        colors: selectedColors,
        stroke: {
            width: borderWidth,
            colors: ['#fff']
        }
    };

    // Render logic with a check for both mounting and data
    return (
        <div className="w-full h-full min-h-[200px] p-4 bg-white dark:bg-gray-800 rounded-lg">
            {isMounted && transformedData && transformedData.length > 0 ? (
                <ApexChart
                    options={options}
                    series={chartData}
                    type="treemap"
                    height="100%"
                    width="100%"
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg
                        className="w-16 h-16 mb-3 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                        />
                    </svg>
                    <p className="text-sm font-medium">
                        {isMounted ? 'No data to display' : 'Loading...'}
                    </p>
                    {isMounted && (
                        <p className="text-xs mt-1">
                            Select data from the settings panel
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default memo(TreemapWidget);