// src/app/design/Context/CanvasContext.jsx

'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ApiClient, useUpdateDashboard } from '@dashboard/api-client';
import { useDashboardWithData } from '@dashboard/api-client/src/hooks/use-dashboards-enhanced';
import { Widget } from '@dashboard/shared-types';
import toast from 'react-hot-toast';

interface CanvasContextType {
    widgets: Widget[];
    setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
    selectedWidgetId: string | null;
    setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>;
    addWidget: (widgetConfig: any) => void;
    updateWidget: (widgetId: string, newProps: any) => void;
    updateLayout: (newLayout: any[]) => void;
    deleteWidget: (widgetId: string) => void;
    duplicateWidget: (widgetId: string) => void;
    bringToFront: (widgetId: string) => void;
    storedDataSets: any[];
    setStoredDataSets: React.Dispatch<React.SetStateAction<any[]>>;
    addStoredDataSet: (dataSet: any) => string;
    removeStoredDataSet: (dataSetId: string) => void;
    getStoredDataSet: (dataSetId: string) => any;
    getDataSetByChartId: (chartId: string) => any;
    saveDashboard: (name?: string) => void;
    isSaving: boolean;
    dashboard?: any;
    charts?: any[];
}

const CanvasContext = createContext<CanvasContextType | null>(null);

interface CanvasProviderProps {
    children: React.ReactNode;
    dashboardId: string | null;
    client: ApiClient | null;
    onSaveAttempt?: (dashboardData: any) => void;
    isPreviewMode?: boolean;
}

export const CanvasProvider = ({ children, dashboardId, client, onSaveAttempt, isPreviewMode = false }: CanvasProviderProps) => {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
    const isDirty = useRef(false);

    // Global data storage
    const [storedDataSets, setStoredDataSets] = useState<any[]>([]);

    // Use useDashboardWithData to get dashboard with charts/datasets
    const { data: dashboardResult, isLoading } = useDashboardWithData(dashboardId!, { enabled: !!dashboardId && !!client });
    const dashboard: any = dashboardResult;
    
    // Extract charts and datasets for widget rendering
    const charts = (dashboard as any)?.charts || [];
    const datasets = (dashboard as any)?.datasets || [];
    
    const updateMutation = useUpdateDashboard(client!);

    // Load datasets from localStorage on dashboard load
    useEffect(() => {
        const loadDatasets = () => {
            const allDatasets: any[] = [];
            const existingIds = new Set<string>();

            // 1. Load from localStorage (uploaded data files)
            if (dashboardId && typeof window !== 'undefined') {
                const storageKey = `dashboard_datasets_${dashboardId}`;
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        parsed.forEach((d: any) => {
                            if (!existingIds.has(d.id)) {
                                allDatasets.push(d);
                                existingIds.add(d.id);
                            }
                        });
                    } catch (e) {
                        console.error('Failed to parse stored datasets:', e);
                    }
                }
            }

            if (allDatasets.length > 0) {
                setStoredDataSets(allDatasets);
            }
        };

        loadDatasets();
    }, [dashboardId]);

    // Load initial widgets
    useEffect(() => {
        if (dashboard?.widgets && widgets.length === 0) {
            const hydratedWidgets = dashboard.widgets.map((w: any) => {
                // If it's a chart widget with an ID and we have loaded charts
                if (w.chartId && dashboard.charts && dashboard.datasets) {
                    const chartData = dashboard.charts.find(c => c.id === w.chartId);
                    if (chartData) {
                        const datasetData = dashboard.datasets.find(d => d.id === chartData.dataset_id);
                        
                        // Map the raw backend data back into the frontend "labels" and "datasets" props
                        const xKey = chartData.data_mapping?.x || 'Label';
                        const labels = datasetData?.data?.map((row: any) => row[xKey]) || [];
                        
                        const yKeys = chartData.data_mapping?.y || [];
                        const series = Array.isArray(yKeys) ? yKeys.map((yKey: string, index: number) => ({
                            name: yKey,
                            dataPoints: datasetData?.data?.map((row: any) => row[yKey]) || [],
                            color: chartData.chart_config?.colors?.[index]
                        })) : [];

                        // Deep map the database type fallback back into frontend type keys
                        const typeMap: Record<string, string> = {
                            'area': 'areachart',
                            'line': 'line',
                            'pie': 'pie',
                            'bar': 'bar',
                            'histogram': 'histogram',
                            'donut': 'donut',
                            'funnel': 'funnel',
                            'scatter': 'scatter',
                            'gauge': 'gauge',
                            'treemap': 'treemap',
                            'bubble': 'bubble',
                            'waterfall': 'waterfall',
                            'kpi': 'kpi'
                        };
                        const restoredType = (chartData.chart_config as any)?.widgetType || typeMap[chartData.type] || 'bar';

                        return {
                            ...w,
                            // Ensure layout is preserved correctly
                            layout: w.layout || w.position,
                            type: restoredType, // Properly target the correct WidgetComponent mapping
                            datasetId: chartData.dataset_id, 
                            props: {
                                ...chartData.chart_config,
                                type: restoredType,
                                title: chartData.name,
                                labels,
                                datasets: series
                            }
                        };
                    }
                }
                
                // For non-chart widgets, just make sure layout is mapped
                return {
                    ...w,
                    layout: w.layout || w.position || { ...w.position, i: w.id },
                    props: w.config || w.props || {}
                };
            });

            setWidgets(hydratedWidgets);
            isDirty.current = false;
        }
    }, [dashboard]);

    const saveDashboard = (name?: string) => {
        if (isPreviewMode && onSaveAttempt) {
            onSaveAttempt({ widgets });
            return;
        }

        if (client && dashboardId) {
            const updateData: any = { widgets };
            if (name !== undefined) {
                updateData.name = name;
            }

            updateMutation.mutate({
                id: dashboardId,
                data: updateData
            }, {
                onSuccess: (updatedDashboard) => {
                    isDirty.current = false;
                    toast.success('Dashboard saved successfully');
                    // IMPORTANT: Update local widgets state with chartIds from saved dashboard
                    // This ensures new widgets get their chartIds for future updates
                    if (updatedDashboard?.widgets && Array.isArray(updatedDashboard.widgets)) {
                      setWidgets(prev => prev.map(localWidget => {
                        const savedWidget = updatedDashboard.widgets.find((sw: any) => sw.id === localWidget.id);
                        // If saved widget has chartId, update local widget with it
                        if (savedWidget?.chartId) {
                          return {
                            ...localWidget,
                            chartId: savedWidget.chartId,
                            type: savedWidget.type || localWidget.type
                          } as Widget;
                        }
                        return localWidget;
                      }));
                    }
                },
                onError: (error) => {
                    toast.error('Failed to save dashboard');
                    console.error('Save error:', error);
                }
            });
        }
    };

    // Auto-save on widget change
    useEffect(() => {
        if (!isLoading && dashboardId && client && widgets.length > 0 && isDirty.current) {
            const timer = setTimeout(() => {
                saveDashboard();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [widgets, dashboardId, client, isLoading]);


    const addWidget = (widgetConfig: any) => {
        const newId = uuidv4();

        // Define default layouts for different widget types
        const getDefaultLayout = (type: string) => {
            switch (type) {
                case 'header':
                    return { i: newId, x: 0, y: 0, w: 12, h: 3 };
                case 'kpi':
                    return { i: newId, x: 1, y: 2, w: 3, h: 6 };
                case 'gauge':
                    return { i: newId, x: 1, y: 2, w: 5, h: 16 };
                case 'metric':
                default:
                    return { i: newId, x: 1, y: 1, w: 8, h: 15 }; // Default height for other widgets
            }
        };

        const newWidget: Widget = {
            id: newId,
            ...widgetConfig,
            layout: widgetConfig.layout || getDefaultLayout(widgetConfig.type),
            props: widgetConfig.props || {}
        };
        setWidgets((prev) => [...prev, newWidget]);
        setSelectedWidgetId(newId);
        isDirty.current = true;
    };

    const updateWidget = (widgetId: string, newProps: any) => {
        setWidgets((prev) =>
            prev.map((w) =>
                (w.id === widgetId) ? { ...w, props: newProps } : w
            )
        );
        isDirty.current = true;
    };

    const updateLayout = (newLayout: any[]) => {
        setWidgets(prevWidgets => prevWidgets.map(widget => {
            const layoutItem = newLayout.find((item: any) => item.i === widget.id);
            return layoutItem ? { ...widget, layout: layoutItem } : widget;
        }));
        isDirty.current = true;
    };

    const deleteWidget = (widgetId: string) => {
        setWidgets(prev => prev.filter(w => w.id !== widgetId));
        if (selectedWidgetId === widgetId) {
            setSelectedWidgetId(null);
        }
        isDirty.current = true;
    };

    const duplicateWidget = (widgetId: string) => {
        const widgetToDuplicate = widgets.find(w => w.id === widgetId);
        if (!widgetToDuplicate) return;

        const newId = uuidv4();
        const newWidget = {
            ...widgetToDuplicate,
            id: newId,
            layout: {
                ...widgetToDuplicate.layout,
                i: newId,
                y: widgetToDuplicate.layout.y + 1,
            },
        };
        setWidgets(prev => [...prev, newWidget]);
        setSelectedWidgetId(newId);
        isDirty.current = true;
    };

    const bringToFront = (widgetId: string) => {
        setWidgets(prev => {
            const widgetToMove = prev.find(w => w.id === widgetId);
            if (!widgetToMove) return prev;
            const otherWidgets = prev.filter(w => w.id !== widgetId);
            return [...otherWidgets, widgetToMove];
        });
        isDirty.current = true;
    };

    // Data management functions
    const addStoredDataSet = (dataSet: any) => {
        const newDataSet = {
            id: uuidv4(),
            ...dataSet,
            createdAt: new Date().toISOString()
        };
        
        // Add to local state
        setStoredDataSets(prev => {
            const updated = [...prev, newDataSet];
            // Persist to localStorage for reload persistence
            if (typeof window !== 'undefined' && dashboardId) {
                const storageKey = `dashboard_datasets_${dashboardId}`;
                try {
                    localStorage.setItem(storageKey, JSON.stringify(updated));
                } catch (e: any) {
                    console.warn('Failed to persist datasets to localStorage:', e.message);
                }
            }
            return updated;
        });
        
        return newDataSet.id;
    };

    // Load datasets from localStorage on dashboard load
    useEffect(() => {
        if (dashboardId && typeof window !== 'undefined') {
            const storageKey = `dashboard_datasets_${dashboardId}`;
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.length > 0) {
                        setStoredDataSets(parsed);
                    }
                } catch (e) {
                    console.error('Failed to parse stored datasets:', e);
                }
            }
        }
    }, [dashboardId]);

    const removeStoredDataSet = (dataSetId: string) => {
        setStoredDataSets(prev => {
            const updated = prev.filter(ds => ds.id !== dataSetId);
            // Update localStorage
            if (typeof window !== 'undefined' && dashboardId) {
                const storageKey = `dashboard_datasets_${dashboardId}`;
                try {
                    localStorage.setItem(storageKey, JSON.stringify(updated));
                } catch (e: any) {
                    console.warn('Failed to persist datasets to localStorage:', e.message);
                }
            }
            return updated;
        });
    };

    const getStoredDataSet = (dataSetId: string) => {
        return storedDataSets.find(ds => ds.id === dataSetId);
    };

    // Helper to get dataset by chartId - used by widgets when loading from saved dashboard
    const getDataSetByChartId = (chartId: string) => {
        const chart = charts.find((c: any) => c.id === chartId);
        if (chart?.dataset_id) {
            return storedDataSets.find(ds => ds.id === chart.dataset_id);
        }
        return null;
    };

    const value = {
        widgets,
        setWidgets,
        selectedWidgetId,
        setSelectedWidgetId,
        addWidget,
        updateWidget,
        updateLayout,
        deleteWidget,
        duplicateWidget,
        bringToFront,
        // Data management
        storedDataSets,
        setStoredDataSets,
        addStoredDataSet,
        removeStoredDataSet,
        getStoredDataSet,
        getDataSetByChartId,
        saveDashboard,
        isSaving: updateMutation.isPending,
        dashboard,
        charts
    };

    return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

export const useCanvasHook = () => {
    const context = useContext(CanvasContext);
    if (!context) {
        throw new Error('useCanvasHook must be used within a CanvasProvider');
    }
    return context;
};