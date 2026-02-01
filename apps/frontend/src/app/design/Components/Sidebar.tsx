'use client';
import React, { useState, useMemo } from 'react';
import { ElementsList } from '../Elements/SidebarList';
import LineGraphSetting from './Setting/LineChartSetting';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from "lucide-react";
import { useCanvasHook } from '../Context/CanvasContext';
import PieChartSetting from './Setting/PieChartSetting';
import BarChartSetting from './Setting/BarChartSetting';
import HistogramSetting from './Setting/HistogramSetting';
import AreaChartSetting from './Setting/AreaChartSetting';
import DonutChartSetting from './Setting/DonutChartSetting';
import FunnelChartSetting from './Setting/FunnelChartSetting';
import ScatterChartSetting from './Setting/ScatterChartSetting';
import GaugeChartSetting from './Setting/GaugeChartSetting';
import TreemapSetting from './Setting/TreemapSetting';
import BubbleChartSetting from './Setting/BubbleChartSetting';
import WaterfallChartSetting from './Setting/WaterfallChartSetting';
import SideBarInportData from './SideBarInportData';
import AiGenerateSidebar from './AiGenerateSidebar';
import HeaderSetting from './Setting/HeaderSetting';
import KpiChartSetting from './Setting/KpiChartSetting';

// Import dark mode toggle
import ThemeToggle from '@/components/ThemeToggle';

export default function Sidebar() {
    const { widgets, selectedWidgetId, setSelectedWidgetId, updateWidget } = useCanvasHook();

    const selectedWidget = useMemo(() => {
        return widgets.find(w => w.id === selectedWidgetId);
    }, [widgets, selectedWidgetId]);

    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [selectedAi, setSelectedAi] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);

    const handleElementClick = (element: any) => {
        setSelectedOption(element);
        setPopupOpen(true);
        setSelectedWidgetId(null);
    };

    const handlePopupClose = (open: boolean) => {
        setPopupOpen(open);
        if (!open) {
            setSelectedOption(null);
        }
    };

    const handleCloseObjectSettings = () => {
        setSelectedWidgetId(null);
    };

    const handleChartDataUpdate = (newData: any) => {
        if (selectedWidgetId) {
            updateWidget(selectedWidgetId, newData);
        }
    };

    return (
        <div className="relative w-[320px] h-[94vh] bg-white border-r-2 border-gray-300 overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out">
                {/* Show AI Panel */}
                {selectedAi ? (
                    <div className="w-full h-full flex flex-col">
                        {/* Back button */}
                        <div className='px-3 pt-2 flex gap-5 item-center justify-between'>
                            <button
                                onClick={() => setSelectedAi(false)}
                                className="p-2 mb-3 text-black bg-gray-200 rounded text-xs cursor-pointer hover:bg-gray-300"
                            >
                                ← Back
                            </button>
                            <h2 className='text-indigo-600 text-center pt-2 font-bold '>Vission AI</h2>
                        </div>
                        {/* AI Prompt Box */}
                        <AiGenerateSidebar />
                    </div>
                ) : selectedWidget ? (
                    <div className="w-full h-full">
                        {/* Settings Panel */}
                        {selectedWidget.type === 'header' && (
                            <HeaderSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === 'line' && (
                            <LineGraphSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === 'pie' && (
                            <PieChartSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === 'bar' && (
                            <BarChartSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === "histogram" && (
                            <HistogramSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === 'areachart' && (
                            <AreaChartSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === 'donut' && (
                            <DonutChartSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === 'funnel' && (
                            <FunnelChartSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === 'scatter' && (
                            <ScatterChartSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === 'kpi' && (
                            <KpiChartSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === 'gauge' && (
                            <GaugeChartSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === "treemap" && (
                            <TreemapSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === "bubble" && (
                            <BubbleChartSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                        {selectedWidget.type === "waterfall" && (
                            <WaterfallChartSetting
                                key={selectedWidget.id}
                                initialData={selectedWidget.props}
                                onUpdate={handleChartDataUpdate}
                                onClose={handleCloseObjectSettings}
                            />
                        )}
                    </div>
                ) : (
                    <aside className="w-full h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
                        {/* Main Element List */}
                        <div className='px-3 pt-2 w-full grid grid-cols-1 gap-2 justify-center item-center rounded'>
                            <button
                                onClick={() => setSelectedAi(true)}
                                className={`p-2 text-black dark:text-white bg-gray-100 dark:bg-gray-700 rounded text-xs cursor-pointer hover:bg-white dark:hover:bg-gray-600 hover:border hover:border-2 hover:border-gray hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 hover:text-white`}>
                                Create With Ai
                            </button>
                        </div>
                        <div className='mx-2 mt-2 '>
                            <SideBarInportData />
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-2 ">
                            {ElementsList.map((element, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleElementClick(element)}
                                    className="flex flex-col justify-center items-center py-2 rounded-sm border cursor-pointer group bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900 border-gray-200 dark:border-gray-700"
                                >
                                    <div className="text-indigo-600 dark:text-indigo-400 text-2xl">{element.icon}</div>
                                    <div className="text-[13px] font-medium text-center text-gray-700 dark:text-gray-300">{element.name}</div>
                                </div>
                            ))}
                        </div>
                    </aside>
                )}
            </div>

            {/* Popup Dialog for Adding Elements */}
            <Dialog.Root open={popupOpen} onOpenChange={handlePopupClose}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 " />
                    <Dialog.Content className="fixed top-1/2 left-1/2 overflow-y-auto z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-[40vw]">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <Dialog.Title className="text-xl text-black dark:text-white font-semibold">{selectedOption?.name}</Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-1 rounded-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close"><X size={20} /></button>
                            </Dialog.Close>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[80vh]">
                            {selectedOption?.component && React.createElement(selectedOption.component, {
                                onClose: () => setPopupOpen(false)
                            })}
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
