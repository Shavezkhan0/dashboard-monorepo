import { Hono } from 'hono';
import { supabaseAdmin } from '../lib/supabase';
import type { AuthContext } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';

const dashboards = new Hono<{ Variables: AuthContext['Variables'] }>();

// Get all dashboards for current user
dashboards.get('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');

    const { data, error } = await supabaseAdmin
      .from('dashboards')
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

// Get single dashboard
dashboards.get('/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const dashboardId = c.req.param('id');

    const { data, error } = await supabaseAdmin
      .from('dashboards')
      .select('*')
      .eq('id', dashboardId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return c.json(
        { error: 'Not Found', message: 'Dashboard not found' },
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

// Create dashboard
dashboards.post('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { name, widgets = [], isPublic = false } = body;

    if (!name) {
      return c.json(
        { error: 'Bad Request', message: 'Dashboard name is required' },
        400
      );
    }

    const { data, error } = await supabaseAdmin
      .from('dashboards')
      .insert({
        user_id: userId,
        name,
        widgets: widgets,
        is_public: isPublic,
      })
      .select()
      .single();

    if (error) {
      return c.json(
        { error: 'Database Error', message: error.message },
        500
      );
    }

    return c.json({ data }, 201);
  } catch (error: any) {
    return c.json(
      { error: 'Internal Server Error', message: error.message },
      500
    );
  }
});

// Update dashboard
dashboards.put('/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const dashboardId = c.req.param('id');
    const body = await c.req.json();

    // Verify ownership
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('dashboards')
      .select('id')
      .eq('id', dashboardId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existing) {
      return c.json(
        { error: 'Not Found', message: 'Dashboard not found' },
        404
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.widgets !== undefined) updateData.widgets = body.widgets;
    if (body.isPublic !== undefined) updateData.is_public = body.isPublic;

    const { data, error } = await supabaseAdmin
      .from('dashboards')
      .update(updateData)
      .eq('id', dashboardId)
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

// Delete dashboard
dashboards.delete('/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const dashboardId = c.req.param('id');

    // Verify ownership
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('dashboards')
      .select('id')
      .eq('id', dashboardId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existing) {
      return c.json(
        { error: 'Not Found', message: 'Dashboard not found' },
        404
      );
    }

    const { error } = await supabaseAdmin
      .from('dashboards')
      .delete()
      .eq('id', dashboardId);

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

export default dashboards;
