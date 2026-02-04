import { Hono } from 'hono';
import { supabaseAdmin } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';

const auth = new Hono<{ Variables: { userId?: string; userEmail?: string } }>();

// Register
auth.post('/register', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.json(
        { error: 'Bad Request', message: 'Email and password are required' },
        400
      );
    }

    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
      },
    });

    if (error) {
      return c.json({ error: 'Registration failed', message: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: 'Registration failed', message: 'User not created' }, 500);
    }

    // Create user record in users table
    const { error: userError } = await supabaseAdmin.from('users').insert({
      id: data.user.id,
      email: data.user.email!,
      name: name || null,
      role: 'user',
    });

    if (userError) {
      console.error('Error creating user record:', userError);
    }

    // Get session token
    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

    if (sessionError || !sessionData.session) {
      return c.json(
        { error: 'Login failed', message: 'Could not create session' },
        500
      );
    }

    // Set token expiration to 5 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 5);

    return c.json({
      data: {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: name || null,
        },
        token: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
        expiresAt: expiresAt.toISOString(),
        expiresIn: 5 * 24 * 60 * 60, // 5 days in seconds
      },
    });
  } catch (error: any) {
    return c.json(
      { error: 'Internal Server Error', message: error.message },
      500
    );
  }
});

// Login
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json(
        { error: 'Bad Request', message: 'Email and password are required' },
        400
      );
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return c.json(
        { error: 'Authentication failed', message: error?.message || 'Invalid credentials' },
        401
      );
    }

    // Get user data from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
    }

    // Set token expiration to 5 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 5);

    return c.json({
      data: {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: userData?.name || null,
          role: userData?.role || 'user',
        },
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: expiresAt.toISOString(),
        expiresIn: 5 * 24 * 60 * 60, // 5 days in seconds
      },
    });
  } catch (error: any) {
    return c.json(
      { error: 'Internal Server Error', message: error.message },
      500
    );
  }
});

// Refresh token
auth.post('/refresh', async (c) => {
  try {
    const { refreshToken } = await c.req.json();

    if (!refreshToken) {
      return c.json(
        { error: 'Bad Request', message: 'Refresh token is required' },
        400
      );
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      return c.json(
        { error: 'Token refresh failed', message: error?.message || 'Invalid refresh token' },
        401
      );
    }

    // Get user data from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
    }

    // Set new token expiration to 5 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 5);

    return c.json({
      data: {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: userData?.name || null,
          role: userData?.role || 'user',
        },
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: expiresAt.toISOString(),
        expiresIn: 5 * 24 * 60 * 60, // 5 days in seconds
      },
    });
  } catch (error: any) {
    return c.json(
      { error: 'Internal Server Error', message: error.message },
      500
    );
  }
});

// Get current user
auth.get('/me', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');

    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      return c.json({ error: 'Not Found', message: 'User not found' }, 404);
    }

    return c.json({
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      },
    });
  } catch (error: any) {
    return c.json(
      { error: 'Internal Server Error', message: error.message },
      500
    );
  }
});

export default auth;
