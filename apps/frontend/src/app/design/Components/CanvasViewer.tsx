'use client';

import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useCanvasHook } from '../Context/CanvasContext';
import clsx from 'clsx';
import LineChartWidget from '../Elements/Widgets/LineChartWidget';
import PieChartWidget from '../Elements/Widgets/PieChartWidget';
import BarChartWidget from '../Elements/Widgets/BarChartWidget';
import HistogramWidget from '../Elements/Widgets/HistogramWidget';
import AreaChartWidget from '../Elements/Widgets/AreaChartWidget';
import DonutChartWidget from '../Elements/Widgets/DonutChartWidget';
import FunnelChartWidget from '../Elements/Widgets/FunnelChartWidget';
import ScatterChartWidget from '../Elements/Widgets/ScatterChartWidget';
import GaugeChartWidget from '../Elements/Widgets/GaugeChartWidget';
import TreemapWidget from '../Elements/Widgets/TreemapWidget';
import BubbleChartWidget from '../Elements/Widgets/BubbleChartWidget';
import WaterfallChartWidget from '../Elements/Widgets/WaterfallChartWidget';
import HeaderWidget from '../Elements/Widgets/HeaderWidget';
import KpiWidget from '../Elements/Widgets/KpiWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

const widgetComponents = {
    header: HeaderWidget,
    line: LineChartWidget,
    pie: PieChartWidget,
    bar: BarChartWidget,
    histogram: HistogramWidget,
    areachart: AreaChartWidget,
    donut: DonutChartWidget,
    funnel: FunnelChartWidget,
    scatter: ScatterChartWidget,
    kpi: KpiWidget,
    gauge: GaugeChartWidget,
    treemap: TreemapWidget,
    bubble: BubbleChartWidget,
    waterfall: WaterfallChartWidget,
};

function CanvasViewer() {
    const { widgets } = useCanvasHook();

    return (
        <div className="w-full flex-1 bg-gray-100 p-4 flex justify-center items-center overflow-auto">
            <div className="bg-white shadow-lg relative w-full h-full">
                <div className="w-full h-full relative overflow-auto">
                    <ResponsiveGridLayout
                        layouts={{ lg: widgets.map(w => w.layout) }}
                        className="layout"
                        rowHeight={10}
                        isBounded={true}
                        allowOverlap={true}
                        isDraggable={false}
                        isResizable={false}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    >
                        {widgets.map((widget) => {
                            const WidgetComponent = widgetComponents[widget.type];

                            return (
                                <div
                                    key={widget.id}
                                    data-grid={widget.layout}
                                    className={clsx(
                                        'bg-white',
                                        'relative group border border-gray-200 shadow-sm'
                                    )}
                                >
                                    <div className="w-full h-full">
                                        {WidgetComponent ? (
                                            <WidgetComponent {...(widget.props as any)} />
                                        ) : (
                                            <div>Unknown Widget</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </ResponsiveGridLayout>
                </div>
            </div>
        </div>
    );
}

export default CanvasViewer;
