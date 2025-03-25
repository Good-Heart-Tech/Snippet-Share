import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { Context, Next } from 'hono';

interface Env {
  SNIPPETS: KVNamespace;
  ALLOWED_ORIGINS: string;
}

interface Snippet {
  content: string;
  expiration: string;
  createdAt: string;
}

const app = new Hono<{ Bindings: Env }>();

// Configure CORS with dynamic allowed origins
app.use('*', async (c: Context, next: Next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS.split(',');
  const origin = c.req.header('Origin');
  
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type');
    c.header('Access-Control-Max-Age', '600');
    c.header('Access-Control-Allow-Credentials', 'true');

    if (c.req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }
  }
  
  await next();
});

app.use('*', prettyJSON());

// Create a new snippet
app.post('/api/snippets', async (c: Context) => {
  const { id, content, expiration } = await c.req.json();

  if (!id || !content || !expiration) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const snippet: Snippet = {
    content,
    expiration,
    createdAt: new Date().toISOString(),
  };

  await c.env.SNIPPETS.put(id, JSON.stringify(snippet), {
    expirationTtl: getExpirationTtl(expiration),
  });

  return c.json({ id });
});

// Get a snippet by ID
app.get('/api/snippets/:id', async (c: Context) => {
  const id = c.req.param('id');
  const snippet = await c.env.SNIPPETS.get(id);

  if (!snippet) {
    return c.json({ error: 'Snippet not found' }, 404);
  }

  // If expiration is 'view', delete the snippet after retrieving it
  const parsedSnippet = JSON.parse(snippet) as Snippet;
  if (parsedSnippet.expiration === 'view') {
    await c.env.SNIPPETS.delete(id);
  }

  return c.json(parsedSnippet);
});

// Helper function to convert expiration string to TTL in seconds
function getExpirationTtl(expiration: string): number {
  switch (expiration) {
    case '10min':
      return 600; // 10 minutes
    case '1hour':
      return 3600; // 1 hour
    case '1day':
      return 86400; // 1 day
    case '1week':
      return 604800; // 1 week
    case '1month':
      return 2592000; // 30 days
    case 'view':
      return 0; // No TTL, will be deleted after first view
    default:
      return 0;
  }
}

export default app; 