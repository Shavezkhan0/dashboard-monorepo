# SECTION 5.2: Source Code of Core Modules

---

## 5.2.1 Canvas State Management (CanvasContext)

**File:** `apps/frontend/src/contexts/CanvasContext.tsx`

```typescript
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

    // Auto-save on widget changes (2-second debounce)
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
```

---

## 5.2.2 AI Chart Generation Engine

**File:** `apps/frontend/src/components/design/sidebar/AiGenerateSidebar.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { HiRectangleGroup } from 'react-icons/hi2';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { useCanvasHook } from '@/contexts/CanvasContext';
import type { UIMessage } from 'ai';

export default function AiGenerateSidebar() {
  const { storedDataSets, addWidget } = useCanvasHook();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (selectedDatasetId && storedDataSets.length > 0) {
      const dataset = storedDataSets.find((ds) => ds.id === selectedDatasetId);
      if (dataset) {
        setSelectedColumns(dataset.columns || dataset.headers || []);
      }
    }
  }, [selectedDatasetId, storedDataSets]);

  const { messages, sendMessage, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) {
        return;
      }

      if (toolCall.toolName === 'createChart') {
        const args = (toolCall as unknown as { args?: { type: string; xAxisSelected: string; yAxisSelected: string } }).args || { type: '', xAxisSelected: '', yAxisSelected: '' };

        addToolOutput({
          tool: 'createChart',
          toolCallId: toolCall.toolCallId,
          output: {
            success: true,
            chartType: args.type,
            xAxis: args.xAxisSelected,
            yAxis: args.yAxisSelected,
          },
        });

        addWidget({
          type: args.type,
          props: {
            title: `${args.type} Chart`,
            labels: [],
            datasets: [
              {
                name: args.yAxisSelected,
                dataPoints: [],
              },
            ],
            xAxisKey: args.xAxisSelected,
            yAxisKey: args.yAxisSelected,
            datasetId: selectedDatasetId,
          },
        });
      }
    },
  });

  const wordCount = inputValue.trim().split(/\s+/).filter(Boolean).length;
  const minWords = 5;
  const isValid = wordCount >= minWords;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatasetId || !isValid) {
      return;
    }
    await sendMessage({ text: inputValue });
    setInputValue('');
  };

  return (
    <div className="w-[305px] bg-background border border-gray-200 rounded-lg shadow p-4 m-1">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-foreground">Write A Prompt</h2>
      </div>

      <div className="w-full bg-muted rounded-md px-3 py-2 mb-3 flex justify-start gap-2">
        <HiRectangleGroup className="text-indigo-600" />
        <span className="text-sm font-medium text-foreground">Create Dashboard Screen</span>
      </div>

      <div className="mb-3">
        <label className="text-xs font-medium text-foreground mb-1 block">
          Select Data Source
        </label>
        <select
          value={selectedDatasetId}
          onChange={(e) => setSelectedDatasetId(e.target.value)}
          className="w-full text-sm bg-background border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="">Choose a dataset...</option>
          {storedDataSets.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name} ({ds.rowCount} rows)
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={onSubmit}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            selectedDatasetId
              ? 'Enter your prompt here...'
              : 'Select a data source first'
          }
          disabled={!selectedDatasetId}
          className="w-full h-28 text-foreground bg-background border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          {!isValid && inputValue.length > 0 && (
            <span className="text-red-500">Min words: {minWords}</span>
          )}
          <span>{wordCount}/5000 words</span>
        </div>

        <button
          type="submit"
          disabled={!isValid || !selectedDatasetId}
          className={`w-full hover:text-white
          px-[4px] py-[4px] border-2 border-indigo-300
         
         bg-muted
         rounded-md
         text-sm font-medium
         transition-all duration-200
         hover:text-white ${
           isValid && selectedDatasetId
             ? 'text-indigo-600 hover:bg-indigo-800 hover:bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600'
             : 'bg-muted-foreground/30 cursor-not-allowed text-muted-foreground'
         }`}
        >
          Create Screen
        </button>
      </form>

      <div className="mt-2 max-h-[50vh] overflow-y-auto">
        {messages.length > 0 && (
          <div className="space-y-2 mt-4">
            {(messages as UIMessage[]).map((msg) => (
              <div
                key={msg.id}
                className={`p-2 border rounded-md text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-50 border-blue-200 text-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <span className="text-xs font-bold uppercase mr-1">
                  {msg.role}:
                </span>
                {msg.parts?.map((part, pIdx) => {
                  if (part.type === 'text') {
                    return <span key={pIdx}>{part.text}</span>;
                  }
                  if (part.type === 'tool-createChart') {
                    const toolPart = part as { state: string; input?: { type: string; xAxisSelected: string; yAxisSelected: string }; output?: { success: boolean } };
                    if (toolPart.state === 'output-available') {
                      return (
                        <div key={pIdx} className="mt-1 text-xs bg-green-50 p-1 rounded">
                          Chart created: {toolPart.input?.type}
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 5.2.3 Backend API Routing (Hono & Supabase)

**File:** `apps/api/src/routes/dashboards.ts`

```typescript
/**
 * Dashboards API Routes (Enhanced)
 * Handles dashboard CRUD with chart references and data loading
 */

import { Hono } from 'hono';
import { supabase } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import type {
  Dashboard,
  CreateDashboardInput,
  UpdateDashboardInput,
  DashboardWithCharts,
  DashboardWidget
} from '@dashboard/shared-types';
import type { Widget } from '@dashboard/shared-types';

const dashboards = new Hono();

// ============================================================================
// HELPER FUNCTIONS FOR 4-LAYER ARCHITECTURE
// ============================================================================

/**
 * Infer column schema from data array
 */
function inferColumns(data: Record<string, any>[]): any[] {
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  return Object.keys(firstRow).map(key => {
    const value = firstRow[key];
    let type = 'string';

    if (typeof value === 'number') {
      type = 'number';
    } else if (value instanceof Date || !isNaN(Date.parse(value))) {
      type = 'date';
    } else if (typeof value === 'boolean') {
      type = 'boolean';
    }

    return { name: key, type, nullable: false };
  });
}

/**
 * Extract dataset from old Widget format
 */
function extractDatasetFromWidget(widget: Widget): { name: string; data: any[]; columns: any[] } | null {
  // Check for direct data array (old format)
  let data = widget.props?.data || widget.props?.dataSet?.data || widget.props?.dataset?.data;

  // Check for labels + datasets format (current format)
  if (!data && widget.props?.labels && widget.props?.datasets) {
    const labels = widget.props.labels;
    const datasets = widget.props.datasets;

    if (!Array.isArray(labels) || labels.length === 0 || !Array.isArray(datasets) || datasets.length === 0) {
      return null;
    }

    // Convert labels + datasets into row-based data
    // Format: [{ "Label": "Item1", "DatasetName1": value1, "DatasetName2": value2 }, ...]
    data = labels.map((label: string, index: number) => {
      const row: Record<string, any> = {
        Label: label
      };

      datasets.forEach((ds: any) => {
        const datasetName = ds.name || `Dataset ${ds.id || ''}`;
        row[datasetName] = ds.dataPoints?.[index] ?? null;
      });

      return row;
    });
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  const columns = inferColumns(data);
  const baseName = widget.props?.title || widget.props?.name || `Dataset for ${widget.type} chart`;
  const name = `${baseName} - ${widget.id.substring(0, 4)}`;

  return { name, data, columns };
}

/**
 * Extract chart configuration from old Widget format
 */
function extractChartConfigFromWidget(widget: Widget, datasetId: string): any {
  const props = widget.props || {};

  // Map old widget type to new chart type
  const chartTypeMap: Record<string, string> = {
    'line': 'line',
    'pie': 'pie',
    'bar': 'bar',
    'histogram': 'histogram',
    'areachart': 'area',
    'donut': 'donut',
    'funnel': 'funnel',
    'scatter': 'scatter',
    'gauge': 'gauge',
    'treemap': 'treemap',
    'bubble': 'bubble',
    'waterfall': 'waterfall',
    'kpi': 'kpi'
  };

  const chartType = chartTypeMap[widget.type] || 'bar';

  // Extract data mapping
  const data_mapping: any = {};

  // For labels + datasets format
  if (props.labels && props.datasets) {
    data_mapping.x = 'Label'; // We use 'Label' as the column name

    // Y-axis: use dataset names
    if (Array.isArray(props.datasets) && props.datasets.length > 0) {
      data_mapping.y = props.datasets.map((ds: any) => ds.name || `Dataset ${ds.id || ''}`);
    }
  }

  // Fallback to old format mappings
  if (!data_mapping.x && (props.xAxisKey || props.xKey)) {
    data_mapping.x = props.xAxisKey || props.xKey;
  }

  if (!data_mapping.y && (props.yAxisKey || props.yKey || props.dataKey)) {
    const yKeys = props.yAxisKey || props.yKey || props.dataKey;
    data_mapping.y = Array.isArray(yKeys) ? yKeys : [yKeys];
  }

  if (props.groupBy || props.categoryKey) {
    data_mapping.groupBy = props.groupBy || props.categoryKey;
  }

  // For pie/donut charts
  if (widget.type === 'pie' || widget.type === 'donut') {
    data_mapping.category = props.categoryKey || props.nameKey || props.xKey || 'Label';
    data_mapping.value = props.dataKey || props.valueKey || props.yKey || (props.datasets?.[0]?.name);
  }

  // Extract chart config (visual settings)
  const chart_config: any = {
    title: props.title || props.chartTitle,
    subtitle: props.description,
    colors: props.datasets?.map((ds: any) => ds.color).filter(Boolean) || props.colors || (props.color ? [props.color] : undefined),
    showLegend: props.showLegend !== false,
    showGrid: props.showGrid !== false,
    showTooltip: props.showTooltip !== false,
    animation: props.animation !== false,
    orientation: props.orientation,
    stacked: props.stacked,
    showDataLabels: props.showDataLabels || props.showValues,
    widgetId: widget.id,
    widgetType: widget.type,

    // Line chart specific
    strokeWidth: props.strokeWidth,
    lineStyle: props.lineStyle,
    showMarkers: props.showMarkers,
    markerStyle: props.markerStyle,
    markerSize: props.markerSize,

    // Axis settings
    showXAxis: props.showXAxis,
    showYAxis: props.showYAxis,
    xAxisTitle: props.xAxisTitle,
    yAxisTitle: props.yAxisTitle,
    showXAxisTitle: props.showXAxisTitle,
    showYAxisTitle: props.showYAxisTitle,
    yMin: props.yMin,
    yMax: props.yMax,
    yStep: props.yStep,
  };

  // Remove undefined values
  Object.keys(chart_config).forEach(key => {
    if (chart_config[key] === undefined) {
      delete chart_config[key];
    }
  });

  return {
    name: (props.title || props.name || `${chartType} Chart`) + ` - ${widget.id.substring(0, 4)}`,
    description: props.description,
    dataset_id: datasetId,
    type: chartType,
    data_mapping,
    chart_config
  };
}

/**
 * Process widgets: Extract datasets/charts and save to DB, return updated widgets with chartIds
 */
async function processWidgetsForSave(widgets: any[], userId: string): Promise<DashboardWidget[]> {
  console.log('Processing widgets for save. Total widgets:', widgets.length);
  console.log('Widget types:', widgets.map(w => `${w.type}(${w.id})`).join(', '));

  const processedWidgets: DashboardWidget[] = [];

  for (const widget of widgets) {
    // Check if this is an old Widget format that needs conversion
    const isOldFormat = widget.props && !widget.chartId;
    const isChartWidget = ['line', 'pie', 'bar', 'histogram', 'areachart', 'donut', 'funnel', 'scatter', 'gauge', 'treemap', 'bubble', 'waterfall', 'kpi'].includes(widget.type);

    console.log(`Processing widget: ${widget.id}, type: ${widget.type}, isChartWidget: ${isChartWidget}, isOldFormat: ${isOldFormat}`);

    if (isChartWidget && isOldFormat) {
      console.log('Widget props structure:', JSON.stringify(widget.props, null, 2));

      // Extract dataset
      const datasetInfo = extractDatasetFromWidget(widget);

      if (!datasetInfo) {
        console.log('extractDatasetFromWidget returned null for widget:', widget.id);
        console.log('Widget has props.data?', !!widget.props?.data);
        console.log('Widget has props.dataSet?.data?', !!widget.props?.dataSet?.data);
        console.log('Widget has props.dataset?.data?', !!widget.props?.dataset?.data);
      }

      if (datasetInfo) {
        console.log('Extracting dataset for widget:', widget.id, 'Type:', widget.type);
        console.log('Dataset info:', { name: datasetInfo.name, rowCount: datasetInfo.data.length });

        // Save dataset to database
        const { data: savedDataset, error: datasetError } = await supabase
          .from('datasets')
          .insert({
            user_id: userId,
            name: datasetInfo.name,
            data: datasetInfo.data,
            columns: datasetInfo.columns
          })
          .select()
          .single();

        if (datasetError || !savedDataset) {
          console.error('Error saving dataset:', datasetError);
          // Skip this widget if dataset save fails
          continue;
        }

        console.log('Dataset saved successfully! ID:', savedDataset.id);

        // Extract chart config
        const chartConfig = extractChartConfigFromWidget(widget, savedDataset.id);
        console.log('Chart config extracted:', { name: chartConfig.name, type: chartConfig.type, datasetId: savedDataset.id });

        // Save chart to database
        const { data: savedChart, error: chartError } = await supabase
          .from('charts')
          .insert({
            user_id: userId,
            ...chartConfig
          })
          .select()
          .single();

        if (chartError || !savedChart) {
          console.error('Error saving chart:', chartError);
          continue;
        }

        console.log('Chart saved successfully! ID:', savedChart.id);

        // Convert to new DashboardWidget format - preserve original widget type
        processedWidgets.push({
          id: widget.id,
          type: widget.type || 'chart',
          chartId: savedChart.id,
          position: {
            x: widget.layout?.x || 0,
            y: widget.layout?.y || 0,
            w: widget.layout?.w || 6,
            h: widget.layout?.h || 4
          }
        });
      }
    } else if (widget.chartId) {
      // Already in new format with chartId
      processedWidgets.push({
        id: widget.id,
        type: widget.type || 'chart',
        chartId: widget.chartId,
        position: widget.position || {
          x: widget.layout?.x || 0,
          y: widget.layout?.y || 0,
          w: widget.layout?.w || 6,
          h: widget.layout?.h || 4
        },
        overrides: widget.overrides
      });
    } else {
      // Non-chart widget (text, image, header)
      processedWidgets.push({
        id: widget.id,
        type: widget.type,
        position: widget.position || {
          x: widget.layout?.x || 0,
          y: widget.layout?.y || 0,
          w: widget.layout?.w || 6,
          h: widget.layout?.h || 2
        },
        content: widget.content || widget.props?.content,
        config: widget.config || widget.props
      });
    }
  }

  return processedWidgets;
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/dashboards
 * List all dashboards for the authenticated user
 */
dashboards.get('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const { folder, tag } = c.req.query();

    let query = supabase
      .from('dashboards')
      .select('*')
      .eq('user_id', userId);

    // Optional filters
    if (folder) {
      query = query.eq('folder', folder);
    }
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ data: data as Dashboard[] });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/dashboards/:id
 * Get a single dashboard by ID
 */
dashboards.get('/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const userId = c.get('userId') as string;

    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return c.json({ error: 'Dashboard not found' }, 404);
    }

    return c.json({ data: data as Dashboard });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/dashboards/:id/with-data
 * Get dashboard with all associated charts and datasets
 */
dashboards.get('/:id/with-data', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const userId = c.get('userId') as string;

    // Get dashboard
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (dashboardError) {
      return c.json({ error: 'Dashboard not found' }, 404);
    }

    const widgets = (dashboard as any).widgets || [];

    // Extract chart IDs from widgets
    const chartIds = widgets
      .filter((w: any) => w.type === 'chart' && w.chartId)
      .map((w: any) => w.chartId);

    let charts: any[] = [];
    let datasets: any[] = [];

    if (chartIds.length > 0) {
      // Get all charts
      const { data: chartsData, error: chartsError } = await supabase
        .from('charts')
        .select('*')
        .in('id', chartIds)
        .eq('user_id', userId);

      if (!chartsError && chartsData) {
        charts = chartsData;

        // Extract dataset IDs
        const datasetIds = [...new Set(charts.map(c => c.dataset_id))];

        // Get all datasets
        if (datasetIds.length > 0) {
          const { data: datasetsData, error: datasetsError } = await supabase
            .from('datasets')
            .select('*')
            .in('id', datasetIds)
            .eq('user_id', userId);

          if (!datasetsError && datasetsData) {
            datasets = datasetsData;
          }
        }
      }
    }

    const dashboardWithData: DashboardWithCharts = {
      ...dashboard as Dashboard,
      charts,
      datasets
    };

    return c.json({ data: dashboardWithData });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /api/dashboards
 * Create a new dashboard
 */
dashboards.post('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const body = await c.req.json<CreateDashboardInput>();

    const {
      name,
      description,
      widgets,
      layout_config,
      theme,
      global_filters,
      refresh_interval,
      is_public,
      folder,
      tags
    } = body;

    // Validate required fields
    if (!name) {
      return c.json({ error: 'Dashboard name is required' }, 400);
    }

    // Process widgets: extract and save datasets/charts if needed
    let processedWidgets: DashboardWidget[] = [];
    if (widgets && Array.isArray(widgets)) {
      try {
        processedWidgets = await processWidgetsForSave(widgets, userId);
      } catch (error) {
        console.error('Error processing widgets:', error);
        return c.json({ error: 'Failed to process dashboard widgets' }, 500);
      }
    }

    const { data: newDashboard, error } = await supabase
      .from('dashboards')
      .insert({
        user_id: userId,
        name,
        description,
        widgets: processedWidgets,
        layout_config: layout_config || { type: 'grid', columns: 12, rowHeight: 100 },
        theme: theme || {},
        global_filters: global_filters || [],
        refresh_interval,
        is_public: is_public || false,
        folder,
        tags: tags || []
      })
      .select()
      .single();

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ data: newDashboard as Dashboard }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * PUT /api/dashboards/:id
 * Update an existing dashboard
 */
dashboards.put('/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const userId = c.get('userId') as string;
    const body = await c.req.json<UpdateDashboardInput>();

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;

    // Process widgets if provided
    if (body.widgets !== undefined) {
      if (Array.isArray(body.widgets)) {
        try {
          const processedWidgets = await processWidgetsForSave(body.widgets, userId);
          updateData.widgets = processedWidgets;
        } catch (error) {
          console.error('Error processing widgets:', error);
          return c.json({ error: 'Failed to process dashboard widgets' }, 500);
        }
      } else {
        updateData.widgets = body.widgets;
      }
    }

    if (body.layout_config !== undefined) updateData.layout_config = body.layout_config;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.global_filters !== undefined) updateData.global_filters = body.global_filters;
    if (body.refresh_interval !== undefined) updateData.refresh_interval = body.refresh_interval;
    if (body.is_public !== undefined) updateData.is_public = body.is_public;
    if (body.folder !== undefined) updateData.folder = body.folder;
    if (body.tags !== undefined) updateData.tags = body.tags;

    const { data, error } = await supabase
      .from('dashboards')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ data: data as Dashboard });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * DELETE /api/dashboards/:id
 * Delete a dashboard
 */
dashboards.delete('/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const userId = c.get('userId') as string;

    const { error } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'Dashboard deleted successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /api/dashboards/:id/clone
 * Clone a dashboard
 */
dashboards.post('/:id/clone', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const userId = c.get('userId') as string;
    const body = await c.req.json();

    const { name } = body;

    // Get original dashboard
    const { data: originalDashboard, error: fetchError } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !originalDashboard) {
      return c.json({ error: 'Dashboard not found' }, 404);
    }

    // Create clone
    const { data: clonedDashboard, error: cloneError } = await supabase
      .from('dashboards')
      .insert({
        user_id: userId,
        name: name || `${(originalDashboard as any).name} (Copy)`,
        description: (originalDashboard as any).description,
        widgets: (originalDashboard as any).widgets,
        layout_config: (originalDashboard as any).layout_config,
        theme: (originalDashboard as any).theme,
        global_filters: (originalDashboard as any).global_filters,
        refresh_interval: (originalDashboard as any).refresh_interval,
        is_public: false,
        folder: (originalDashboard as any).folder,
        tags: (originalDashboard as any).tags
      })
      .select()
      .single();

    if (cloneError) {
      return c.json({ error: cloneError.message }, 400);
    }

    return c.json({
      data: clonedDashboard as Dashboard,
      message: 'Dashboard cloned successfully'
    }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/dashboards/public/:shareToken
 * Get public dashboard by share token (no auth required)
 */
dashboards.get('/public/:shareToken', async (c) => {
  try {
    const { shareToken } = c.req.param();

    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('share_token', shareToken)
      .eq('is_public', true)
      .single();

    if (error) {
      return c.json({ error: 'Dashboard not found or not public' }, 404);
    }

    // Increment view count
    await supabase
      .from('dashboards')
      .update({
        view_count: ((data as any).view_count || 0) + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', (data as any).id);

    return c.json({ data: data as Dashboard });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/dashboards/:id/versions
 * Get dashboard version history
 */
dashboards.get('/:id/versions', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const userId = c.get('userId') as string;

    // Verify dashboard ownership
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (dashboardError || !dashboard) {
      return c.json({ error: 'Dashboard not found' }, 404);
    }

    // Get versions
    const { data: versions, error } = await supabase
      .from('dashboard_versions')
      .select('*')
      .eq('dashboard_id', id)
      .order('version_number', { ascending: false });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ data: versions });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /api/dashboards/:id/restore-version
 * Restore dashboard to a previous version
 */
dashboards.post('/:id/restore-version', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const userId = c.get('userId') as string;
    const body = await c.req.json();

    const { version_number } = body;

    if (!version_number) {
      return c.json({ error: 'version_number is required' }, 400);
    }

    // Get version
    const { data: version, error: versionError } = await supabase
      .from('dashboard_versions')
      .select('*')
      .eq('dashboard_id', id)
      .eq('version_number', version_number)
      .single();

    if (versionError || !version) {
      return c.json({ error: 'Version not found' }, 404);
    }

    // Restore dashboard
    const { data: restoredDashboard, error: restoreError } = await supabase
      .from('dashboards')
      .update({
        name: (version as any).name,
        widgets: (version as any).widgets,
        layout_config: (version as any).layout_config,
        theme: (version as any).theme
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (restoreError) {
      return c.json({ error: restoreError.message }, 400);
    }

    return c.json({
      data: restoredDashboard as Dashboard,
      message: `Restored to version ${version_number}`
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default dashboards;
```
