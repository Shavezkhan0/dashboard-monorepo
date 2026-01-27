import { Hono } from 'hono';
import { supabaseAdmin } from '../lib/supabase';
import type { AuthContext } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';

const dataSources = new Hono<{ Variables: AuthContext['Variables'] }>();

// Get all data sources for current user
dataSources.get('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');

    const { data, error } = await supabaseAdmin
      .from('data_sources')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      return c.json(
        { error: 'Database Error', message: error.message },
        500
      );
    }

    return c.json({ data: data || [] });
  } catch (error: any) {
    return c.json(
      { error: 'Internal Server Error', message: error.message },
      500
    );
  }
});

// Get single data source
dataSources.get('/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const dataSourceId = c.req.param('id');

    const { data, error } = await supabaseAdmin
      .from('data_sources')
      .select('*')
      .eq('id', dataSourceId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return c.json(
        { error: 'Not Found', message: 'Data source not found' },
        404
      );
    }

    return c.json({ data });
  } catch (error: any) {
    return c.json(
      { error: 'Internal Server Error', message: error.message },
      500
    );
  }
});

// Get data source data
dataSources.get('/:id/data', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const dataSourceId = c.req.param('id');

    const { data, error } = await supabaseAdmin
      .from('data_sources')
      .select('data')
      .eq('id', dataSourceId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return c.json(
        { error: 'Not Found', message: 'Data source not found' },
        404
      );
    }

    return c.json({ data: data.data });
  } catch (error: any) {
    return c.json(
      { error: 'Internal Server Error', message: error.message },
      500
    );
  }
});

// Create data source
dataSources.post('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { name, type, connectionString, data, config } = body;

    if (!name || !type) {
      return c.json(
        { error: 'Bad Request', message: 'Name and type are required' },
        400
      );
    }

    const { data: newDataSource, error } = await supabaseAdmin
      .from('data_sources')
      .insert({
        user_id: userId,
        name,
        type,
        connection_string: connectionString || null,
        data: data || null,
        config: config || null,
      })
      .select()
      .single();

    if (error) {
      return c.json(
        { error: 'Database Error', message: error.message },
        500
      );
    }

    return c.json({ data: newDataSource }, 201);
  } catch (error: any) {
    return c.json(
      { error: 'Internal Server Error', message: error.message },
      500
    );
  }
});

// Update data source
dataSources.put('/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const dataSourceId = c.req.param('id');
    const body = await c.req.json();

    // Verify ownership
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('data_sources')
      .select('id')
      .eq('id', dataSourceId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existing) {
      return c.json(
        { error: 'Not Found', message: 'Data source not found' },
        404
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.connectionString !== undefined)
      updateData.connection_string = body.connectionString;
    if (body.data !== undefined) updateData.data = body.data;
    if (body.config !== undefined) updateData.config = body.config;

    const { data, error } = await supabaseAdmin
      .from('data_sources')
      .update(updateData)
      .eq('id', dataSourceId)
      .select()
      .single();

    if (error) {
      return c.json(
        { error: 'Database Error', message: error.message },
        500
      );
    }

    return c.json({ data });
  } catch (error: any) {
    return c.json(
      { error: 'Internal Server Error', message: error.message },
      500
    );
  }
});

// Delete data source
dataSources.delete('/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const dataSourceId = c.req.param('id');

    // Verify ownership
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('data_sources')
      .select('id')
      .eq('id', dataSourceId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existing) {
      return c.json(
        { error: 'Not Found', message: 'Data source not found' },
        404
      );
    }

    const { error } = await supabaseAdmin
      .from('data_sources')
      .delete()
      .eq('id', dataSourceId);

    if (error) {
      return c.json(
        { error: 'Database Error', message: error.message },
        500
      );
    }

    return c.json({ data: null }, 204);
  } catch (error: any) {
    return c.json(
      { error: 'Internal Server Error', message: error.message },
      500
    );
  }
});

export default dataSources;
