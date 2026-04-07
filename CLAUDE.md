# CLAUDE.md — Project Instructions

## Overview
Soft Skills Check — open-source trainer for soft skills in the AI era.
Live: https://soft-skills.chillai.space
Repo: https://github.com/job-search-toolkit/soft-skills-check

## Tech Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- AI: GPT-4o-mini (primary, cheapest) → Claude Haiku 4.5 (fallback)
- Deployment: Cloudflare Workers via @opennextjs/cloudflare
- Storage: Cloudflare KV namespace `ANALYTICS` (anonymous aggregates), sessionStorage (user data)

## Key Architecture
- All user data stays in sessionStorage (no database for user data)
- AI calls: `src/lib/anthropic.ts` → `callAI()` — tries OpenAI first, falls back to Claude
- Questions: `src/lib/questions.ts` (self-assessment), `src/lib/quiz-questions.ts` + `src/lib/quiz-pool.ts` (210 quiz questions)
- i18n: `src/lib/i18n.ts` + `src/lib/LangContext.tsx` (RU/EN)
- All pages are client components using `useLang()` hook
- Question quality ratings collected via `/api/analytics` into KV

## User Flow
1. `/context` — profession tags + optional resume/job description
2. `/topics` — pick soft skill topics (10 available)
3. `/test` — self-assessment (5 random questions per topic)
4. `/results` — AI analysis + radar chart + gap identification
5. `/quiz` — knowledge quiz (5 random from 20+ per topic), instant feedback
6. `/homework` — email verification → personalized assignment (time + context params)

## Local Development
```bash
cp .env.example .env.local
# Add at least one: OPENAI_API_KEY or ANTHROPIC_API_KEY
npm install
npm run dev
```

## Deploy to Your Own Cloudflare
```bash
# 1. Create a Cloudflare Workers project
npx wrangler pages project create my-soft-skills

# 2. Create KV namespace for analytics
npx wrangler kv namespace create ANALYTICS
# Copy the ID into wrangler.jsonc

# 3. Set API key(s) as secrets
echo "sk-your-key" | npx wrangler secret put OPENAI_API_KEY
echo "sk-ant-your-key" | npx wrangler secret put ANTHROPIC_API_KEY  # optional fallback

# 4. Build and deploy
npx opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion
npx wrangler deploy --domain your-domain.example.com
```

## Testing Your Branch Before PR
```bash
# Build locally to catch errors
npm run build

# Preview with Cloudflare dev server
npx opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion
npx wrangler dev

# Or deploy to a preview URL (doesn't affect production)
npx wrangler deploy  # without --domain, deploys to *.workers.dev
```

## Environment Variables
- `OPENAI_API_KEY` — GPT-4o-mini (primary, ~$0.15/1M input)
- `ANTHROPIC_API_KEY` — Claude Haiku (fallback, ~$0.80/1M input)
- At least one is required. Both can be set for redundancy.

## Conventions
- All UI text goes through i18n (`src/lib/i18n.ts`) — both RU and EN
- Dark theme: bg-slate-950, cards bg-slate-900, accent violet/indigo
- AI model: GPT-4o-mini primary, Claude Haiku fallback (see `src/lib/anthropic.ts`)
- Questions: mix of general soft skills + AI-era context
- Each question has a quality rating widget (collected in KV analytics)

## Quiz Question Rules

These rules apply to all quiz questions in `src/lib/quiz-pool.ts`. Follow them when adding or reviewing questions.

### Structure
- Each dimension has **20+ quiz questions** — the system picks 5 random per topic
- Every question must have **exactly 4 options** (keys: a, b, c, d)
- Both `text`/`textEn` and `explanation`/`explanationEn` are required (RU + EN)
- Each question must have `source` and `sourceUrl` — real, verifiable references

### Answer balance (critical)
- **Correct answer must NOT be visually longer than alternatives.** If the correct option is noticeably longer, it gives away the answer. Either shorten the correct option or pad the distractors with plausible detail.
- Distractors must be **plausible** — not obviously absurd. A good distractor sounds reasonable to someone who hasn't studied the topic.
- Correct answers should be **distributed across a, b, c, d** — not always the same key. Check the distribution when adding a batch.

### Content quality
- Tie each question to the **AI era** where relevant — e.g. how the concept applies to managing AI agents, not just people
- Explanations should teach, not just confirm — include the "why" and practical takeaway
- Avoid trivia and trick questions — test understanding of concepts, not memorization of dates or names
- Don't duplicate concepts already covered in other dimensions (e.g. time management vs. prioritization in management)

### Self-assessment questions (`src/lib/questions.ts`)
- **5 questions per dimension**, randomly selected during the test
- Mix of **direct** (agree = high skill) and **reverse** (agree = low skill) items — at least 1 reverse per dimension
- Keep statements personal and behavioral ("I do X") not abstract ("X is important")

### Adding a new dimension checklist
1. Add to `DimensionKey` type and `dimensions[]` array in `src/lib/questions.ts`
2. Add 5 self-assessment questions to `questions[]` in `src/lib/questions.ts`
3. Add 20+ quiz questions to `src/lib/quiz-pool.ts`
4. Add i18n keys in `src/lib/i18n.ts` (both RU and EN sections)
5. Add icon to `TOPIC_ICONS` in `src/app/topics/page.tsx`
6. Add card to landing page in `src/app/page.tsx`
7. Update dimension count in i18n (e.g. "10 dimensions" → "11 dimensions")
8. Run `npm run build` — must pass without errors
