/**
 * Charts API Routes
 * Handles chart CRUD operations and templates
 */

import { Hono } from 'hono';
import { supabase } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import type {
    Chart,
    CreateChartInput,
    UpdateChartInput,
    ChartWithData
} from '@dashboard/shared-types';

const charts = new Hono();

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/charts
 * List all charts for the authenticated user
 * Optional filters: ?dataset_id=xxx&type=bar&is_template=true
 */
charts.get('/', authMiddleware, async (c) => {
    try {
        const userId = c.get('userId') as string;
        const { dataset_id, type, is_template } = c.req.query();

        let query = supabase
            .from('charts')
            .select('*')
            .eq('user_id', userId);

        // Optional filters
        if (dataset_id) {
            query = query.eq('dataset_id', dataset_id);
        }
        if (type) {
            query = query.eq('type', type);
        }
        if (is_template) {
            query = query.eq('is_template', is_template === 'true');
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return c.json({ error: error.message }, 400);
        }

        return c.json({ data: data as Chart[] });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * GET /api/charts/:id
 * Get a single chart by ID
 */
charts.get('/:id', authMiddleware, async (c) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('userId') as string;

        const { data, error } = await supabase
            .from('charts')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            return c.json({ error: 'Chart not found' }, 404);
        }

        return c.json({ data: data as Chart });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * GET /api/charts/:id/with-data
 * Get chart with its associated dataset
 */
charts.get('/:id/with-data', authMiddleware, async (c) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('userId') as string;

        // Get chart
        const { data: chart, error: chartError } = await supabase
            .from('charts')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (chartError) {
            return c.json({ error: 'Chart not found' }, 404);
        }

        // Get associated dataset
        const { data: dataset, error: datasetError } = await supabase
            .from('datasets')
            .select('*')
            .eq('id', (chart as any).dataset_id)
            .eq('user_id', userId)
            .single();

        const chartWithData: ChartWithData = {
            ...chart as Chart,
            dataset: datasetError ? undefined : {
                id: dataset.id,
                name: dataset.name,
                data: dataset.data,
                columns: dataset.columns
            }
        };

        return c.json({ data: chartWithData });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * GET /api/charts/templates
 * Get all chart templates
 */
charts.get('/templates', async (c) => {
    try {
        const { category } = c.req.query();

        let query = supabase
            .from('charts')
            .select('*')
            .eq('is_template', true);

        if (category) {
            query = query.eq('template_category', category);
        }

        const { data, error } = await query.order('name');

        if (error) {
            return c.json({ error: error.message }, 400);
        }

        return c.json({ data: data as Chart[] });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * POST /api/charts
 * Create a new chart
 */
charts.post('/', authMiddleware, async (c) => {
    try {
        const userId = c.get('userId') as string;
        const body = await c.req.json<CreateChartInput>();

        const {
            name,
            description,
            dataset_id,
            type,
            data_mapping,
            chart_config,
            is_template,
            template_category,
            tags,
            folder
        } = body;

        // Validate required fields
        if (!name || !dataset_id || !type || !data_mapping) {
            return c.json({
                error: 'Missing required fields: name, dataset_id, type, data_mapping'
            }, 400);
        }

        // Verify dataset exists and belongs to user
        const { data: dataset, error: datasetError } = await supabase
            .from('datasets')
            .select('id')
            .eq('id', dataset_id)
            .eq('user_id', userId)
            .single();

        if (datasetError || !dataset) {
            return c.json({ error: 'Dataset not found' }, 404);
        }

        const { data: newChart, error } = await supabase
            .from('charts')
            .insert({
                user_id: userId,
                dataset_id,
                name,
                description,
                type,
                data_mapping,
                chart_config: chart_config || {},
                is_template: is_template || false,
                template_category,
                tags: tags || [],
                folder
            })
            .select()
            .single();

        if (error) {
            return c.json({ error: error.message }, 400);
        }

        return c.json({ data: newChart as Chart }, 201);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * PUT /api/charts/:id
 * Update an existing chart
 */
charts.put('/:id', authMiddleware, async (c) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('userId') as string;
        const body = await c.req.json<UpdateChartInput>();

        const updateData: any = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.type !== undefined) updateData.type = body.type;
        if (body.data_mapping !== undefined) updateData.data_mapping = body.data_mapping;
        if (body.chart_config !== undefined) updateData.chart_config = body.chart_config;
        if (body.is_template !== undefined) updateData.is_template = body.is_template;
        if (body.template_category !== undefined) updateData.template_category = body.template_category;
        if (body.tags !== undefined) updateData.tags = body.tags;
        if (body.folder !== undefined) updateData.folder = body.folder;

        const { data, error } = await supabase
            .from('charts')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            return c.json({ error: error.message }, 400);
        }

        return c.json({ data: data as Chart });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * DELETE /api/charts/:id
 * Delete a chart
 */
charts.delete('/:id', authMiddleware, async (c) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('userId') as string;

        // Note: Dashboards will need to handle missing charts gracefully
        const { error } = await supabase
            .from('charts')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            return c.json({ error: error.message }, 400);
        }

        return c.json({ message: 'Chart deleted successfully' });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * POST /api/charts/:id/clone
 * Clone a chart (useful for templates or duplicating charts)
 */
charts.post('/:id/clone', authMiddleware, async (c) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('userId') as string;
        const body = await c.req.json();

        const { dataset_id, name } = body;

        // Get original chart (can be template or user's chart)
        const { data: originalChart, error: fetchError } = await supabase
            .from('charts')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !originalChart) {
            return c.json({ error: 'Chart not found' }, 404);
        }

        // Create clone
        const { data: clonedChart, error: cloneError } = await supabase
            .from('charts')
            .insert({
                user_id: userId,
                dataset_id: dataset_id || (originalChart as any).dataset_id,
                name: name || `${(originalChart as any).name} (Copy)`,
                description: (originalChart as any).description,
                type: (originalChart as any).type,
                data_mapping: (originalChart as any).data_mapping,
                chart_config: (originalChart as any).chart_config,
                is_template: false,
                tags: (originalChart as any).tags,
                folder: (originalChart as any).folder
            })
            .select()
            .single();

        if (cloneError) {
            return c.json({ error: cloneError.message }, 400);
        }

        return c.json({
            data: clonedChart as Chart,
            message: 'Chart cloned successfully'
        }, 201);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

export default charts;
