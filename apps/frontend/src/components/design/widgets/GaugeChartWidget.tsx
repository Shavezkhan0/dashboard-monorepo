'use client';

import React, { memo, useState, useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

function GaugeChartWidget({
    title = 'Gauge Chart',
    showTitle = true,
    value = 40,
    target = 50,
    showTarget = true,
    minValue = 0,
    maxValue = 100,
    unit = '',
    valueFormat = 'default', // default, currency, percentage, compact
    labels = ['Low', 'Medium', 'High'],
    colors = ['#EF4444', '#F59E0B', '#10B981'],
    needleColor = '#1e40af',
    animationDuration = 1000,
    showLabels = true
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Format value based on valueFormat prop
    const formatValue = (val) => {
        // Round to 2 decimal places to avoid long decimals
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
        // Default: show max 2 decimal places
        return roundedVal % 1 === 0 ? roundedVal.toString() : roundedVal.toFixed(2);
    };

    const bandSize = maxValue > minValue ? (maxValue - minValue) / labels.length : 0;
    const bandData = new Array(labels.length).fill(bandSize);

    const data = {
        labels: labels,
        datasets: [{
            data: bandData,
            backgroundColor: colors,
            borderWidth: 0,
            circumference: 180,
            rotation: -90,
        }]
    };
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: animationDuration
        },
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            datalabels: { display: false }
        },
        elements: {
            arc: {
                borderWidth: 0
            }
        }
    };
    
    const targetRotation = maxValue > minValue ? ((target - minValue) / (maxValue - minValue)) * 180 - 90 : -90;
    const valueRotation = maxValue > minValue ? ((value - minValue) / (maxValue - minValue)) * 180 - 90 : -90;

    // Calculate value position for needle
    const needleStyle = useMemo(() => ({
        transformOrigin: 'center bottom',
        transform: `translateX(-50%) rotate(${valueRotation}deg)`,
        bottom: '50%',
        left: '50%',
        height: '40%',
        width: '3px',
        zIndex: 10,
        transition: `transform ${animationDuration}ms ease-out`
    }), [valueRotation, animationDuration]);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="w-full h-full box-border flex flex-col items-center justify-center relative bg-card">
            {showTitle && (
                    <div className="absolute top-2 left-4 text-sm font-semibold text-card-foreground truncate max-w-[80%]">{title}</div>
            )}
            <div className="relative w-full h-[75%]">
                <Doughnut data={data} options={options} />
                
                {/* Value Needle */}
                <div 
                    className="absolute rounded-t-full"
                    style={{
                        ...needleStyle,
                        backgroundColor: needleColor
                    }}
                ></div>

                {/* Center Circle */}
                <div 
                    className="absolute rounded-full shadow-lg"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        backgroundColor: needleColor,
                        zIndex: 15
                    }}
                ></div>

                {/* Min/Max Labels */}
                {showLabels && (
                    <div className="absolute w-full bottom-0 flex justify-between px-[12%] text-xs text-muted-foreground">
                        <span className="font-medium max-w-[10%] truncate inline-block">{formatValue(minValue)}{unit}</span>
                        <span className="font-medium max-w-[10%] truncate inline-block">{formatValue(maxValue)}{unit}</span>
                    </div>
                )}
                
                {/* Value Display - Inside Gauge at Bottom */}
                <div className="absolute bottom-[15%] left-1/2 transform -translate-x-1/2 text-center z-[5] px-2 w-full">
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-200 truncate overflow-hidden whitespace-nowrap">
                        {formatValue(value)}{unit}
                    </div>
                    {showTarget && (
                        <div className="text-xs text-white bg-slate-800 dark:bg-slate-700 px-2 py-0.5 rounded-full mt-1 inline-block shadow-md truncate overflow-hidden whitespace-nowrap max-w-[90%]">
                            Target: {formatValue(target)}{unit}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default memo(GaugeChartWidget);