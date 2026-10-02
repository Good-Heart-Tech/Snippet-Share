// Removed import for '@cloudflare/workers-types' as types are globally available in Workers environment
export interface Env {
  SNIPPETS: KVNamespace;
  PAGE_TITLE?: string;
  WELCOME_MESSAGE?: string;
}

export interface Snippet {
  value: string;
  expiresAt: number; // timestamp in ms
  remainingViews: number;
  createdAt: number;
  maxViews: number;
}

const HEART = '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
const GITHUB = '<svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>';

// Good Heart Tech brand colors (from the brand kit tokens) and the standard light footer.
const STYLES = `
      :root { --primary:#7189FF; --charcoal:#394053; --light-blue:#A0DDFF; --rich-black:#091D20; --white:#FFFFFF; --hudu-primary:#586CD0; --hudu-light:#D6DDFF; --wash:#F3F5FF; }
      html, body, *, *:before, *:after { box-sizing: border-box; }
      body { min-height: 100vh; display: flex; flex-direction: column; background: var(--white); color: var(--charcoal); font-family: ui-sans-serif, system-ui, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.55; margin: 0; }
      a { color: var(--hudu-primary); }
      a:hover { color: var(--rich-black); }
      :focus-visible { outline: 3px solid var(--primary); outline-offset: 2px; }
      h1 { color: var(--rich-black); font-size: clamp(1.8rem, 4vw, 2.6rem); line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 1rem; text-align: center; text-wrap: balance; }
      .main-content { width: 100%; max-width: 900px; margin: 2.5rem auto; padding: 0 1.25rem; flex: 1; }
      .accent { color: var(--hudu-primary); font-weight: 700; }
      .info { margin-bottom: 1.25rem; text-align: center; }
      .codebox { background: var(--wash); color: var(--rich-black); border: 2px solid var(--hudu-light); border-radius: 8px; padding: 1.1rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; margin: 1rem 0; font-size: 1.05rem; white-space: pre-wrap; overflow-wrap: anywhere; }
      .copy-btn { background: var(--hudu-primary); color: var(--white); border: 2px solid var(--hudu-primary); border-radius: 8px; padding: 0.7rem 1.3rem; cursor: pointer; font: inherit; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5em; }
      .copy-btn:hover { background: var(--rich-black); border-color: var(--rich-black); }
      .copy-btn.copied { background: #17653A; border-color: #17653A; }
      .form-btn-row { padding-top: 1rem; }
      .input, select { width: 100%; padding: 0.75rem 0.9rem; margin: 0.4rem 0 1.2rem 0; border-radius: 8px; border: 2px solid var(--hudu-light); background: var(--white); color: var(--rich-black); font: inherit; font-size: 1.05rem; }
      .input:hover { border-color: var(--primary); }
      textarea.input { resize: vertical; }
      .label { font-weight: 700; margin-top: 1rem; display: block; font-size: 1.05rem; color: var(--rich-black); }
      .error { background: #FDECEC; color: #9B1C1C; border-radius: 8px; padding: 0.8rem 1rem; margin-bottom: 1.2rem; font-weight: 600; }
      .success { background: #E6F5EB; color: #17653A; border-radius: 8px; padding: 0.8rem 1rem; margin-bottom: 1.2rem; font-weight: 600; }
      .row { display: flex; gap: 2rem; }
      .row > div { flex: 1; }
      .tooltip { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 1.3em; height: 1.3em; border-radius: 50%; background: var(--hudu-light); color: var(--rich-black); font-size: 0.85em; font-weight: 700; cursor: help; margin-left: 0.3em; }
      .tooltip .tooltiptext { visibility: hidden; width: 260px; background: var(--rich-black); color: var(--white); text-align: left; border-radius: 6px; padding: 0.7rem; position: absolute; z-index: 1; bottom: 135%; left: 50%; margin-left: -130px; opacity: 0; transition: opacity 0.2s; font-size: 0.95rem; font-weight: 400; }
      .tooltip:hover .tooltiptext, .tooltip:focus .tooltiptext { visibility: visible; opacity: 1; }
      .slider { width: 100%; margin: 0.8rem 0 1.2rem; accent-color: var(--hudu-primary); cursor: pointer; }
      @media (max-width: 800px) { .row { flex-direction: column; gap: 0; } }
      .ght-footer { width: 100%; margin-top: auto; padding: 22px 24px 26px; text-align: center; background: var(--wash); border-top: 1px solid var(--hudu-light); color: var(--charcoal); }
      .ght-footer-note { max-width: 52rem; margin: 0 auto 16px; font-size: .8125rem; font-style: italic; }
      .ght-footer-row { display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; }
      .ght-footer-logo img { display: block; height: 30px; width: auto; }
      .ght-footer-copy { font-size: .9375rem; }
      .ght-footer-donate { display: inline-flex; align-items: center; gap: 8px; line-height: 1.2; padding: 9px 22px; border-radius: 8px; background: var(--hudu-primary); color: var(--white); font-weight: 600; text-decoration: none; }
      .ght-footer-donate:hover { background: var(--rich-black); color: var(--white); }
      .ght-footer-github { display: inline-flex; color: var(--rich-black); }
      .ght-footer-github:hover { color: var(--hudu-primary); }
`;

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderHTML(
  env: Env,
  content: string,
  { title }: { title?: string } = {}
): Response {
  const pageTitle = env.PAGE_TITLE || 'Snippet Share';
  const welcomeMessage = env.WELCOME_MESSAGE || '';
  return new Response(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="theme-color" content="#FFFFFF" />
    <link rel="icon" href="https://nonprofittools.org/assets/favicon.ico" sizes="any" />
    <title>${title || pageTitle}</title>
    <style>${STYLES}</style>
  </head>
  <body>
    <div class="main-content">
      <h1>${pageTitle}</h1>
      <div class="info">${welcomeMessage}</div>
      ${content}
    </div>
    <footer class="ght-footer">
      <p class="ght-footer-note">This tool is for informational use only. Accuracy is not guaranteed, and it may become outdated or stop functioning. Use at your own discretion.</p>
      <div class="ght-footer-row">
        <a class="ght-footer-logo" href="https://goodhearttech.org/"><img src="https://nonprofittools.org/assets/goodhearttech-logo.png" alt="Good Heart Tech" height="30" /></a>
        <span class="ght-footer-copy">&copy; <span id="ght-year">2026</span> All rights reserved.</span>
        <a class="ght-footer-donate" href="https://goodhearttech.org/donate/">${HEART} Donate</a>
        <a class="ght-footer-github" href="https://github.com/Good-Heart-Tech/Snippet-Share" aria-label="Snippet Sharing on GitHub">${GITHUB}</a>
      </div>
    </footer>
    <script>
      document.getElementById('ght-year').textContent = new Date().getFullYear();
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
      // Slug auto-formatting: keep only letters, numbers, dashes and underscores
      const slugInput = document.querySelector('input[name="slug"]');
      if (slugInput) {
        slugInput.addEventListener('input', function() {
          slugInput.value = slugInput.value.replace(/[^a-zA-Z0-9_-]/g, '');
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
          <label class="label" for="slug">Name (Slug)
            <span class="tooltip" tabindex="0" aria-label="Help">?
              <span class="tooltiptext">3-32 characters. Only letters, numbers, dashes (-), and underscores (_). Spaces and invalid characters will be replaced or removed. This will be used in the URL as /your-slug.</span>
            </span>
          </label>
          <input class="input" id="slug" name="slug" required pattern="[a-zA-Z0-9_-]{3,32}" maxlength="32" minlength="3" placeholder="e.g. my-secret" autocomplete="off" />
          <label class="label" for="value">Snippet Text:</label>
          <textarea class="input" id="value" name="value" required rows="6" maxlength="5000" placeholder="Paste your snippet here..."></textarea>
          <div class="row">
            <div>
              <label class="label" for="days">Expire After (days): <span id="daysValue" class="accent">7</span></label>
              <input class="slider" id="days" type="range" name="days" min="1" max="90" value="7" oninput="document.getElementById('daysValue').textContent = this.value" />
            </div>
            <div>
              <label class="label" for="views">Expire After (views): <span id="viewsValue" class="accent">7</span></label>
              <input class="slider" id="views" type="range" name="views" min="1" max="30" value="7" oninput="document.getElementById('viewsValue').textContent = this.value" />
            </div>
          </div>
          <div class="form-btn-row">
            <button class="copy-btn" type="submit">Create Snippet</button>
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
        <div class="success">Snippet created!</div>
        <div class="label">Share this link:</div>
        <div class="codebox" id="linkbox">${link}</div>
        <button class="copy-btn" id="copy-link-btn" onclick="copyToClipboard('linkbox', 'copy-link-btn')">Copy Link</button>
        <p style="margin-top:2rem;"><a href="/">Create another snippet</a></p>
      `, { title: 'Snippet Created' });
    }
    // Handle viewing a snippet
    if (request.method === 'GET' && isValidSlug(path)) {
      const snippetRaw = await env.SNIPPETS.get(path);
      if (!snippetRaw) {
        return renderHTML(env, `
          <div class="error">Snippet not found or expired.</div>
          <p>Would you like to create your own snippet?</p>
          <button class="copy-btn" onclick="window.location.href='/'">Go to Main Page</button>
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
        <div class="label">Here is what has been shared with you:</div>
        <div class="codebox" id="snippetbox">${escapeHtml(snippet.value)}</div>
        <button class="copy-btn" id="copy-snippet-btn" onclick="copyToClipboard('snippetbox', 'copy-snippet-btn')">Copy Snippet</button>
        <p style="margin-top:2rem;"><a href="/">Create your own snippet</a></p>
      `, { title: 'View Snippet' });
    }
    // Fallback 404
    return renderHTML(env, `<div class="error">Page not found.</div>`, { title: '404 Not Found' });
  },
};
