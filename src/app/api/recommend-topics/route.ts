import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/anthropic";
import { dimensions } from "@/lib/questions";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const { jobDescription, resume, lang } = (await request.json()) as {
      jobDescription: string;
      resume?: string;
      lang?: string;
    };

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json({ recommended: [] });
    }

    const isEn = lang === "en";

    const topicList = dimensions
      .map((d) => `- ${d.key}: ${isEn ? d.nameEn : d.name} — ${isEn ? d.descriptionEn : d.description}`)
      .join("\n");

    const systemPrompt = isEn
      ? `You are a career coach. Given a job description (and optionally a resume), pick the 3-4 most relevant soft skill topics from the list below. Return ONLY a JSON array of topic keys, nothing else. No markdown.`
      : `Ты — карьерный коуч. По описанию вакансии (и опционально резюме) выбери 3-4 наиболее релевантные темы soft skills из списка ниже. Верни ТОЛЬКО JSON-массив ключей тем, ничего больше. Без markdown.`;

    const userMessage = `${isEn ? "Available topics" : "Доступные темы"}:
${topicList}

${isEn ? "Job description" : "Описание вакансии"}:
${jobDescription.slice(0, 2000)}
${resume ? `\n${isEn ? "Resume" : "Резюме"}:\n${resume.slice(0, 1500)}` : ""}

${isEn ? "Return JSON array of 3-4 topic keys" : "Верни JSON-массив из 3-4 ключей тем"}:`;

    let responseText: string;
    try {
      responseText = await callAI(systemPrompt, userMessage, { maxTokens: 256 });
    } catch {
      return NextResponse.json({ recommended: [] });
    }

    let recommended: string[];
    try {
      recommended = JSON.parse(responseText);
      // Validate: only keep keys that exist in dimensions
      const validKeys = new Set(dimensions.map((d) => d.key));
      recommended = recommended.filter((k) => validKeys.has(k));
    } catch {
      return NextResponse.json({ recommended: [] });
    }

    return NextResponse.json({ recommended });
  } catch (error) {
    console.error("Recommend topics error:", error);
    return NextResponse.json({ recommended: [] });
  }
}
