'use client';
'use client';

import React, { memo, useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

function GaugeChartWidget({
    title = 'Title goes here',
    showTitle = true,
    value = 40,
    target = 50,
    showTarget = true,
    minValue = 0,
    maxValue = 100,
    unit = 'K',
    labels = ['Poor', 'Average', 'Good'],
    colors = ['#EF4444', '#F59E0B', '#10B981']
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        }
    };
    
    const targetRotation = maxValue > minValue ? ((target - minValue) / (maxValue - minValue)) * 180 - 90 : -90;

    if (!isMounted) {
        return null; // or a loading spinner
    }

    return (
        <div className="w-full h-full box-border flex flex-col items-center justify-center relative">
            {showTitle && (
                <div className="absolute top-4 left-4 text-sm font-semibold text-gray-700">{title}</div>
            )}
            <div className="relative w-full h-[70%]">
                <Doughnut data={data} options={options} />
                {showTarget && (
                     <div 
                        className="absolute top-0 left-1/2 w-1 h-2.5 bg-blue-600 transition-transform duration-500 rounded-full"
                        style={{
                            transformOrigin: 'bottom 100%',
                            transform: `translateX(-50%) rotate(${targetRotation}deg) translateY(-100%)`,
                            top: '50%',
                            height: '50%',
                            zIndex: 5
                        }}
                    ></div>
                )}
            </div>
            <div className="absolute w-full bottom-[15%] flex justify-between px-[2%] text-xs text-gray-500">
                <span>{minValue}{unit}</span>
                <span>{maxValue}{unit}</span>
            </div>
            <div className="text-center mt-[-20%] z-10 relative">
                <div className="text-xl font-bold text-slate-800">{value}{unit}</div>
                {showTarget && (
                    <div className="text-sm text-white bg-slate-800 px-2 py-0.5 rounded-full mt-1">Target: {target}{unit}</div>
                )}
            </div>
        </div>
    );
}

export default memo(GaugeChartWidget);
