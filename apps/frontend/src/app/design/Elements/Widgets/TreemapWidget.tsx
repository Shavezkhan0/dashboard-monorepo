'use client';
'use client';
import React, { memo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with a loading fallback
const ApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-gray-500">Loading Treemap...</div>,
});

function TreemapWidget({ title = 'Treemap Chart', data = [], showTitle = true }) {
    // State to track if the component has mounted on the client
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // This ensures the chart only renders after the component has mounted
        setIsMounted(true);
    }, []);

    // Transform hierarchical data to flat format that ApexCharts expects
    const transformDataForApex = (hierarchicalData) => {
        if (!hierarchicalData || hierarchicalData.length === 0) return [];

        // Create a map to store nodes by their ID
        const nodeMap = new Map();
        const rootNodes = [];

        // First pass: create all nodes and identify roots
        hierarchicalData.forEach(item => {
            nodeMap.set(item.id, { ...item });
            if (!item.parent || item.parent === '') {
                rootNodes.push(item);
            }
        });

        // Second pass: build hierarchy
        const buildHierarchy = (node) => {
            const children = hierarchicalData.filter(item => item.parent === node.id);
            if (children.length > 0) {
                return children.map(child => ({
                    x: child.name,
                    y: child.value
                }));
            }
            return [{
                x: node.name,
                y: node.value
            }];
        };

        // For treemap, we need to flatten the data in a specific way
        const flattenedData = [];
        
        hierarchicalData.forEach(item => {
            if (item.value > 0) { // Only include items with positive values
                flattenedData.push({
                    x: item.name,
                    y: item.value
                });
            }
        });

        return flattenedData;
    };

    // ApexCharts data and options configuration
    const transformedData = transformDataForApex(data);
    const chartData = [{
        data: transformedData
    }];

    const options = {
        legend: {
            show: false
        },
        chart: {
            toolbar: {
                show: false
            },
            type: 'treemap',
            height: '100%'
        },
        title: {
            text: showTitle ? title : '',
            align: 'center',
            style: {
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'inherit'
            }
        },
        plotOptions: {
            treemap: {
                enableShades: true,
                shadeIntensity: 0.5,
                reverseNegativeShade: false,
                distributed: true,
                colorScale: {
                    ranges: [{
                        from: -100,
                        to: 0,
                        color: '#CD363A'
                    }, {
                        from: 0.01,
                        to: 100,
                        color: '#52B355'
                    }]
                }
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '12px',
                fontWeight: 'bold'
            },
            formatter: function(text, op) {
                return [text, op.value];
            },
            offsetY: -4
        },
        tooltip: {
            enabled: true,
            style: {
                fontSize: '12px',
                fontFamily: 'inherit',
            },
            y: {
                formatter: function(value) {
                    return value;
                }
            }
        },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16']
    };

    // Debug logging
    console.log('Original data:', data);
    console.log('Transformed data:', transformedData);
    console.log('Chart data:', chartData);

    // Render logic with a check for both mounting and data
    return (
        <div className="w-full h-full p-4 box-border">
            {isMounted && transformedData && transformedData.length > 0 ? (
                <ApexChart 
                    options={options} 
                    series={chartData} 
                    type="treemap" 
                    height="100%" 
                    width="100%"
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    {isMounted ? 'No data to display. Please edit the chart to add data.' : 'Loading...'}
                </div>
            )}
        </div>
    );
}

export default memo(TreemapWidget);
