/**
 * Main API Server Entry Point
 * Hono server with all routes registered
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

// Import routes
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboards';
import dataSourceRoutes from './routes/data-sources';
import adminRoutes from './routes/admin';

// Import NEW routes
import datasetRoutes from './routes/datasets';
import chartRoutes from './routes/charts';

const app = new Hono();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS configuration
app.use('/*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    // Add your production frontend URLs
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${c.req.method} ${c.req.url} - ${ms}ms`);
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Dashboard Builder API v2.0',
    endpoints: {
      auth: '/api/auth',
      datasets: '/api/datasets',
      charts: '/api/charts',
      dashboards: '/api/dashboards',
      dataSources: '/api/data-sources',
      admin: '/api/admin'
    }
  });
});

// Register route groups
app.route('/api/auth', authRoutes);
app.route('/api/datasets', datasetRoutes);        // NEW
app.route('/api/charts', chartRoutes);            // NEW
app.route('/api/dashboards', dashboardRoutes);
app.route('/api/data-sources', dataSourceRoutes);
app.route('/api/admin', adminRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    path: c.req.url
  }, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error('Server Error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message
  }, 500);
});

// ============================================================================
// START SERVER
// ============================================================================

const port = parseInt(process.env.PORT || '4000');

console.log(`🚀 Starting Dashboard Builder API v2.0...`);
console.log(`📊 Professional Architecture: Datasets → Charts → Dashboards`);
console.log(`🔗 Server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});