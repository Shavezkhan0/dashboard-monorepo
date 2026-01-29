// src/app/design/Context/CanvasContext.jsx

'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ApiClient, useDashboard, useUpdateDashboard } from '@dashboard/api-client';
import { Widget } from '@dashboard/shared-types';

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
    saveDashboard: () => void;
    isSaving: boolean;
    dashboard?: any; // or specific Dashboard type
}

const CanvasContext = createContext<CanvasContextType | null>(null);

interface CanvasProviderProps {
    children: React.ReactNode;
    dashboardId: string | null;
    client: ApiClient | null;
}

export const CanvasProvider = ({ children, dashboardId, client }: CanvasProviderProps) => {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

    // Global data storage
    const [storedDataSets, setStoredDataSets] = useState<any[]>([]);

    const { data: dashboard, isLoading } = useDashboard(client!, dashboardId);
    const updateMutation = useUpdateDashboard(client!);

    // Load initial widgets
    useEffect(() => {
        if (dashboard?.widgets) {
            // Ensure widgets have valid layout and props
            setWidgets(dashboard.widgets);
        }
    }, [dashboard]);

    const saveDashboard = () => {
        if (client && dashboardId) {
            updateMutation.mutate({
                id: dashboardId,
                data: { widgets }
            });
        }
    };

    // Auto-save on widget change (optional, or rely on manual trigger)
    // For now, let's expose saveDashboard and also auto-save after delay?
    // User asked for "same functionality". 
    // We'll add a debounced auto-save or just rely on the user/UI. 
    // Given the UI doesn't seem to have a save button in the new design (from decompose_docker), 
    // we should probably auto-save.
    useEffect(() => {
        if (!isLoading && dashboardId && client && widgets.length > 0) {
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
    };

    const updateWidget = (widgetId: string, newProps: any) => {
        setWidgets((prev) =>
            prev.map((w) =>
                (w.id === widgetId) ? { ...w, props: newProps } : w
            )
        );
    };

    const updateLayout = (newLayout: any[]) => {
        setWidgets(prevWidgets => prevWidgets.map(widget => {
            const layoutItem = newLayout.find((item: any) => item.i === widget.id);
            return layoutItem ? { ...widget, layout: layoutItem } : widget;
        }));
    };

    const deleteWidget = (widgetId: string) => {
        setWidgets(prev => prev.filter(w => w.id !== widgetId));
        if (selectedWidgetId === widgetId) {
            setSelectedWidgetId(null);
        }
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
    };

    const bringToFront = (widgetId: string) => {
        setWidgets(prev => {
            const widgetToMove = prev.find(w => w.id === widgetId);
            if (!widgetToMove) return prev;
            const otherWidgets = prev.filter(w => w.id !== widgetId);
            return [...otherWidgets, widgetToMove];
        });
    };

    // Data management functions
    const addStoredDataSet = (dataSet: any) => {
        const newDataSet = {
            id: uuidv4(),
            ...dataSet,
            createdAt: new Date().toISOString()
        };
        setStoredDataSets(prev => [...prev, newDataSet]);
        return newDataSet.id;
    };

    const removeStoredDataSet = (dataSetId: string) => {
        setStoredDataSets(prev => prev.filter(ds => ds.id !== dataSetId));
    };

    const getStoredDataSet = (dataSetId: string) => {
        return storedDataSets.find(ds => ds.id === dataSetId);
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
        saveDashboard,
        isSaving: updateMutation.isPending,
        dashboard // Expose full dashboard data
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