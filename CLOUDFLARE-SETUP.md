# Cloudflare Setup Guide

Everything needed to deploy your own instance of Soft Skills Check.

## Architecture

```
Browser → Cloudflare Workers (Next.js via @opennextjs/cloudflare)
                ├── Static assets (HTML, JS, CSS)
                ├── API routes → OpenAI GPT-4o-mini (or Claude Haiku fallback)
                └── KV namespace (anonymous analytics)
```

## Files in Repo

| File | Purpose |
|------|---------|
| `wrangler.jsonc` | Worker config: name, compatibility, KV bindings |
| `open-next.config.ts` | OpenNext adapter config for Cloudflare |
| `.env.example` | Environment variables template |
| `.dev.vars` | Local dev secrets (gitignored) |

## Secrets (not in repo)

These must be set as Worker secrets via `wrangler secret put`:

| Secret | Required | Purpose |
|--------|----------|---------|
| `OPENAI_API_KEY` | Yes* | GPT-4o-mini for AI analysis, quiz, homework |
| `ANTHROPIC_API_KEY` | No* | Claude Haiku fallback if OpenAI fails |

*At least one is required.

## KV Namespace

One KV namespace for anonymous analytics:

| Binding | Purpose | Data stored |
|---------|---------|-------------|
| `ANALYTICS` | Aggregate test scores + question ratings | `stats` (scores), `q_ratings` (question feedback), `quiz_ratings` (quiz feedback) |

The KV ID in `wrangler.jsonc` is specific to our Cloudflare account. You must create your own:

```bash
npx wrangler kv namespace create ANALYTICS
# Output: { "id": "your-unique-id" }
# → Replace the id in wrangler.jsonc
```

## Custom Domain

The domain `soft-skills.chillai.space` is set via deploy flag, not in wrangler.jsonc:

```bash
npx wrangler deploy --domain soft-skills.chillai.space
```

For your own domain:
1. Domain must be on Cloudflare (proxied zone)
2. `npx wrangler deploy --domain your-domain.com`
3. Cloudflare auto-creates DNS + SSL

Without custom domain, the worker is available at `*.workers.dev`.

## Step-by-Step Deploy

```bash
# 1. Clone
git clone https://github.com/job-search-toolkit/soft-skills-check.git
cd soft-skills-check
npm install

# 2. Create KV namespace
npx wrangler kv namespace create ANALYTICS
# Copy the ID into wrangler.jsonc → kv_namespaces[0].id

# 3. Set secrets
echo "sk-proj-your-openai-key" | npx wrangler secret put OPENAI_API_KEY
# Optional fallback:
echo "sk-ant-your-anthropic-key" | npx wrangler secret put ANTHROPIC_API_KEY

# 4. Build
npx opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion

# 5. Deploy
npx wrangler deploy
# Or with custom domain:
npx wrangler deploy --domain your-domain.com
```

## Local Development

```bash
cp .env.example .env.local
# Edit .env.local: add OPENAI_API_KEY

npm run dev
# → http://localhost:3000
```

For testing with Cloudflare runtime (KV, etc.):

```bash
# Create .dev.vars with secrets
echo "OPENAI_API_KEY=sk-proj-..." > .dev.vars

npx opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion
npx wrangler dev
```

## What's NOT in the Repo

- API keys (secrets)
- KV data (analytics)
- Custom domain config
- Cloudflare account settings

Everything else is in the repo and reproducible.
