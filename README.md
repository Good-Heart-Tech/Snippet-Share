# Snippet Share

A modern version of cl1p.net for sharing code snippets securely with automatic expiration.

## Features

- Create and share code snippets with custom URLs
- Automatic snippet expiration options
- Dark theme with modern UI
- Secure storage using Cloudflare KV
- Built with React, TypeScript, and Cloudflare Workers

## Tech Stack

- Frontend:
  - React with TypeScript
  - Vite for build tooling
  - Tailwind CSS for styling
  - Font Awesome for icons
  - Google's Nunito Sans font

- Backend:
  - Cloudflare Workers
  - Hono web framework
  - Cloudflare KV for storage

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a Cloudflare KV namespace:
   ```bash
   wrangler kv:namespace create "SNIPPETS"
   ```

3. Update the `wrangler.toml` file with your KV namespace ID.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Deploy to Cloudflare Workers:
   ```bash
   npm run deploy
   ```

## Development

- Frontend development server runs on `http://localhost:3000`
- Worker development server runs on `http://localhost:8787`

## Environment Variables

No environment variables are required for local development. For production, ensure your Cloudflare Workers environment is properly configured with the KV namespace.

## License

MIT