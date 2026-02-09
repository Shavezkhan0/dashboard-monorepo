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
  DashboardWithCharts
} from '@dashboard/shared-types';

const dashboards = new Hono();

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

    // Validate widgets are in new format (must have chartId for chart widgets)
    if (widgets && Array.isArray(widgets)) {
      for (const widget of widgets) {
        if (widget.type === 'chart' && !widget.chartId) {
          return c.json({
            error: 'Invalid widget format. Chart widgets must have chartId. Please save charts first.'
          }, 400);
        }
      }
    }

    const { data: newDashboard, error } = await supabase
      .from('dashboards')
      .insert({
        user_id: userId,
        name,
        description,
        widgets: widgets || [],
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

    // Validate widgets if provided
    if (body.widgets !== undefined) {
      if (Array.isArray(body.widgets)) {
        for (const widget of body.widgets) {
          if (widget.type === 'chart' && !widget.chartId) {
            return c.json({
              error: 'Invalid widget format. Chart widgets must have chartId. Please save charts first.'
            }, 400);
          }
        }
      }
      updateData.widgets = body.widgets;
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