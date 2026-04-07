import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/anthropic";
import { dimensionMap } from "@/lib/questions";
import { DimensionKey, DimensionScore, DeepDiveQuestion } from "@/types/assessment";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const { weakDimensions, dimensionScores, resume, jobDescription, lang } = (await request.json()) as {
      weakDimensions: DimensionKey[];
      dimensionScores: DimensionScore[];
      resume?: string;
      jobDescription?: string;
      lang?: string;
    };

    const isEn = lang === "en";

    if (!weakDimensions || weakDimensions.length === 0) {
      return NextResponse.json(
        { error: "No weak dimensions provided" },
        { status: 400 }
      );
    }

    const dimensionContext = weakDimensions
      .map((d) => {
        const score = dimensionScores.find((s) => s.dimension === d);
        const info = dimensionMap[d];
        const name = isEn ? info.nameEn : info.name;
        const desc = isEn ? info.descriptionEn : info.description;
        return `- ${name} (${d}): ${score?.score || "?"}/5 — ${desc}`;
      })
      .join("\n");

    const questionsPerDimension = Math.max(
      3,
      Math.min(5, Math.floor(12 / weakDimensions.length))
    );
    const totalQuestions = questionsPerDimension * weakDimensions.length;

    let personalizationContext = "";
    if (resume) {
      const resumeLabel = isEn
        ? "Candidate resume (consider their experience when formulating questions)"
        : "Резюме кандидата (учитывай его опыт при формулировке вопросов)";
      personalizationContext += `\n\n${resumeLabel}:\n${resume.slice(0, 3000)}`;
    }
    if (jobDescription) {
      const jobLabel = isEn
        ? "Target job description (adapt questions to role requirements)"
        : "Описание целевой вакансии/роли (адаптируй вопросы под требования роли)";
      personalizationContext += `\n\n${jobLabel}:\n${jobDescription.slice(0, 2000)}`;
    }

    const systemPrompt = isEn
      ? `You are an expert in assessing soft skills for vibe coders (developers who actively use AI).
You need to create in-depth questions to diagnose weak areas.

Rules:
- Questions should be scenario-based — describing a concrete work situation
- Language: English, informal but professional (use "you")
- Questions should be more specific and probing than the basic test
- Each question is a statement rated on a 1-5 scale (from "not me at all" to "that's exactly me")
- A high score (5) should mean HIGH skill level (do NOT make reverse questions)
- Questions should reveal different aspects of each dimension
${resume ? "- If a resume is provided — use the candidate's experience context to create more relevant scenarios" : ""}
${jobDescription ? "- If a job description is provided — adapt scenarios to role requirements" : ""}

IMPORTANT: Respond ONLY with valid JSON without markdown formatting. No \`\`\`json blocks.`
      : `Ты — эксперт по оценке soft skills для вайб-кодеров (разработчиков, активно использующих AI).
Тебе нужно создать углублённые вопросы для диагностики слабых зон.

Правила:
- Вопросы должны быть сценарными — описывать конкретную рабочую ситуацию
- Язык: русский, неформальный но профессиональный (на "ты")
- Вопросы должны быть более специфичными и проникающими, чем базовый тест
- Каждый вопрос — это утверждение, которое оценивается по шкале 1-5 (от "совсем не про меня" до "точно про меня")
- Высокий балл (5) должен означать ВЫСОКИЙ уровень навыка (НЕ делай reverse-вопросы)
- Вопросы должны раскрывать разные аспекты каждого измерения
${resume ? "- Если предоставлено резюме — используй контекст опыта кандидата для создания более релевантных сценариев" : ""}
${jobDescription ? "- Если предоставлено описание вакансии — адаптируй сценарии под требования роли" : ""}

ВАЖНО: Отвечай ТОЛЬКО валидным JSON без markdown-форматирования. Никаких \`\`\`json блоков.`;

    const weakLabel = isEn ? "User's weak dimensions" : "Слабые измерения пользователя";
    const generateLabel = isEn ? "Generate" : "Сгенерируй";
    const questionsLabel = isEn ? "questions" : "вопросов";
    const perDimLabel = isEn ? "per dimension" : "на каждое измерение";

    const userMessage = `${weakLabel}:
${dimensionContext}${personalizationContext}

${generateLabel} ${totalQuestions} ${questionsLabel} (${isEn ? "by" : "по"} ${questionsPerDimension} ${perDimLabel}).

${isEn ? "JSON format" : "Формат JSON"}:
{
  "questions": [
    {
      "id": "dd_1",
      "dimension": "dimension_key",
      "text": "${isEn ? "Question statement text" : "Текст вопроса-утверждения"}"
    }
  ]
}

${isEn ? "ID numbering" : "Нумерация id"}: dd_1, dd_2, dd_3 ${isEn ? "etc." : "и т.д."}
dimension ${isEn ? "must be one of" : "должен быть одним из"}: ${weakDimensions.join(", ")}`;

    let response: string;
    try {
      response = await callClaude(systemPrompt, userMessage);
    } catch (apiError) {
      console.error("Claude API error:", apiError);
      return NextResponse.json(
        { error: isEn ? "AI analysis failed. Please try again." : "AI-анализ не удался. Попробуйте ещё раз." },
        { status: 500 }
      );
    }

    let parsed: { questions: DeepDiveQuestion[] };
    try {
      parsed = JSON.parse(response);
    } catch {
      // Fallback: generate basic questions
      const fallbackQuestions: DeepDiveQuestion[] = weakDimensions.flatMap(
        (dim, dimIdx) =>
          Array.from({ length: questionsPerDimension }, (_, i) => ({
            id: `dd_${dimIdx * questionsPerDimension + i + 1}`,
            dimension: dim,
            text: isEn
              ? `Rate your level in "${dimensionMap[dim].nameEn}" on aspect ${i + 1}`
              : `Оцените свой уровень в области "${dimensionMap[dim].name}" по аспекту ${i + 1}`,
          }))
      );
      parsed = { questions: fallbackQuestions };
    }

    // Validate and sanitize
    const validQuestions = parsed.questions
      .filter(
        (q) =>
          q.id &&
          q.dimension &&
          q.text &&
          weakDimensions.includes(q.dimension as DimensionKey)
      )
      .slice(0, 15);

    return NextResponse.json({ questions: validQuestions });
  } catch (error) {
    console.error("Generate test error:", error);
    return NextResponse.json(
      { error: "Failed to generate test" },
      { status: 500 }
    );
  }
}
