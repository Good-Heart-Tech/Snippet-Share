// Removed import for '@cloudflare/workers-types' as types are globally available in Workers environment

export interface Env {
  SNIPPETS: KVNamespace;
  PAGE_TITLE?: string;
  BACKGROUND_COLOR?: string;
  FONT_COLOR?: string;
  ACCENT_COLOR?: string;
  WELCOME_MESSAGE?: string;
}

export interface Snippet {
  value: string;
  expiresAt: number; // timestamp in ms
  remainingViews: number;
  createdAt: number;
  maxViews: number;
}

function renderHTML(
  env: Env,
  content: string,
  { title }: { title?: string } = {}
): Response {
  const pageTitle = env.PAGE_TITLE || 'Snippet Share';
  const backgroundColor = env.BACKGROUND_COLOR || '#091D20';
  const fontColor = env.FONT_COLOR || '#FFFFFF';
  const accentColor = env.ACCENT_COLOR || '#7189ff';
  const welcomeMessage = env.WELCOME_MESSAGE || '';
  return new Response(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title || pageTitle}</title>
    <style>
      body { background: ${backgroundColor}; color: ${fontColor}; font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 2rem auto; background: #13232e; border-radius: 12px; box-shadow: 0 2px 12px #0002; padding: 2rem; }
      h1 { color: ${accentColor}; }
      .accent { color: ${accentColor}; }
      .codebox { background: #222; color: #fff; border-radius: 8px; padding: 1rem; font-family: 'Fira Mono', monospace; margin: 1rem 0; position: relative; }
      .copy-btn { background: ${accentColor}; color: #fff; border: none; border-radius: 6px; padding: 0.5rem 1rem; cursor: pointer; margin-left: 0.5rem; }
      .input, select { width: 100%; padding: 0.5rem; margin: 0.5rem 0 1rem 0; border-radius: 6px; border: 1px solid #333; background: #181f2a; color: #fff; }
      .label { font-weight: bold; margin-top: 1rem; display: block; }
      .info { color: #aaa; font-size: 0.95em; margin-bottom: 1rem; }
      .error { color: #ff6b6b; margin-bottom: 1rem; }
      .success { color: #4caf50; margin-bottom: 1rem; }
      .row { display: flex; gap: 1rem; }
      @media (max-width: 600px) { .container { padding: 1rem; } }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${pageTitle}</h1>
      <div class="info">${welcomeMessage}</div>
      ${content}
    </div>
    <script>
      function copyToClipboard(id) {
        const el = document.getElementById(id);
        navigator.clipboard.writeText(el.innerText || el.value);
      }
    </script>
  </body>
  </html>`, {
    headers: { 'content-type': 'text/html; charset=UTF-8' },
  });
}

function daysBetween(a: number, b: number) {
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
}

function isValidSlug(slug: string) {
  return /^[a-zA-Z0-9_-]{3,32}$/.test(slug);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+/, '');
    if (request.method === 'GET' && (path === '' || path === 'new')) {
      // Show create form
      return renderHTML(env, `
        <form method="POST" action="/new">
          <label class="label">Snippet Slug (unique, 3-32 chars):</label>
          <input class="input" name="slug" required pattern="[a-zA-Z0-9_-]{3,32}" maxlength="32" minlength="3" placeholder="e.g. my-secret" />
          <label class="label">Snippet Text:</label>
          <textarea class="input" name="value" required rows="6" maxlength="5000" placeholder="Paste your snippet here..."></textarea>
          <div class="row">
            <div style="flex:1">
              <label class="label">Expire After (days):</label>
              <input class="input" type="number" name="days" min="1" max="90" value="7" />
            </div>
            <div style="flex:1">
              <label class="label">Expire After (views):</label>
              <input class="input" type="number" name="views" min="1" max="30" value="7" />
            </div>
          </div>
          <button class="copy-btn" type="submit">Create Snippet</button>
        </form>
      `);
    }
    if (request.method === 'POST' && path === 'new') {
      // Handle snippet creation
      const form = await request.formData();
      const slug = (form.get('slug') || '').toString().trim();
      const value = (form.get('value') || '').toString();
      let days = parseInt((form.get('days') || '7').toString(), 10);
      let views = parseInt((form.get('views') || '7').toString(), 10);
      if (!isValidSlug(slug)) {
        return renderHTML(env, `<div class="error">Invalid slug. Use 3-32 letters, numbers, - or _ only.</div>`, { title: 'Error' });
      }
      if (!value || value.length > 5000) {
        return renderHTML(env, `<div class="error">Snippet text required (max 5000 chars).</div>`, { title: 'Error' });
      }
      days = Math.max(1, Math.min(90, days));
      views = Math.max(1, Math.min(30, views));
      // Check if slug exists
      const existing = await env.SNIPPETS.get(slug);
      if (existing) {
        return renderHTML(env, `<div class="error">Slug already taken. Please choose another.</div>`, { title: 'Error' });
      }
      const now = Date.now();
      const expiresAt = now + days * 24 * 60 * 60 * 1000;
      const snippet: Snippet = {
        value,
        expiresAt,
        remainingViews: views,
        createdAt: now,
        maxViews: views,
      };
      await env.SNIPPETS.put(slug, JSON.stringify(snippet), { expiration: Math.floor(expiresAt / 1000) });
      const link = `${url.origin.replace(/\/$/, '')}/${slug}`;
      return renderHTML(env, `
        <div class="success">Snippet created!</div>
        <div>Share this link:</div>
        <div class="codebox" id="linkbox">${link}</div>
        <button class="copy-btn" onclick="copyToClipboard('linkbox')">Copy Link</button>
        <div style="margin-top:2rem;"><a href="/">Create another snippet</a></div>
      `, { title: 'Snippet Created' });
    }
    // Handle viewing a snippet
    if (request.method === 'GET' && isValidSlug(path)) {
      const snippetRaw = await env.SNIPPETS.get(path);
      if (!snippetRaw) {
        return renderHTML(env, `<div class="error">Snippet not found or expired.</div>`, { title: 'Not Found' });
      }
      let snippet: Snippet;
      try {
        snippet = JSON.parse(snippetRaw);
      } catch {
        await env.SNIPPETS.delete(path);
        return renderHTML(env, `<div class="error">Snippet corrupted or expired.</div>`, { title: 'Error' });
      }
      const now = Date.now();
      const daysLeft = Math.max(0, daysBetween(now, snippet.expiresAt));
      if (snippet.expiresAt < now || snippet.remainingViews <= 0) {
        await env.SNIPPETS.delete(path);
        return renderHTML(env, `<div class="error">Snippet expired.</div>`, { title: 'Expired' });
      }
      // Decrement view count
      snippet.remainingViews -= 1;
      if (snippet.remainingViews <= 0) {
        await env.SNIPPETS.delete(path);
      } else {
        await env.SNIPPETS.put(path, JSON.stringify(snippet), { expiration: Math.floor(snippet.expiresAt / 1000) });
      }
      return renderHTML(env, `
        <div class="info">Views left: <span class="accent">${snippet.remainingViews}</span> &nbsp; | &nbsp; Days left: <span class="accent">${daysLeft}</span></div>
        <div class="codebox" id="snippetbox">${snippet.value.replace(/</g, '&lt;')}</div>
        <button class="copy-btn" onclick="copyToClipboard('snippetbox')">Copy Snippet</button>
        <div style="margin-top:2rem;"><a href="/">Create your own snippet</a></div>
      `, { title: 'View Snippet' });
    }
    // Fallback 404
    return renderHTML(env, `<div class="error">Page not found.</div>`, { title: '404 Not Found' });
  },
};
