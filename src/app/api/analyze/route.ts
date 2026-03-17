import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/anthropic";
import { calculateDimensionScores, calculateOverallScore, getWeakDimensions, getStrongDimensions } from "@/lib/scoring";
import { dimensionMap, questions } from "@/lib/questions";
import { Answer, AnalysisResult } from "@/types/assessment";


export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const { answers, resume, jobDescription, lang } = (await request.json()) as {
      answers: Answer[];
      resume?: string;
      jobDescription?: string;
      lang?: string;
    };

    const isEn = lang === "en";

    if (!answers || answers.length === 0) {
      return NextResponse.json(
        { error: "No answers provided" },
        { status: 400 }
      );
    }

    const dimensionScores = calculateDimensionScores(answers);
    const overallScore = calculateOverallScore(dimensionScores);
    const weakDimensions = getWeakDimensions(dimensionScores);
    const strongDimensions = getStrongDimensions(dimensionScores);

    // Build context for AI
    const scoresContext = dimensionScores
      .map(
        (d) =>
          `- ${d.name}: ${d.score}/5 (${d.percentage}%)`
      )
      .join("\n");

    const answersContext = answers
      .map((a) => {
        const q = questions.find((q) => q.id === a.questionId);
        if (!q) return null;
        const text = isEn ? q.textEn : q.text;
        return `[${a.questionId}] "${text}" → ${a.value}/5${q.reverse ? " (reverse)" : ""}`;
      })
      .filter(Boolean)
      .join("\n");

    let personalizationContext = "";
    if (resume) {
      const resumeLabel = isEn ? "Candidate resume (use for personalizing the analysis)" : "Резюме кандидата (используй для персонализации анализа)";
      personalizationContext += `\n\n${resumeLabel}:\n${resume.slice(0, 3000)}`;
    }
    if (jobDescription) {
      const jobLabel = isEn ? "Target job description" : "Описание целевой вакансии/роли";
      personalizationContext += `\n\n${jobLabel}:\n${jobDescription.slice(0, 2000)}`;
    }

    const systemPrompt = isEn
      ? `You are an expert in soft skills for developers who work with AI tools (vibe coders).
You are given self-assessment test results across multiple dimensions. Each dimension is scored on a 1-5 scale.
Reverse questions are already recalculated — a high score always means high skill level.

Your task is to provide an honest, constructive analysis. Don't flatter, but don't demotivate either.
Be specific: mention concrete behavioral patterns from the answers.
${resume ? "\nIf a resume is provided — consider the candidate's experience and skills in your analysis." : ""}
${jobDescription ? "\nIf a job description is provided — relate results to the role requirements." : ""}

IMPORTANT: Respond ONLY with valid JSON without markdown formatting. No \`\`\`json blocks.`
      : `Ты — эксперт по soft skills для разработчиков, работающих с AI-инструментами (вайб-кодеров).
Тебе даны результаты теста самооценки по нескольким измерениям. Каждое измерение оценивается по шкале 1-5.
Reverse-вопросы уже пересчитаны — высокий балл везде означает высокий навык.

Твоя задача — дать честный, конструктивный анализ. Не льсти, но и не демотивируй.
Будь конкретным: упоминай конкретные паттерны поведения из ответов.
${resume ? "\nЕсли предоставлено резюме — учитывай опыт и навыки кандидата при анализе." : ""}
${jobDescription ? "\nЕсли предоставлено описание вакансии — соотноси результаты с требованиями роли." : ""}

ВАЖНО: Отвечай ТОЛЬКО валидным JSON без markdown-форматирования. Никаких \`\`\`json блоков.`;

    const scoresLabel = isEn ? "Dimension scores" : "Баллы по измерениям";
    const overallLabel = isEn ? "Overall score" : "Общий балл";
    const detailLabel = isEn ? "Detailed answers" : "Детальные ответы";
    const summaryField = isEn
      ? '"summary": "Overall profile description (2-3 sentences, in English)"'
      : '"summary": "Общее описание профиля (2-3 предложения, на русском)"';
    const strengthsField = isEn
      ? '"strengths": ["strength 1", "strength 2", "strength 3"]'
      : '"strengths": ["сильная сторона 1", "сильная сторона 2", "сильная сторона 3"]';
    const weaknessesField = isEn
      ? '"weaknesses": ["growth area 1", "growth area 2", "growth area 3"]'
      : '"weaknesses": ["зона роста 1", "зона роста 2", "зона роста 3"]';
    const closingNote = isEn
      ? "Strengths and growth areas should be specific, tied to answers, not generic phrases."
      : "Сильные стороны и зоны роста должны быть конкретными, привязанными к ответам, а не общими фразами.";

    const userMessage = `${isEn ? "Test results" : "Результаты теста"}:

${scoresLabel}:
${scoresContext}

${overallLabel}: ${overallScore}/5

${detailLabel}:
${answersContext}${personalizationContext}

${isEn ? "Generate analysis in JSON format" : "Сформируй анализ в формате JSON"}:
{
  ${summaryField},
  ${strengthsField},
  ${weaknessesField}
}

${closingNote}`;

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

    let aiAnalysis: { summary: string; strengths: string[]; weaknesses: string[] };
    try {
      aiAnalysis = JSON.parse(response);
    } catch {
      // If AI returns non-JSON, use defaults
      const highLabel = isEn ? "High level:" : "Высокий уровень:";
      const growthLabel = isEn ? "Growth area:" : "Зона роста:";
      const fallbackName = (d: typeof weakDimensions[number]) => isEn ? dimensionMap[d].nameEn : dimensionMap[d].name;
      aiAnalysis = {
        summary: isEn
          ? "Analysis complete. Your profile shows an interesting mix of developed skills and growth areas."
          : "Анализ завершён. Ваш профиль показывает интересное сочетание развитых навыков и зон для роста.",
        strengths: strongDimensions.map(
          (d) => `${highLabel} ${fallbackName(d)}`
        ),
        weaknesses: weakDimensions.map(
          (d) => `${growthLabel} ${fallbackName(d)}`
        ),
      };
    }

    const result: AnalysisResult = {
      dimensionScores,
      overallScore,
      strengths: aiAnalysis.strengths,
      weaknesses: aiAnalysis.weaknesses,
      summary: aiAnalysis.summary,
      weakDimensions,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze results" },
      { status: 500 }
    );
  }
}
