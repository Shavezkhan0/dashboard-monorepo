'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiClient } from '@dashboard/api-client';
import { useDashboard, useUpdateDashboard } from '@dashboard/api-client';
import type { Widget, WidgetLayout } from '@dashboard/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface DataSet {
    id: string;
    [key: string]: any;
    createdAt: string;
}

interface CanvasContextType {
    widgets: Widget[];
    setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
    selectedWidgetId: string | null;
    setSelectedWidgetId: React.Dispatch<React.SetStateAction<string | null>>;
    addWidget: (widgetConfig: Partial<Widget>) => void;
    updateWidget: (widgetId: string, newProps: Record<string, any>) => void;
    updateLayout: (newLayout: WidgetLayout[]) => void;
    deleteWidget: (widgetId: string) => void;
    duplicateWidget: (widgetId: string) => void;
    bringToFront: (widgetId: string) => void;
    storedDataSets: DataSet[];
    setStoredDataSets: React.Dispatch<React.SetStateAction<DataSet[]>>;
    addStoredDataSet: (dataSet: Record<string, any>) => string;
    removeStoredDataSet: (dataSetId: string) => void;
    getStoredDataSet: (dataSetId: string) => DataSet | undefined;
    dashboardName: string;
    setDashboardName: React.Dispatch<React.SetStateAction<string>>;
    saveToBackend: () => Promise<void>;
    isSaving: boolean;
    saveStatus: SaveStatus;
    dashboardId: string | null;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

interface CanvasProviderProps {
    children: ReactNode;
    dashboardId?: string | null;
}

export const CanvasProvider = ({ children, dashboardId = null }: CanvasProviderProps) => {
    const { token } = useAuthContext();
    const [client, setClient] = useState<ApiClient | null>(null);
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
    const [dashboardName, setDashboardName] = useState<string>('My Dashboard');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    
    // Global data storage
    const [storedDataSets, setStoredDataSets] = useState<DataSet[]>([]);
    
    useEffect(() => {
        if (token) {
            setClient(new ApiClient(API_URL, () => token));
        }
    }, [token]);

    // Load dashboard if dashboardId is provided
    const { data: dashboardData } = useDashboard(client!, dashboardId, {
        enabled: !!dashboardId && !!client,
    });

    const updateMutation = useUpdateDashboard(client!);

    useEffect(() => {
        if (dashboardData) {
            setWidgets(dashboardData.widgets || []);
            setDashboardName(dashboardData.name || 'My Dashboard');
        }
    }, [dashboardData]);

    const saveToBackend = useCallback(async () => {
        if (!client || !dashboardId) return;
        
        setIsSaving(true);
        setSaveStatus('saving');
        
        try {
            await updateMutation.mutateAsync({
                id: dashboardId,
                data: {
                    name: dashboardName,
                    widgets: widgets,
                },
            });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Failed to save dashboard:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsSaving(false);
        }
    }, [client, dashboardId, dashboardName, widgets, updateMutation]);

    // Debounced auto-save
    useEffect(() => {
        if (!dashboardId || !client) return;
        
        const timeoutId = setTimeout(() => {
            saveToBackend();
        }, 2000); // Save 2 seconds after last change

        return () => clearTimeout(timeoutId);
    }, [widgets, dashboardName, dashboardId, client, saveToBackend]);
    
    const addWidget = useCallback((widgetConfig: Partial<Widget>) => {
        const newId = uuidv4();
        const newWidget: Widget = {
            id: newId,
            type: widgetConfig.type || 'line',
            props: widgetConfig.props || {},
            layout: { i: newId, x: 1, y: 1, w: 8, h: 20 },
            ...widgetConfig,
        };
        setWidgets((prev) => [...prev, newWidget]);
        setSelectedWidgetId(newId);
    }, []);

    const updateWidget = useCallback((widgetId: string, newProps: Record<string, any>) => {
        setWidgets((prev) =>
            prev.map((w) =>
                (w.id === widgetId) ? { ...w, props: newProps } : w
            )
        );
    }, []);

    const updateLayout = useCallback((newLayout: WidgetLayout[]) => {
        setWidgets(prevWidgets => prevWidgets.map(widget => {
            const layoutItem = newLayout.find(item => item.i === widget.id);
            return layoutItem ? { ...widget, layout: layoutItem } : widget;
        }));
    }, []);

    const deleteWidget = useCallback((widgetId: string) => {
        setWidgets(prev => prev.filter(w => w.id !== widgetId));
        if (selectedWidgetId === widgetId) {
            setSelectedWidgetId(null);
        }
    }, [selectedWidgetId]);

    const duplicateWidget = useCallback((widgetId: string) => {
        const widgetToDuplicate = widgets.find(w => w.id === widgetId);
        if (!widgetToDuplicate) return;

        const newId = uuidv4();
        const newWidget: Widget = {
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
    }, [widgets]);

    const bringToFront = useCallback((widgetId: string) => {
        setWidgets(prev => {
            const widgetToMove = prev.find(w => w.id === widgetId);
            if (!widgetToMove) return prev;
            const otherWidgets = prev.filter(w => w.id !== widgetId);
            return [...otherWidgets, widgetToMove];
        });
    }, []);

    // Data management functions
    const addStoredDataSet = useCallback((dataSet: Record<string, any>): string => {
        const newDataSet: DataSet = {
            id: uuidv4(),
            ...dataSet,
            createdAt: new Date().toISOString()
        };
        setStoredDataSets(prev => [...prev, newDataSet]);
        return newDataSet.id;
    }, []);

    const removeStoredDataSet = useCallback((dataSetId: string) => {
        setStoredDataSets(prev => prev.filter(ds => ds.id !== dataSetId));
    }, []);

    const getStoredDataSet = useCallback((dataSetId: string): DataSet | undefined => {
        return storedDataSets.find(ds => ds.id === dataSetId);
    }, [storedDataSets]);

    const value: CanvasContextType = { 
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
        storedDataSets,
        setStoredDataSets,
        addStoredDataSet,
        removeStoredDataSet,
        getStoredDataSet,
        dashboardName,
        setDashboardName,
        saveToBackend,
        isSaving,
        saveStatus,
        dashboardId,
    };

    return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

export const useCanvasHook = (): CanvasContextType => {
    const context = useContext(CanvasContext);
    if (!context) {
        throw new Error('useCanvasHook must be used within a CanvasProvider');
    }
    return context;
};
