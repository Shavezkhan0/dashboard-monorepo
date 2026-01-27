import { Context, Next } from 'hono';
import { supabaseAdmin } from '../lib/supabase';

export interface AuthContext extends Context {
  userId?: string;
  userEmail?: string;
}

export async function authMiddleware(c: AuthContext, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing or invalid token' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401);
    }

    c.set('userId', user.id);
    c.set('userEmail', user.email);
    c.userId = user.id;
    c.userEmail = user.email;

    await next();
  } catch (error) {
    return c.json(
      { error: 'Unauthorized', message: 'Token verification failed' },
      401
    );
  }
}

export async function adminMiddleware(c: AuthContext, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing or invalid token' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401);
    }

    // Check if user is admin (you'll need to implement this based on your user table)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return c.json({ error: 'Forbidden', message: 'Admin access required' }, 403);
    }

    c.set('userId', user.id);
    c.set('userEmail', user.email);
    c.userId = user.id;
    c.userEmail = user.email;

    await next();
  } catch (error) {
    return c.json(
      { error: 'Unauthorized', message: 'Token verification failed' },
      401
    );
  }
}
