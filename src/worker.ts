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
    <link rel="icon" type="image/svg+xml" href="https://graphics.goodhearttech.org/GHT/favicons/favicon.svg" />
    <title>${title || pageTitle}</title>
    <style>
      html, body, *, *:before, *:after { box-sizing: border-box; }
      body { background: ${backgroundColor}; color: ${accentColor}; font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
      a { color: ${accentColor}; text-decoration: underline; }
      h1 { color: ${accentColor}; font-size: 2.5rem; }
      .main-content { max-width: 1300px; margin: 2rem auto; padding-left: max(env(safe-area-inset-left), 1.5rem); padding-right: max(env(safe-area-inset-right), 1.5rem); min-width: 0; box-sizing: border-box; }
      .accent { color: ${accentColor}; }
      .codebox { background: #222; color: #fff; border-radius: 8px; padding: 1.2rem; font-family: 'Fira Mono', monospace; margin: 1.5rem 0; position: relative; font-size: 1.1rem; border: 2px solid ${accentColor}; }
      .copy-btn { background: ${accentColor}; color: #000; border: none; border-radius: 6px; padding: 0.6rem 1.2rem; cursor: pointer; margin-left: 0.5rem; font-size: 1rem; transition: background 0.2s, color 0.2s; position: relative; display: inline-flex; align-items: center; gap: 0.5em; }
      .copy-btn.copied { background: #4caf50 !important; color: #fff !important; }
      .form-btn-row { padding-top: 1.5rem; }
      .input, select { width: 100%; max-width: 100%; min-width: 0; padding: 0.7rem; margin: 0.5rem 0 1.2rem 0; border-radius: 6px; border: 2px solid ${accentColor}; background: #181f2a; color: ${accentColor}; font-size: 1.1rem; box-sizing: border-box; }
      .label { font-weight: bold; margin-top: 1rem; display: block; font-size: 1.1rem; color: #fff; }
      .info { color: #aaa; font-size: 1.05em; margin-bottom: 1.2rem; }
      .error { color: #ff6b6b; margin-bottom: 1.2rem; font-size: 1.1rem; }
      .success { color: #4caf50; margin-bottom: 1.2rem; font-size: 1.1rem; }
      .row { display: flex; gap: 2rem; }
      .tooltip {
        position: relative;
        display: inline-block;
        cursor: pointer;
      }
      .tooltip .tooltiptext {
        visibility: hidden;
        width: 260px;
        background-color: #222;
        color: #fff;
        text-align: left;
        border-radius: 6px;
        padding: 0.7rem;
        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 50%;
        margin-left: -130px;
        opacity: 0;
        transition: opacity 0.2s;
        font-size: 1rem;
      }
      .tooltip:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
      }
      @media (max-width: 1100px) { .row { flex-direction: column; gap: 0; } }
      @media (max-width: 700px) {
        .main-content {
          max-width: 100vw;
          padding-left: max(env(safe-area-inset-left), 0.5rem);
          padding-right: max(env(safe-area-inset-right), 0.5rem);
        }
        html, body { overflow-x: hidden; }
      }
      .slider {
        width: 100%;
        margin: 0.7rem 0 1.2rem 0;
        accent-color: ${fontColor};
        height: 2.5px;
        background: ${fontColor};
        border-radius: 2px;
        outline: none;
        transition: background 0.2s;
        cursor: pointer;
      }
      .slider::-webkit-slider-thumb {
        appearance: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${accentColor} 60%, #fff 100%);
        cursor: grab;
        box-shadow: 0 2px 12px #0006, 0 0 0 3px #fff4;
        border: 3px solid #fff;
        transition: background 0.2s, border 0.2s, box-shadow 0.2s;
        outline: 2px solid ${accentColor};
      }
      .slider:active::-webkit-slider-thumb {
        background: linear-gradient(135deg, #fff 40%, ${accentColor} 100%);
        border: 3px solid ${accentColor};
        box-shadow: 0 2px 16px #0008, 0 0 0 4px ${accentColor}44;
      }
      .slider::-moz-range-thumb {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${accentColor} 60%, #fff 100%);
        cursor: grab;
        box-shadow: 0 2px 12px #0006, 0 0 0 3px #fff4;
        border: 3px solid #fff;
        transition: background 0.2s, border 0.2s, box-shadow 0.2s;
        outline: 2px solid ${accentColor};
      }
      .slider:active::-moz-range-thumb {
        background: linear-gradient(135deg, #fff 40%, ${accentColor} 100%);
        border: 3px solid ${accentColor};
        box-shadow: 0 2px 16px #0008, 0 0 0 4px ${accentColor}44;
      }
      .slider::-ms-thumb {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${accentColor} 60%, #fff 100%);
        cursor: grab;
        box-shadow: 0 2px 12px #0006, 0 0 0 3px #fff4;
        border: 3px solid #fff;
        transition: background 0.2s, border 0.2s, box-shadow 0.2s;
        outline: 2px solid ${accentColor};
      }
      .slider:active::-ms-thumb {
        background: linear-gradient(135deg, #fff 40%, ${accentColor} 100%);
        border: 3px solid ${accentColor};
        box-shadow: 0 2px 16px #0008, 0 0 0 4px ${accentColor}44;
      }
      .slider::-webkit-slider-runnable-track {
        height: 2.5px;
        background: ${fontColor};
        border-radius: 2px;
      }
      .slider::-ms-fill-lower {
        background: ${fontColor};
      }
      .slider::-ms-fill-upper {
        background: ${fontColor};
      }
    </style>
  </head>
  <body>
    <div class="main-content">
      <h1>${pageTitle}</h1>
      <div class="info">${welcomeMessage}</div>
      ${content}
    </div>
    <script>
      function copyToClipboard(id, btnId) {
        const el = document.getElementById(id);
        const btn = btnId ? document.getElementById(btnId) : null;
        navigator.clipboard.writeText(el.innerText || el.value).then(() => {
          if (btn) {
            const orig = btn.textContent;
            btn.classList.add('copied');
            btn.textContent = 'Copied!';
            setTimeout(() => {
              btn.classList.remove('copied');
              btn.textContent = orig;
            }, 1500);
          }
        });
      }
      // Slug auto-formatting
      const slugInput = document.querySelector('input[name="slug"]');
      if (slugInput) {
        slugInput.addEventListener('input', function() {
          let val = slugInput.value;
          console.log('Before:', val.split('').map(c => c.charCodeAt(0)));
          val = val.replace(/[^a-zA-Z0-9_-]/g, '');
          console.log('After:', val.split('').map(c => c.charCodeAt(0)));
          slugInput.value = val;
        });
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
        <form method="POST" action="/new" autocomplete="off">
          <label class="label">Name (Slug)
            <span class="tooltip">ℹ️
              <span class="tooltiptext">3-32 characters. Only letters, numbers, dashes (-), and underscores (_). Spaces and invalid characters will be replaced or removed. This will be used in the URL as /your-slug.</span>
            </span>
          </label>
          <input class="input" name="slug" required pattern="[a-zA-Z0-9_-]{3,32}" maxlength="32" minlength="3" placeholder="e.g. my-secret" autocomplete="off" />
          <label class="label">Snippet Text:</label>
          <textarea class="input" name="value" required rows="6" maxlength="5000" placeholder="Paste your snippet here..."></textarea>
          <div class="row">
            <div style="flex:1">
              <label class="label">Expire After (days): <span id="daysValue" class="accent">7</span></label>
              <input class="slider" type="range" name="days" min="1" max="90" value="7" oninput="document.getElementById('daysValue').textContent = this.value" />
            </div>
            <div style="flex:1">
              <label class="label">Expire After (views): <span id="viewsValue" class="accent">7</span></label>
              <input class="slider" type="range" name="views" min="1" max="30" value="7" oninput="document.getElementById('viewsValue').textContent = this.value" />
            </div>
          </div>
          <div class="form-btn-row">
            <button class="copy-btn" type="submit">✨ Create Snippet</button>
          </div>
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
      const link = `${url.origin.replace(/\/$/, '')}/${encodeURIComponent(slug)}`;
      return renderHTML(env, `
        <div class="success">Snippet created! 🎉</div>
        <div style="color:#fff; font-weight:bold;">🔗 Share this link:</div>
        <div class="codebox" id="linkbox">${link}</div>
        <button class="copy-btn" id="copy-link-btn" onclick="copyToClipboard('linkbox', 'copy-link-btn')">📋 Copy Link</button>
        <div style="margin-top:2rem;"><a href="/">➕ Create another snippet</a></div>
      `, { title: 'Snippet Created' });
    }
    // Handle viewing a snippet
    if (request.method === 'GET' && isValidSlug(path)) {
      const snippetRaw = await env.SNIPPETS.get(path);
      if (!snippetRaw) {
        return renderHTML(env, `
          <div class="error" style="font-size:1.3rem;">🚫 Snippet not found or expired.</div>
          <div style="margin:1.5rem 0; color:#fff; font-size:1.1rem;">Would you like to create your own snippet?</div>
          <button class="copy-btn" style="margin-top:1rem; font-size:1.1rem;" onclick="window.location.href='/'">✨ Go to Main Page</button>
        `, { title: 'Not Found' });
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
        <div style="color:#fff; font-size:1.1rem; margin-bottom:0.5rem;">Here’s what’s been shared with you:</div>
        <div class="codebox" id="snippetbox">${snippet.value.replace(/</g, '&lt;')}</div>
        <button class="copy-btn" id="copy-snippet-btn" onclick="copyToClipboard('snippetbox', 'copy-snippet-btn')">📋 Copy Snippet</button>
        <div style="margin-top:2rem;"><a href="/">➕ Create your own snippet</a></div>
      `, { title: 'View Snippet' });
    }
    // Fallback 404
    return renderHTML(env, `<div class="error">Page not found.</div>`, { title: '404 Not Found' });
  },
};
