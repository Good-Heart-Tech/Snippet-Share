# Snippet Share

A minimal, free snippet sharing tool for nonprofits, built on Cloudflare Workers and KV. Live at [snip.nonprofittools.org](https://snip.nonprofittools.org) and listed in the [Nonprofit Web Tools](https://nonprofittools.org) hub. Built by [Good Heart Tech](https://goodhearttech.org/).

Paste text, set how many days and views it lasts, and share the link. Snippets are deleted automatically when they expire or run out of views. For sharing passwords, we recommend [Password Pusher](https://push.goodheart.tech).

## Run your own

1. Install [Node.js](https://nodejs.org) and run `npm install`.
2. Create a KV namespace: `npx wrangler kv namespace create SNIPPETS`.
3. In `wrangler.toml`, replace the KV `id` with yours and set your own custom domain route, `PAGE_TITLE`, and `WELCOME_MESSAGE`.
4. Deploy with `npm run deploy`.

## Layout

- `src/worker.ts`: the whole app (routes, HTML, KV reads and writes)
- `wrangler.toml`: Worker name, route, variables, KV binding

## License

[AGPL-3.0](LICENSE). The Good Heart Tech name and logo remain trademarks of Good Heart Tech, so please rebrand forks.
