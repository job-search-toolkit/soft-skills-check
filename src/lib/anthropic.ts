/**
 * AI client — GPT-4o-mini primary, Gemini 1.5 Flash fallback
 */

const OPENAI_API = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o-mini";

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function callAI(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number }
): Promise<string> {
  const maxTokens = options?.maxTokens ?? 2048;

  // 1. Primary: GPT-4o-mini (cheapest, fastest, great at JSON)
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch(OPENAI_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          choices: Array<{ message: { content: string } }>;
        };
        const content = data.choices[0]?.message?.content?.trim();
        if (content) return content;
      }
    } catch (err) {
      console.error("[openai] GPT-4o-mini failed:", err);
    }
  }

  // 2. Fallback: Gemini 1.5 Flash (free tier available, extremely cheap)
  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await fetch(`${GEMINI_API}?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
            },
          ],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.7,
          },
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
        };
        const content = data.candidates[0]?.content?.parts[0]?.text?.trim();
        if (content) return content;
      }
    } catch (err) {
      console.error("[gemini] Gemini Flash failed:", err);
    }
  }

  // 3. Last resort: Claude Haiku (if configured)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });

      const textBlock = message.content.find((block) => block.type === "text");
      if (textBlock && textBlock.type === "text") {
        return textBlock.text;
      }
    } catch (err) {
      console.error("[anthropic] Claude Haiku failed:", err);
    }
  }

  throw new Error("No AI API keys configured or all providers failed. Please set OPENAI_API_KEY or GEMINI_API_KEY.");
}

// Backward compatibility alias
export const callClaude = callAI;

// Legacy export for recommend-topics
export function getAnthropicClient() {
  const Anthropic = require("@anthropic-ai/sdk").default;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}
