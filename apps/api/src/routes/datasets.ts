/**
 * Datasets API Routes
 * Handles dataset CRUD operations and CSV uploads
 */

import { Hono } from 'hono';
import { supabase } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import type {
    Dataset,
    CreateDatasetInput,
    UpdateDatasetInput,
    DatasetColumn
} from '@dashboard/shared-types';

const datasets = new Hono();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Infer column types from data
 */
function inferColumnTypes(data: Record<string, any>[]): DatasetColumn[] {
    if (!data || data.length === 0) return [];

    const firstRow = data[0];
    const columns: DatasetColumn[] = [];

    for (const [key, value] of Object.entries(firstRow)) {
        let type: 'string' | 'number' | 'date' | 'boolean' = 'string';

        if (typeof value === 'number') {
            type = 'number';
        } else if (typeof value === 'boolean') {
            type = 'boolean';
        } else if (typeof value === 'string') {
            // Try to detect date
            const datePattern = /^\d{4}-\d{2}-\d{2}/;
            if (datePattern.test(value)) {
                type = 'date';
            }
        }

        columns.push({
            name: key,
            type,
            nullable: false
        });
    }

    return columns;
}

/**
 * Parse CSV text to JSON
 * Note: In production, use a library like papaparse
 */
function parseCSV(csvText: string): { data: Record<string, any>[], columns: DatasetColumn[] } {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
        return { data: [], columns: [] };
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    // Parse rows
    const data: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, any> = {};

        headers.forEach((header, index) => {
            let value: any = values[index];

            // Try to convert to number
            if (value && !isNaN(Number(value))) {
                value = Number(value);
            }
            // Try to convert to boolean
            else if (value === 'true' || value === 'false') {
                value = value === 'true';
            }

            row[header] = value;
        });

        data.push(row);
    }

    const columns = inferColumnTypes(data);

    return { data, columns };
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/datasets
 * List all datasets for the authenticated user
 */
datasets.get('/', authMiddleware, async (c) => {
    try {
        const userId = c.get('userId') as string;

        const { data, error } = await supabase
            .from('datasets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return c.json({ error: error.message }, 400);
        }

        return c.json({ data: data as Dataset[] });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * GET /api/datasets/:id
 * Get a single dataset by ID
 */
datasets.get('/:id', authMiddleware, async (c) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('userId') as string;

        const { data, error } = await supabase
            .from('datasets')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            return c.json({ error: 'Dataset not found' }, 404);
        }

        return c.json({ data: data as Dataset });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * POST /api/datasets
 * Create a new dataset
 */
datasets.post('/', authMiddleware, async (c) => {
    try {
        const userId = c.get('userId') as string;
        const body = await c.req.json<CreateDatasetInput>();

        const {
            name,
            description,
            data,
            columns,
            data_source_id,
            refresh_schedule,
            auto_refresh,
            tags,
            folder
        } = body;

        // Validate required fields
        if (!name || !data || !columns) {
            return c.json({
                error: 'Missing required fields: name, data, columns'
            }, 400);
        }

        // Validate data is array
        if (!Array.isArray(data)) {
            return c.json({ error: 'Data must be an array of objects' }, 400);
        }

        // Validate columns is array
        if (!Array.isArray(columns)) {
            return c.json({ error: 'Columns must be an array' }, 400);
        }

        const { data: newDataset, error } = await supabase
            .from('datasets')
            .insert({
                user_id: userId,
                name,
                description,
                data,
                columns,
                data_source_id,
                refresh_schedule,
                auto_refresh: auto_refresh || false,
                tags: tags || [],
                folder
            })
            .select()
            .single();

        if (error) {
            return c.json({ error: error.message }, 400);
        }

        return c.json({ data: newDataset as Dataset }, 201);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * PUT /api/datasets/:id
 * Update an existing dataset
 */
datasets.put('/:id', authMiddleware, async (c) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('userId') as string;
        const body = await c.req.json<UpdateDatasetInput>();

        const updateData: any = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.data !== undefined) updateData.data = body.data;
        if (body.columns !== undefined) updateData.columns = body.columns;
        if (body.refresh_schedule !== undefined) updateData.refresh_schedule = body.refresh_schedule;
        if (body.auto_refresh !== undefined) updateData.auto_refresh = body.auto_refresh;
        if (body.tags !== undefined) updateData.tags = body.tags;
        if (body.folder !== undefined) updateData.folder = body.folder;

        const { data, error } = await supabase
            .from('datasets')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            return c.json({ error: error.message }, 400);
        }

        return c.json({ data: data as Dataset });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * DELETE /api/datasets/:id
 * Delete a dataset
 */
datasets.delete('/:id', authMiddleware, async (c) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('userId') as string;

        // Check if dataset is being used by any charts
        const { data: charts } = await supabase
            .from('charts')
            .select('id')
            .eq('dataset_id', id)
            .eq('user_id', userId);

        if (charts && charts.length > 0) {
            return c.json({
                error: `Cannot delete dataset. It is being used by ${charts.length} chart(s)`
            }, 400);
        }

        const { error } = await supabase
            .from('datasets')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            return c.json({ error: error.message }, 400);
        }

        return c.json({ message: 'Dataset deleted successfully' });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * POST /api/datasets/upload/csv
 * Upload and parse CSV file
 */
datasets.post('/upload/csv', authMiddleware, async (c) => {
    try {
        const userId = c.get('userId') as string;
        const formData = await c.req.formData();

        const file = formData.get('file') as File;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string | null;

        if (!file) {
            return c.json({ error: 'No file provided' }, 400);
        }

        // Read file content
        const csvText = await file.text();

        // Parse CSV
        const { data, columns } = parseCSV(csvText);

        if (data.length === 0) {
            return c.json({ error: 'CSV file is empty or invalid' }, 400);
        }

        // Create dataset
        const { data: newDataset, error } = await supabase
            .from('datasets')
            .insert({
                user_id: userId,
                name: name || file.name.replace('.csv', ''),
                description: description || `Uploaded from ${file.name}`,
                data,
                columns,
                tags: ['csv', 'uploaded']
            })
            .select()
            .single();

        if (error) {
            return c.json({ error: error.message }, 400);
        }

        return c.json({
            data: newDataset as Dataset,
            message: `Successfully imported ${data.length} rows`
        }, 201);
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

/**
 * GET /api/datasets/:id/preview
 * Get preview of dataset (first 100 rows)
 */
datasets.get('/:id/preview', authMiddleware, async (c) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('userId') as string;

        const { data: dataset, error } = await supabase
            .from('datasets')
            .select('id, name, columns, data, row_count')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            return c.json({ error: 'Dataset not found' }, 404);
        }

        // Return only first 100 rows for preview
        const previewData = (dataset as any).data.slice(0, 100);

        return c.json({
            data: {
                ...dataset,
                data: previewData,
                total_rows: dataset.row_count,
                preview_rows: previewData.length
            }
        });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

export default datasets;