import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './routes/auth';
import dashboards from './routes/dashboards';
import dataSources from './routes/data-sources';
import admin from './routes/admin';

const app = new Hono();

// CORS middleware
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.route('/api/auth', auth);
app.route('/api/dashboards', dashboards);
app.route('/api/data-sources', dataSources);
app.route('/api/admin', admin);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: 'Route not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    { error: 'Internal Server Error', message: err.message },
    500
  );
});

const port = Number(process.env.PORT) || 4000;

import { serve } from '@hono/node-server';

// ... (existing imports)

// Start server - works with both Bun and Node.js via tsx
if (typeof Bun !== 'undefined') {
  Bun.serve({
    port,
    fetch: app.fetch,
  });
  console.log(`🚀 Server running on http://localhost:${port}`);
} else {
  // For Node.js with tsx
  console.log(`🚀 Server starting on port ${port}...`);
  serve({
    fetch: app.fetch,
    port,
  }, (info) => {
    console.log(`🚀 Server running on http://localhost:${info.port}`);
  });
}

export default {
  port,
  fetch: app.fetch,
};
