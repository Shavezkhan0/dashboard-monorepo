'use client';

import React, { memo } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

// A small utility to format large numbers
const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
};

function KpiWidget({
    title = 'Key Metric',
    primaryValue = 0,
    primaryValuePrefix = '',
    primaryValueSuffix = '',
    comparisonLabel = 'vs last period',
    comparisonValue = 0,
    comparisonDirection = 'neutral', // 'increase' | 'decrease' | 'neutral'
    showComparison = true,
    showTitle = true,
    backgroundColor = '#ffffff',
    titleColor = '#6B7280',
    valueColor = '#1F2937',
    comparisonColor = 'auto' // 'auto' uses semantic colors based on direction
}) {
    const ComparisonIcon = {
        increase: <ArrowUpRight size={16} className="text-green-500" />,
        decrease: <ArrowDownRight size={16} className="text-red-500" />,
        neutral: <Minus size={16} className="text-gray-500" />
    }[comparisonDirection];

    const getComparisonColor = () => {
        if (comparisonColor !== 'auto') return comparisonColor;
        return {
            increase: 'text-green-600',
            decrease: 'text-red-600',
            neutral: 'text-gray-600'
        }[comparisonDirection];
    };

    return (
        <div 
            className="w-full h-full p-4 flex flex-col justify-between rounded-lg"
            style={{ backgroundColor }}
        >
            {/* Title */}
            {showTitle && (
                <h3 
                    className="text-md font-medium truncate"
                    style={{ color: titleColor }}
                >
                    {title}
                </h3>
            )}

            {/* Main Value */}
            <div className="my-2 flex-1 flex items-center">
                <p 
                    className="text-4xl font-bold truncate"
                    style={{ color: valueColor }}
                >
                    {primaryValuePrefix}{formatNumber(primaryValue)}{primaryValueSuffix}
                </p>
            </div>

            {/* Comparison */}
            {showComparison && (
                <div className="flex items-center gap-1 text-sm">
                    <span className={`font-semibold flex items-center gap-1 ${getComparisonColor()}`}>
                        {ComparisonIcon}
                        {Math.abs(comparisonValue)}%
                    </span>
                    <span className="text-gray-500 truncate">{comparisonLabel}</span>
                </div>
            )}
        </div>
    );
}

export default memo(KpiWidget);