import { Hono } from 'hono';
import { supabaseAdmin } from '../lib/supabase';
import type { AuthContext } from '../middleware/auth';
import { adminMiddleware } from '../middleware/auth';

const admin = new Hono<{ Variables: AuthContext['Variables'] }>();

// Get admin stats
admin.get('/stats', adminMiddleware, async (c) => {
  try {
    const [usersResult, dashboardsResult, dataSourcesResult] = await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('dashboards')
        .select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('data_sources')
        .select('id', { count: 'exact', head: true }),
    ]);

    return c.json({
      data: {
        totalUsers: usersResult.count || 0,
        totalDashboards: dashboardsResult.count || 0,
        totalDataSources: dataSourcesResult.count || 0,
        recentActivity: [], // Can be implemented later
      },
    });
  } catch (error: any) {
    return c.json(
      { error: 'Internal Server Error', message: error.message },
      500
    );
  }
});

// Get all users
admin.get('/users', adminMiddleware, async (c) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

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

// Get all dashboards
admin.get('/dashboards', adminMiddleware, async (c) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('dashboards')
      .select('*')
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

export default admin;
