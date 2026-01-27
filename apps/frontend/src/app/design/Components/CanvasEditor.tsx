'use client';
'use client';

import React, { useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useCanvasHook } from '../Context/CanvasContext';
import clsx from 'clsx';
import LineChartWidget from '../Elements/Widgets/LineChartWidget';
import { Copy, Trash2, BringToFront, GripVertical } from 'lucide-react';
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

const ResponsiveGridLayout = WidthProvider(Responsive);

const widgetComponents = {
    line: LineChartWidget,
    pie: PieChartWidget,
    bar: BarChartWidget,
    histogram: HistogramWidget,
    areachart: AreaChartWidget,
    donut: DonutChartWidget,
    funnel: FunnelChartWidget,
    scatter: ScatterChartWidget,
    gauge: GaugeChartWidget,
    treemap: TreemapWidget,
    bubble:BubbleChartWidget,
    waterfall:WaterfallChartWidget
};

function CanvasEditor() {
    const { widgets, updateLayout, selectedWidgetId, setSelectedWidgetId, deleteWidget, duplicateWidget, bringToFront } = useCanvasHook();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete' && selectedWidgetId) {
                deleteWidget(selectedWidgetId);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedWidgetId, deleteWidget]);

    const handleWidgetClick = (e, widgetId) => {
        e.stopPropagation();
        setSelectedWidgetId(widgetId);
    };



    const FloatingToolbar = ({ widgetId }) => (
        <div
            className="absolute top-[-40px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 bg-slate-800 text-white rounded-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
        >
            <button title="Duplicate" onClick={() => duplicateWidget(widgetId)} className="p-1.5 hover:bg-slate-700 rounded"><Copy size={16} /></button>
            <button title="Bring to Front" onClick={() => bringToFront(widgetId)} className="p-1.5 hover:bg-slate-700 rounded"><BringToFront size={16} /></button>
            <div className="w-px h-4 bg-slate-600 mx-1"></div>
            <button title="Delete" onClick={() => deleteWidget(widgetId)} className="p-1.5 text-red-400 hover:bg-slate-700 rounded"><Trash2 size={16} /></button>
        </div>
    );

    return (
        <div className="w-full flex-1 bg-gray-100 p-4 flex justify-center items-center overflow-auto">
            <div
                className="bg-white shadow-lg relative"
                style={{ width: '86vw', height: '87vh' }}
                onClick={() => setSelectedWidgetId(null)}
            >
                <div className="w-full h-full relative overflow-hidden overflow-y-auto">
                    <ResponsiveGridLayout
                        layouts={{ lg: widgets.map(w => w.layout) }}
                        onLayoutChange={(layout) => updateLayout(layout)}
                        onDragStart={(layout, oldItem, newItem) => setSelectedWidgetId(newItem.i)}
                        onResizeStart={(layout, oldItem, newItem) => setSelectedWidgetId(newItem.i)}
                        className="layout"
                        width={1000}
                        rowHeight={10}
                        isBounded={true}
                        allowOverlap={true}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    >
                        {widgets.map((widget) => {
                            const WidgetComponent = widgetComponents[widget.type];
                            const isSelected = selectedWidgetId === widget.id;

                            return (
                                <div
                                    key={widget.id}
                                    data-grid={widget.layout}
                                    className={clsx(
                                        'bg-white ',
                                        // 'overflow-hidden ',
                                        'relative group transition-[border-color,box-shadow] duration-200  ',
                                        'cursor-grab active:cursor-grabbing',
                                        isSelected ? 'border-1 border-indigo-500 shadow-xl z-10' : 'border border-gray-200 hover:border-gray-300 '
                                    )}
                                    onClick={(e) => handleWidgetClick(e, widget.id)}
                                >
                                    {isSelected && <FloatingToolbar widgetId={widget.id} />}

                                    <div className="w-full h-full">
                                        {WidgetComponent ? <WidgetComponent {...widget.props} /> : <div>Unknown Widget</div>}
                                    </div>

                                    {isSelected && (
                                        <div className="absolute bottom-0 right-0 cursor-se-resize text-gray-400 pr-1 pb-1">
                                            <GripVertical size={16} className="-rotate-45" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </ResponsiveGridLayout>
                </div>
            </div>
        </div>
    );
}

export default CanvasEditor;
