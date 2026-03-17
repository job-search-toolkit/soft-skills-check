import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/anthropic";
import { dimensionMap } from "@/lib/questions";
import { AnalysisResult, DeepDiveAnswer, RecommendationResult } from "@/types/assessment";


export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const { analysis, deepDiveAnswers, resume, jobDescription, lang } = (await request.json()) as {
      analysis: AnalysisResult;
      deepDiveAnswers: DeepDiveAnswer[];
      resume?: string;
      jobDescription?: string;
      lang?: string;
    };

    const isEn = lang === "en";

    if (!analysis) {
      return NextResponse.json(
        { error: "No analysis data provided" },
        { status: 400 }
      );
    }

    const scoresContext = analysis.dimensionScores
      .map((d) => `- ${d.name} (${d.dimension}): ${d.score}/5`)
      .join("\n");

    const strengthsLabel = isEn ? "Strengths" : "Сильные стороны";
    const weaknessesLabel = isEn ? "Growth areas" : "Зоны роста";

    const strengthsContext =
      analysis.strengths.length > 0
        ? `${strengthsLabel}: ${analysis.strengths.join("; ")}`
        : "";

    const weaknessesContext =
      analysis.weaknesses.length > 0
        ? `${weaknessesLabel}: ${analysis.weaknesses.join("; ")}`
        : "";

    const deepDiveContext =
      deepDiveAnswers.length > 0
        ? `\n${isEn ? "Deep-dive test answers" : "Ответы на углублённый тест"}:\n${deepDiveAnswers
            .map(
              (a) => {
                const dimName = isEn
                  ? (dimensionMap[a.dimension]?.nameEn || a.dimension)
                  : (dimensionMap[a.dimension]?.name || a.dimension);
                return `[${a.questionId}] ${isEn ? "Dimension" : "Измерение"}: ${dimName}, ${isEn ? "Score" : "Балл"}: ${a.value}/5`;
              }
            )
            .join("\n")}`
        : `\n${isEn ? "Deep-dive test was not taken." : "Углублённый тест не пройден."}`;

    let personalizationContext = "";
    if (resume) {
      const resumeLabel = isEn
        ? "Candidate resume (consider their experience and skills when forming recommendations)"
        : "Резюме кандидата (учитывай его опыт и навыки при формировании рекомендаций)";
      personalizationContext += `\n\n${resumeLabel}:\n${resume.slice(0, 3000)}`;
    }
    if (jobDescription) {
      const jobLabel = isEn
        ? "Target job description (tie recommendations to this role's requirements)"
        : "Описание целевой вакансии/роли (привяжи рекомендации к требованиям этой роли)";
      personalizationContext += `\n\n${jobLabel}:\n${jobDescription.slice(0, 2000)}`;
    }

    const dimensionsToRecommend = analysis.dimensionScores
      .sort((a, b) => a.score - b.score)
      .slice(0, 4)
      .map((d) => d.dimension);

    const systemPrompt = isEn
      ? `You are a career coach and expert in soft skills development for vibe coders.
Based on test results, create a personal development plan.

Rules:
- Language: English
- Recommendations should be specific and actionable
- Focus on practical steps that can be started today
- Consider the context of working with AI tools
- For resources: recommend specific approaches and practices, not links
- Be honest but motivating
${resume ? "- If a resume is provided — consider current experience and skills, suggest recommendations based on their level" : ""}
${jobDescription ? "- If a job description is provided — tie recommendations to the specific role requirements" : ""}

IMPORTANT: Respond ONLY with valid JSON without markdown formatting. No \`\`\`json blocks.`
      : `Ты — карьерный коуч и эксперт по развитию soft skills для вайб-кодеров.
На основе результатов тестирования, сформируй персональный план развития.

Правила:
- Язык: русский
- Рекомендации должны быть конкретными и actionable
- Фокус на практических шагах, которые можно начать делать сегодня
- Учитывай контекст работы с AI-инструментами
- Для ресурсов: рекомендуй конкретные подходы и практики, а не ссылки
- Будь честным, но мотивирующим
${resume ? "- Если предоставлено резюме — учитывай текущий опыт и навыки кандидата, предлагай рекомендации исходя из его уровня" : ""}
${jobDescription ? "- Если предоставлено описание вакансии — привяжи рекомендации к требованиям этой конкретной роли" : ""}

ВАЖНО: Отвечай ТОЛЬКО валидным JSON без markdown-форматирования. Никаких \`\`\`json блоков.`;

    const dimNamesForPrompt = dimensionsToRecommend.map((d) =>
      isEn ? (dimensionMap[d]?.nameEn || d) : (dimensionMap[d]?.name || d)
    ).join(", ");

    const userMessage = isEn
      ? `User profile:

Dimension scores:
${scoresContext}

Overall score: ${analysis.overallScore}/5
${strengthsContext}
${weaknessesContext}
${deepDiveContext}${personalizationContext}

Generate recommendations for dimensions: ${dimNamesForPrompt}

JSON format:
{
  "summary": "Brief encouraging intro (1-2 sentences)",
  "recommendations": [
    {
      "dimension": "dimension_key",
      "dimensionName": "Dimension name",
      "score": 3.2,
      "title": "Short recommendation title",
      "description": "Description of the issue and why it matters (2-3 sentences)",
      "actions": [
        "Concrete step 1",
        "Concrete step 2",
        "Concrete step 3"
      ],
      "resources": [
        "Practice or approach 1",
        "Practice or approach 2"
      ]
    }
  ],
  "dailyHabits": [
    "Habit 1 you can start today",
    "Habit 2",
    "Habit 3"
  ],
  "weeklyGoals": [
    "Goal for this week 1",
    "Goal for this week 2",
    "Goal for this week 3"
  ]
}

Dimensions for recommendations (dimension keys): ${dimensionsToRecommend.join(", ")}
Use the score from test results for each dimension.`
      : `Профиль пользователя:

Баллы по измерениям:
${scoresContext}

Общий балл: ${analysis.overallScore}/5
${strengthsContext}
${weaknessesContext}
${deepDiveContext}${personalizationContext}

Сгенерируй рекомендации для измерений: ${dimNamesForPrompt}

Формат JSON:
{
  "summary": "Краткое ободряющее вступление (1-2 предложения)",
  "recommendations": [
    {
      "dimension": "dimension_key",
      "dimensionName": "Название измерения",
      "score": 3.2,
      "title": "Короткий заголовок рекомендации",
      "description": "Описание проблемы и почему это важно (2-3 предложения)",
      "actions": [
        "Конкретный шаг 1",
        "Конкретный шаг 2",
        "Конкретный шаг 3"
      ],
      "resources": [
        "Практика или подход 1",
        "Практика или подход 2"
      ]
    }
  ],
  "dailyHabits": [
    "Привычка 1, которую можно внедрить сегодня",
    "Привычка 2",
    "Привычка 3"
  ],
  "weeklyGoals": [
    "Цель на эту неделю 1",
    "Цель на эту неделю 2",
    "Цель на эту неделю 3"
  ]
}

Измерения для рекомендаций (dimension ключи): ${dimensionsToRecommend.join(", ")}
Используй score из результатов теста для каждого измерения.`;

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

    let result: RecommendationResult;
    try {
      result = JSON.parse(response);
    } catch {
      // Fallback
      result = {
        summary: isEn
          ? "Based on your profile, we've prepared recommendations. Even small changes in habits can significantly improve your soft skills."
          : "На основе вашего профиля мы подготовили рекомендации. Даже небольшие изменения в привычках могут значительно улучшить ваши soft skills.",
        recommendations: dimensionsToRecommend.map((dim) => {
          const score = analysis.dimensionScores.find(
            (d) => d.dimension === dim
          );
          const dimName = isEn ? (dimensionMap[dim]?.nameEn || dim) : (dimensionMap[dim]?.name || dim);
          return {
            dimension: dim,
            dimensionName: dimName,
            score: score?.score || 0,
            title: isEn ? `Development: ${dimName}` : `Развитие: ${dimName}`,
            description: isEn
              ? `Current score ${score?.score || 0}/5. There is potential for growth in this area.`
              : `Текущий балл ${score?.score || 0}/5. Есть потенциал для роста в этом направлении.`,
            actions: isEn
              ? [
                  "Pay conscious attention to this dimension in your daily work",
                  "Practice deliberately every day",
                ]
              : [
                  "Уделяйте этому измерению осознанное внимание в повседневной работе",
                  "Практикуйте целенаправленно каждый день",
                ],
            resources: [],
          };
        }),
        dailyHabits: isEn
          ? [
              "Before each prompt, formulate the expected result",
              "Review AI code before committing",
              "Share one useful technique with your team",
            ]
          : [
              "Перед каждым промптом формулируйте ожидаемый результат",
              "Ревьюьте AI-код перед коммитом",
              "Делитесь одним полезным приёмом с командой",
            ],
        weeklyGoals: isEn
          ? [
              "Try one new AI tool or approach",
              "Write documentation for one AI solution",
            ]
          : [
              "Попробуйте один новый AI-инструмент или подход",
              "Напишите документацию к одному AI-решению",
            ],
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recommend error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
