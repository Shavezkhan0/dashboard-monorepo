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
  console.log('🔄 Processing widgets for save. Total widgets:', widgets.length);
  console.log('🔄 Widget types:', widgets.map(w => `${w.type}(${w.id})`).join(', '));

  const processedWidgets: DashboardWidget[] = [];

  for (const widget of widgets) {
    // Check if this is an old Widget format that needs conversion
    const isOldFormat = widget.props && !widget.chartId;
    const isChartWidget = ['line', 'pie', 'bar', 'histogram', 'areachart', 'donut', 'funnel', 'scatter', 'gauge', 'treemap', 'bubble', 'waterfall', 'kpi'].includes(widget.type);

    console.log(`\n🔍 Processing widget: ${widget.id}, type: ${widget.type}, isChartWidget: ${isChartWidget}, isOldFormat: ${isOldFormat}`);

    if (isChartWidget && isOldFormat) {
      console.log('🔎 Widget props structure:', JSON.stringify(widget.props, null, 2));

      // Extract dataset
      const datasetInfo = extractDatasetFromWidget(widget);

      if (!datasetInfo) {
        console.log('⚠️ extractDatasetFromWidget returned null for widget:', widget.id);
        console.log('⚠️ Widget has props.data?', !!widget.props?.data);
        console.log('⚠️ Widget has props.dataSet?.data?', !!widget.props?.dataSet?.data);
        console.log('⚠️ Widget has props.dataset?.data?', !!widget.props?.dataset?.data);
      }

      if (datasetInfo) {
        console.log('📊 Extracting dataset for widget:', widget.id, 'Type:', widget.type);
        console.log('📊 Dataset info:', { name: datasetInfo.name, rowCount: datasetInfo.data.length });

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
          console.error('❌ Error saving dataset:', datasetError);
          // Skip this widget if dataset save fails
          continue;
        }

        console.log('✅ Dataset saved successfully! ID:', savedDataset.id);

        // Extract chart config
        const chartConfig = extractChartConfigFromWidget(widget, savedDataset.id);
        console.log('📈 Chart config extracted:', { name: chartConfig.name, type: chartConfig.type, datasetId: savedDataset.id });

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
          console.error('❌ Error saving chart:', chartError);
          continue;
        }

        console.log('✅ Chart saved successfully! ID:', savedChart.id);

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