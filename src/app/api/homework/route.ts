import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/anthropic";
import { dimensionMap } from "@/lib/questions";
import { DimensionKey } from "@/types/assessment";

interface HomeworkRequest {
  dimensions: string[];
  timeFormat: string;
  context: string;
  selfAssessmentScores: Record<string, number>;
  quizScores: Record<string, number>;
  lang: string;
}

const timeFormatLabels: Record<string, { ru: string; en: string }> = {
  "15min": { ru: "15 минут", en: "15 minutes" },
  "1hour": { ru: "1 час", en: "1 hour" },
  "1day": { ru: "1 день", en: "1 day" },
  "1week": { ru: "1 неделя", en: "1 week" },
};

const contextLabels: Record<string, { ru: string; en: string }> = {
  alone_offline: { ru: "Один, без интернета (в дороге, на природе)", en: "Alone, no internet (traveling, outdoors)" },
  alone_computer: { ru: "Один, с компьютером", en: "Alone, with a computer" },
  team_inperson: { ru: "С командой — вживую", en: "With team — in person" },
  team_online: { ru: "С командой — онлайн/видео", en: "With team — online/video call" },
  family_inperson: { ru: "С семьёй/друзьями — вживую", en: "With family/friends — in person" },
  family_online: { ru: "С семьёй/друзьями — по видео", en: "With family/friends — video call" },
  child_inperson: { ru: "С ребёнком — вживую", en: "With a child — in person" },
  child_online: { ru: "С ребёнком — по видео", en: "With a child — video call" },
  friend_inperson: { ru: "С другом — вживую", en: "With a friend — in person" },
  friend_online: { ru: "С другом — по видео", en: "With a friend — video call" },
  // Legacy
  team: { ru: "С командой/коллегами", en: "With team/colleagues" },
  family: { ru: "С семьёй/друзьями", en: "With family/friends" },
};

// Exercise format catalog — AI picks one randomly
const EXERCISE_FORMATS_RU = `
Форматы упражнений (выбери ОДИН подходящий для данной темы, времени и контекста):
- НАБЛЮДЕНИЕ: понаблюдай за конкретным явлением (своим поведением, реакцией команды, паттерном в разговоре) и запиши выводы
- ЭКСПЕРИМЕНТ: попробуй сделать привычное действие по-другому и сравни результат
- РОЛЕВАЯ ИГРА: разыграй ситуацию с другим человеком по заданному сценарию
- ОБРАТНАЯ СВЯЗЬ: попроси конкретного человека дать фидбек по конкретному аспекту
- ЖУРНАЛИРОВАНИЕ: запиши свои мысли/реакции по конкретному шаблону
- МЫСЛЕННЫЙ ЭКСПЕРИМЕНТ: проанализируй ситуацию из прошлого через новую рамку/фреймворк
- ВЫЗОВ: поставь себе конкретное ограничение на определённый период (например, "1 час без перебивания собеседников")
- РАЗБОР КЕЙСА: возьми реальную ситуацию (свою или из контекста) и разбери по фреймворку`;

const EXERCISE_FORMATS_EN = `
Exercise formats (pick ONE that fits the topic, time, and context):
- OBSERVATION: observe a specific phenomenon (your behavior, team reaction, conversation pattern) and note findings
- EXPERIMENT: do something familiar in a different way and compare results
- ROLE PLAY: act out a situation with another person following a given scenario
- FEEDBACK REQUEST: ask a specific person for feedback on a specific aspect
- JOURNALING: write your thoughts/reactions using a specific template
- THOUGHT EXPERIMENT: analyze a past situation through a new framework
- CHALLENGE: set a specific constraint for a defined period (e.g., "1 hour without interrupting anyone")
- CASE ANALYSIS: take a real situation (yours or given) and analyze it through a framework`;

function buildSystemPrompt(isEn: boolean, isWithOthers: boolean, isWithChild: boolean, isOnline: boolean, isOffline: boolean, level: string): string {
  if (isEn) {
    return `You are a world-class soft skills coach. Generate a homework assignment that people will ACTUALLY want to do.

${EXERCISE_FORMATS_EN}

Structure:
1. TOPIC SUGGESTIONS — 2-3 specific situations/topics to choose from (not vague)
2. PREPARATION — what to do before (including warning other participants if applicable)
3. CORE EXERCISE — the main practice, using ONE exercise format from the list above
4. REFLECTION — 2-3 specific questions to ask yourself after

Difficulty level: ${level}
${level === "beginner" ? "Keep it simple and safe. Low stakes. The person is just starting to develop this skill." : ""}
${level === "advanced" ? "Make it challenging. Real stakes. The person already has some competence and needs to push boundaries." : ""}

Context constraints:
${isOffline ? "- NO INTERNET, NO DEVICE. Exercise must be purely mental: thinking, observing, remembering, internal dialogue. No writing (unless on napkin), no apps, no videos." : ""}
${isOnline ? "- Remote via VIDEO CALL. Adapt: screen sharing is available, body language is limited, use chat/reactions, account for connection issues." : ""}
${isWithOthers ? `- Involves other people. ALWAYS include:
  1. How to invite them ("Say: 'I'm doing a soft skills exercise, would you be willing to help me for ~X minutes? Here's what we'll do...'")
  2. Brief explanation of the exercise for participants
  3. A graceful exit if they say no` : ""}
${isWithChild ? `- WITH A CHILD (~10-14 years old). The exercise must be:
  - Fun and game-like, not lecturing
  - Age-appropriate (no heavy workplace scenarios)
  - Educational for both parent and child
  - Frame it as "let's play a game" not "I need to practice"` : ""}
${!isWithOthers && !isOffline ? "- Person is alone with a computer. Can use apps, write, watch videos, record themselves, etc." : ""}

Quality rules:
- Title: catchy, 3-6 words, sounds like something you'd want to try
- TopicSuggestions: 2-3 VERY specific situations. Not "a controversial topic" but "whether pineapple belongs on pizza, OR which movie to watch tonight, OR where to go for vacation"
- Steps: each step = one clear action. Not "practice active listening" but "For the next 3 minutes, only ask questions. No statements, no advice, no 'but'. Just questions."
- TimeEstimate: must be realistic for the chosen time format

RESPOND WITH VALID JSON ONLY. No markdown.`;
  }

  return `Ты — коуч мирового уровня по soft skills. Сгенерируй задание, которое человек РЕАЛЬНО захочет выполнить.

${EXERCISE_FORMATS_RU}

Структура:
1. ВАРИАНТЫ ТЕМЫ — 2-3 конкретных ситуации/темы на выбор (не абстрактных)
2. ПОДГОТОВКА — что сделать до начала (включая предупреждение участников если нужно)
3. ОСНОВНОЕ УПРАЖНЕНИЕ — главная практика, используя ОДИН формат из списка выше
4. РЕФЛЕКСИЯ — 2-3 конкретных вопроса для самоанализа после

Уровень сложности: ${level}
${level === "beginner" ? "Держи просто и безопасно. Низкие ставки. Человек только начинает развивать этот навык." : ""}
${level === "advanced" ? "Сделай вызовом. Реальные ставки. У человека уже есть базовая компетенция, нужно выйти из зоны комфорта." : ""}

Ограничения контекста:
${isOffline ? "- НЕТ ИНТЕРНЕТА, НЕТ УСТРОЙСТВА. Упражнение должно быть чисто ментальным: думать, наблюдать, вспоминать, внутренний диалог. Нельзя писать (разве что на салфетке), нет приложений, нет видео." : ""}
${isOnline ? "- Удалённо по ВИДЕОСВЯЗИ. Учти: доступен шеринг экрана, язык тела ограничен, есть чат/реакции, возможны проблемы со связью." : ""}
${isWithOthers ? `- С другими людьми. ОБЯЗАТЕЛЬНО включи:
  1. Как их пригласить ("Скажи: 'Я делаю упражнение на развитие [навык], можешь ли ты мне помочь ~X минут? Вот что мы будем делать...'")
  2. Краткое объяснение упражнения для участников
  3. План Б если откажутся` : ""}
${isWithChild ? `- С РЕБЁНКОМ (~10-14 лет). Упражнение должно быть:
  - Весёлым и игровым, не нравоучительным
  - Подходящим по возрасту (не тяжёлые рабочие сценарии)
  - Полезным и для родителя, и для ребёнка
  - Подать как "давай поиграем в игру", а не "мне нужно потренироваться"` : ""}
${!isWithOthers && !isOffline ? "- Человек один с компьютером. Может использовать приложения, писать, смотреть видео, записывать себя и т.д." : ""}

Правила качества:
- Название: цепляющее, 3-6 слов, звучит как то, что хочется попробовать
- Варианты темы: 2-3 ОЧЕНЬ конкретных ситуации. Не "спорная тема" а "ананасы на пицце, ИЛИ какой фильм смотреть вечером, ИЛИ куда поехать в отпуск"
- Шаги: каждый шаг = одно ясное действие. Не "практикуй активное слушание" а "Следующие 3 минуты только задавай вопросы. Никаких утверждений, советов, 'но'. Только вопросы."
- Оценка времени: должна быть реалистичной для выбранного формата времени

ОТВЕЧАЙ ТОЛЬКО ВАЛИДНЫМ JSON. Без markdown.`;
}

function buildUserMessage(isEn: boolean, dimContext: string, timeLabel: string, ctxLabel: string): string {
  const exampleRu = `
Пример хорошего задания (для ориентира, НЕ копируй):
{
  "title": "Три минуты только вопросов",
  "description": "Тренировка активного слушания через жёсткое ограничение: в разговоре ты можешь только задавать вопросы. Никаких утверждений. Это заставит слушать, а не готовить ответ.",
  "topicSuggestions": ["Спроси коллегу/друга о его текущем проекте", "Обсуди с партнёром планы на выходные", "Узнай у знакомого, как он выбрал свою профессию"],
  "preparation": ["Выбери одну тему из предложенных", "Предупреди собеседника: 'Я делаю упражнение — 3 минуты буду только задавать тебе вопросы, окей?'", "Поставь таймер на 3 минуты"],
  "steps": ["Начни разговор с открытого вопроса по выбранной теме", "Когда хочется высказать мнение — переформулируй в вопрос ('А ты что об этом думаешь?' вместо 'Я думаю что...')", "Если наступила пауза — задай уточняющий вопрос к последнему ответу", "После 3 минут поблагодари и спроси: 'Как тебе было?'"],
  "reflection": ["Сколько раз ты хотел сказать утверждение вместо вопроса?", "Узнал ли ты что-то неожиданное?", "Как собеседник реагировал на то, что его только слушают?"],
  "expectedOutcome": "Ты почувствуешь разницу между 'слушать чтобы ответить' и 'слушать чтобы понять'. И заметишь, как много нового можно узнать, просто задавая вопросы.",
  "timeEstimate": "~5 минут (3 мин разговор + 2 мин рефлексия)"
}`;

  const exampleEn = `
Example of a good assignment (for reference, do NOT copy):
{
  "title": "Three Minutes of Questions Only",
  "description": "Active listening training through a hard constraint: you can only ask questions in the conversation. No statements. This forces you to listen rather than prepare your reply.",
  "topicSuggestions": ["Ask a colleague about their current project", "Discuss weekend plans with your partner", "Ask a friend how they chose their career"],
  "preparation": ["Pick one topic from the suggestions", "Warn your conversation partner: 'I'm doing an exercise — I'll only ask you questions for 3 minutes, OK?'", "Set a 3-minute timer"],
  "steps": ["Start with an open question about the chosen topic", "When you want to state something — rephrase as a question ('What do you think?' instead of 'I think...')", "If there's a pause — ask a follow-up about their last answer", "After 3 minutes, thank them and ask: 'How was that for you?'"],
  "reflection": ["How many times did you want to make a statement instead of a question?", "Did you learn something unexpected?", "How did the other person react to being just listened to?"],
  "expectedOutcome": "You'll feel the difference between 'listening to reply' and 'listening to understand'. And notice how much you can learn by just asking questions.",
  "timeEstimate": "~5 minutes (3 min conversation + 2 min reflection)"
}`;

  if (isEn) {
    return `Generate a homework assignment:

Dimensions to develop:
${dimContext}

Time budget: ${timeLabel}
Context: ${ctxLabel}
${exampleEn}

Now generate YOUR assignment (different format, different exercise type). JSON:
{
  "title": "...",
  "description": "...",
  "topicSuggestions": ["...", "...", "..."],
  "preparation": ["...", "..."],
  "steps": ["...", "...", "...", "..."],
  "reflection": ["...", "..."],
  "expectedOutcome": "...",
  "timeEstimate": "~..."
}`;
  }

  return `Сгенерируй домашнее задание:

Измерения для развития:
${dimContext}

Бюджет времени: ${timeLabel}
Контекст: ${ctxLabel}
${exampleRu}

Теперь сгенерируй СВОЁ задание (другой формат, другой тип упражнения). JSON:
{
  "title": "...",
  "description": "...",
  "topicSuggestions": ["...", "...", "..."],
  "preparation": ["...", "..."],
  "steps": ["...", "...", "...", "..."],
  "reflection": ["...", "..."],
  "expectedOutcome": "...",
  "timeEstimate": "~..."
}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const body: HomeworkRequest = await request.json();
    const { dimensions, timeFormat, context, selfAssessmentScores, quizScores, lang } = body;

    if (!dimensions || dimensions.length === 0) {
      return NextResponse.json(
        { error: "No dimensions provided" },
        { status: 400 }
      );
    }

    const isEn = lang === "en";
    const isWithOthers = context.includes("team") || context.includes("family") || context.includes("child") || context.includes("friend");
    const isWithChild = context.includes("child");
    const isOnline = context.includes("online");
    const isOffline = context === "alone_offline";

    // Determine difficulty level from scores
    const avgSelfScore = dimensions.reduce((sum, d) => sum + (selfAssessmentScores?.[d] ?? 3), 0) / dimensions.length;
    const level = avgSelfScore < 3 ? "beginner" : "advanced";

    // Build dimension context with scores
    const dimContext = dimensions
      .map((d) => {
        const info = dimensionMap[d as DimensionKey];
        const name = isEn ? info?.nameEn || d : info?.name || d;
        const selfScore = selfAssessmentScores?.[d];
        const quizScore = quizScores?.[d];
        let line = `- ${name}`;
        if (selfScore !== undefined) line += ` (${isEn ? "self" : "самооценка"}: ${selfScore}/5)`;
        if (quizScore !== undefined) line += ` (${isEn ? "quiz" : "квиз"}: ${quizScore}%)`;
        return line;
      })
      .join("\n");

    const timeLabelObj = timeFormatLabels[timeFormat] || timeFormatLabels["1hour"];
    const timeLabel = isEn ? timeLabelObj.en : timeLabelObj.ru;
    const ctxLabelObj = contextLabels[context] || contextLabels["alone_computer"];
    const ctxLabel = isEn ? ctxLabelObj.en : ctxLabelObj.ru;

    const systemPrompt = buildSystemPrompt(isEn, isWithOthers, isWithChild, isOnline, isOffline, level);
    const userMessage = buildUserMessage(isEn, dimContext, timeLabel, ctxLabel);

    let response: string;
    try {
      response = await callClaude(systemPrompt, userMessage);
    } catch (apiError) {
      console.error("Homework API error:", apiError);
      return NextResponse.json(
        { error: isEn ? "AI generation failed. Please try again." : "Ошибка AI-генерации. Попробуйте ещё раз." },
        { status: 500 }
      );
    }

    let homework;
    try {
      homework = JSON.parse(response);
    } catch {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          homework = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { error: isEn ? "Failed to parse AI response" : "Не удалось разобрать ответ AI" },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: isEn ? "Failed to parse AI response" : "Не удалось разобрать ответ AI" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(homework);
  } catch (error) {
    console.error("Homework generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate homework" },
      { status: 500 }
    );
  }
}
