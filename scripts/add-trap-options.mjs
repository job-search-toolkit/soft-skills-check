/**
 * Add a 5th "trap" option to each quiz question.
 * The trap should sound plausible and use terminology from adjacent domains
 * to provoke mistakes and deeper learning.
 *
 * Uses OpenAI GPT-4o-mini for generation.
 * Run: node scripts/add-trap-options.mjs
 */

import fs from 'fs';
import path from 'path';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  // Try .dev.vars
  try {
    const devVars = fs.readFileSync('.dev.vars', 'utf-8');
    const match = devVars.match(/OPENAI_API_KEY\s*=\s*"?([^"\n]+)"?/);
    if (match) process.env.OPENAI_API_KEY = match[1];
  } catch {}
}

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Set OPENAI_API_KEY in env or .dev.vars');
  process.exit(1);
}

const POOL_PATH = path.join(process.cwd(), 'src/lib/quiz-pool.ts');

// Parse quiz-pool.ts
const content = fs.readFileSync(POOL_PATH, 'utf-8');
const jsonStart = content.indexOf('\n[');
const jsonEnd = content.lastIndexOf(']') + 1;
const rawJson = content.substring(jsonStart, jsonEnd).trim();
const questions = JSON.parse(rawJson);

console.log(`Loaded ${questions.length} questions`);

const alreadyHave5 = questions.filter(q => q.options.length >= 5).length;
console.log(`Already have 5 options: ${alreadyHave5}`);
const toProcess = questions.filter(q => q.options.length === 4);
console.log(`Need trap option: ${toProcess.length}`);

async function generateTrapOption(question) {
  const prompt = `You are adding a 5th "trap" answer option to a soft skills quiz question. The trap should:
1. Sound very plausible — use real terminology from adjacent fields/methodologies
2. Be confidently wrong — someone who half-knows the topic would pick it
3. Mix in a kernel of truth with a wrong conclusion
4. Be roughly the same length as other options

Question (RU): ${question.text}
Question (EN): ${question.textEn}

Existing options:
${question.options.map(o => `${o.key}. ${o.text} / ${o.textEn}`).join('\n')}

Correct answer: ${question.correctAnswer}

Generate ONLY a JSON object with exactly these fields:
{"key": "e", "text": "Russian trap option text", "textEn": "English trap option text"}

The trap must NOT be the correct answer. It should be wrong but tempting.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You generate quiz trap options. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const trapText = data.choices[0]?.message?.content;
  return JSON.parse(trapText);
}

// Process in batches
const BATCH_SIZE = 5;
let processed = 0;
let errors = 0;

for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
  const batch = toProcess.slice(i, i + BATCH_SIZE);
  const results = await Promise.allSettled(
    batch.map(q => generateTrapOption(q))
  );

  for (let j = 0; j < batch.length; j++) {
    const q = batch[j];
    const result = results[j];
    if (result.status === 'fulfilled' && result.value?.key === 'e') {
      q.options.push(result.value);
      processed++;
    } else {
      console.error(`Failed for ${q.id}:`, result.status === 'rejected' ? result.reason.message : 'bad format');
      errors++;
    }
  }

  // Progress
  const pct = Math.round(((i + batch.length) / toProcess.length) * 100);
  process.stdout.write(`\r${pct}% (${processed} done, ${errors} errors)`);

  // Rate limit pause
  if (i + BATCH_SIZE < toProcess.length) {
    await new Promise(r => setTimeout(r, 500));
  }
}

console.log(`\n\nDone! ${processed} trap options added, ${errors} errors.`);

// Write back
const prefix = content.substring(0, jsonStart);
const suffix = content.substring(jsonEnd);
const newContent = prefix + JSON.stringify(questions, null, 2) + suffix;
fs.writeFileSync(POOL_PATH, newContent, 'utf-8');
console.log('Written to', POOL_PATH);
