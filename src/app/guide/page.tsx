"use client";

import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/LangContext";

/* ─── i18n helpers ─── */
type L = "ru" | "en";
function t(lang: string, ru: string, en: string) {
  return lang === "ru" ? ru : en;
}

/* ─── Section data ─── */
interface Section {
  id: string;
  titleRu: string;
  titleEn: string;
  contentRu: string[];
  contentEn: string[];
  conceptsRu: { name: string; desc: string }[];
  conceptsEn: { name: string; desc: string }[];
}

const SECTIONS: Section[] = [
  {
    id: "adaptability",
    titleRu: "Адаптивность",
    titleEn: "Adaptability",
    contentRu: [
      "Адаптивность — это способность эффективно действовать в условиях неопределённости и перемен. В эпоху AI эта компетенция стала критически важной: технологические циклы сжимаются, целые профессии трансформируются за годы, а не десятилетия. Адаптивные люди не просто «переживают» изменения — они используют их как источник возможностей.",
      "Кэрол Дуэк в своём исследовании показала, что фундамент адаптивности — это установка на рост (growth mindset). Люди с фиксированным мышлением воспринимают неудачи как доказательство своей несостоятельности, а люди с установкой на рост видят в них возможность для обучения. Это не абстрактная философия: исследования показывают, что сотрудники с growth mindset на 47% чаще принимают обратную связь и на 34% чаще берутся за сложные задачи.",
      "Нассим Талеб развил эту идею через концепцию антихрупкости: не просто устойчивость к стрессу, а способность становиться сильнее от потрясений. Антихрупкие системы (и люди) извлекают пользу из волатильности. Практически это выражается в готовности экспериментировать, быстро проваливаться и быстро учиться — принцип fail fast. В AI-контексте это означает готовность пересматривать свои рабочие процессы, когда появляется новый инструмент, а не цепляться за привычные способы работы.",
      "Модель VUCA (Volatility, Uncertainty, Complexity, Ambiguity) описывает современную среду и требует соответствующих ответов: видение против волатильности, понимание против неопределённости, ясность против сложности и гибкость против неоднозначности. Адаптивный профессионал строит T-shaped компетенции — глубокую экспертизу в одной области плюс широкий набор смежных навыков."
    ],
    contentEn: [
      "Adaptability is the ability to act effectively amid uncertainty and change. In the AI era, this competency has become critically important: technology cycles are compressing, entire professions transform in years rather than decades. Adaptive people don't just 'survive' changes — they leverage them as a source of opportunity.",
      "Carol Dweck's research demonstrated that the foundation of adaptability is a growth mindset. People with a fixed mindset perceive failures as proof of inadequacy, while those with a growth mindset see them as learning opportunities. This is not abstract philosophy: studies show that employees with a growth mindset are 47% more likely to accept feedback and 34% more likely to take on challenging tasks.",
      "Nassim Taleb expanded this idea through the concept of antifragility: not merely resilience to stress, but the ability to grow stronger from shocks. Antifragile systems (and people) benefit from volatility. In practice, this means willingness to experiment, fail fast, and learn quickly. In the AI context, it means readiness to rethink your workflows when a new tool emerges rather than clinging to familiar ways of working.",
      "The VUCA model (Volatility, Uncertainty, Complexity, Ambiguity) describes the modern environment and demands corresponding responses: vision against volatility, understanding against uncertainty, clarity against complexity, and agility against ambiguity. An adaptive professional builds T-shaped competencies — deep expertise in one area plus a broad set of adjacent skills."
    ],
    conceptsRu: [
      { name: "Growth Mindset (Кэрол Дуэк)", desc: "Установка на рост: интеллект и навыки можно развивать через усилия и обучение, неудачи — часть процесса роста" },
      { name: "Антихрупкость (Нассим Талеб)", desc: "Системы и люди, которые не просто выдерживают стресс, а становятся сильнее от потрясений и хаоса" },
      { name: "VUCA-среда", desc: "Модель описания современной среды: волатильность, неопределённость, сложность и неоднозначность" },
      { name: "Fail Fast / Learn Fast", desc: "Принцип быстрых экспериментов: лучше быстро узнать, что не работает, чем долго строить неверное решение" },
      { name: "T-shaped компетенции", desc: "Глубина в одной области + широта в смежных — баланс специализации и универсальности" }
    ],
    conceptsEn: [
      { name: "Growth Mindset (Carol Dweck)", desc: "The belief that intelligence and skills can be developed through effort and learning; failures are part of the growth process" },
      { name: "Antifragility (Nassim Taleb)", desc: "Systems and people that don't just withstand stress but grow stronger from shocks and chaos" },
      { name: "VUCA Environment", desc: "A model describing the modern environment: volatility, uncertainty, complexity, and ambiguity" },
      { name: "Fail Fast / Learn Fast", desc: "The principle of rapid experimentation: better to quickly discover what doesn't work than to spend a long time building the wrong solution" },
      { name: "T-shaped Competencies", desc: "Depth in one area plus breadth in adjacent ones — a balance of specialization and versatility" }
    ],
  },
  {
    id: "collaboration",
    titleRu: "Сотрудничество",
    titleEn: "Collaboration",
    contentRu: [
      "Сотрудничество — это умение работать с другими людьми для достижения общих целей, создавая результат, который превышает сумму индивидуальных вкладов. В мире AI-усиленных команд эффективная коллаборация требует новых навыков: умения работать в гибридных командах человек+AI, распределять задачи между людьми и инструментами, синхронизировать асинхронную работу.",
      "Адам Грант в книге «Брать или отдавать» описал три стратегии взаимодействия: givers (дающие), takers (берущие) и matchers (обменивающие). Исследования показали парадокс: самые неуспешные в организациях — givers, но и самые успешные тоже givers. Разница в том, что успешные givers помогают стратегически: они устанавливают границы и фокусируются на помощи с высоким воздействием. Это создаёт win-win взаимодействия, которые усиливают всю команду.",
      "Концепция психологической безопасности (Эми Эдмондсон) — фундамент эффективной командной работы. Проект Aristotle в Google подтвердил: главный фактор успеха команды — не состав, не навыки и не ресурсы, а ощущение безопасности. В психологически безопасной команде люди готовы задавать «глупые» вопросы, признавать ошибки и предлагать нестандартные идеи.",
      "На практике сотрудничество требует баланса между индивидуальной продуктивностью и командной синергией. Фреймворк RACI (Responsible, Accountable, Consulted, Informed) помогает избежать размытия ответственности. Модель Такмана (Forming → Storming → Norming → Performing) описывает естественные стадии развития команды. Понимание, что конфликт на стадии Storming — это норма, а не провал, помогает руководителям не паниковать и поддерживать команду на пути к высокой продуктивности."
    ],
    contentEn: [
      "Collaboration is the ability to work with others toward shared goals, creating results that exceed the sum of individual contributions. In the world of AI-augmented teams, effective collaboration demands new skills: working in hybrid human+AI teams, distributing tasks between people and tools, and synchronizing asynchronous work.",
      "Adam Grant in 'Give and Take' described three interaction strategies: givers, takers, and matchers. Research revealed a paradox: the least successful people in organizations are givers, but so are the most successful. The difference is that successful givers help strategically: they set boundaries and focus on high-impact assistance. This creates win-win interactions that strengthen the entire team.",
      "The concept of psychological safety (Amy Edmondson) is the foundation of effective teamwork. Google's Project Aristotle confirmed that the main factor in team success is not composition, skills, or resources — it's the feeling of safety. In a psychologically safe team, people are willing to ask 'stupid' questions, admit mistakes, and propose unconventional ideas.",
      "In practice, collaboration requires a balance between individual productivity and team synergy. The RACI framework (Responsible, Accountable, Consulted, Informed) helps prevent diffusion of responsibility. Tuckman's model (Forming, Storming, Norming, Performing) describes the natural stages of team development. Understanding that conflict during the Storming phase is normal, not a failure, helps leaders avoid panic and support the team on its path to high performance."
    ],
    conceptsRu: [
      { name: "Givers, Takers, Matchers (Адам Грант)", desc: "Три стратегии взаимодействия: дающие, берущие и обменивающие. Стратегические givers добиваются наибольшего успеха" },
      { name: "Психологическая безопасность (Эми Эдмондсон)", desc: "Среда, где люди не боятся ошибаться, задавать вопросы и высказывать мнения — главный фактор успеха команды" },
      { name: "RACI-матрица", desc: "Распределение ролей: кто отвечает (R), кто подотчётен (A), с кем советуются (C), кого информируют (I)" },
      { name: "Стадии команды Такмана", desc: "Forming → Storming → Norming → Performing: естественный путь от группы незнакомцев к слаженной команде" },
      { name: "Win-Win подход", desc: "Стратегия переговоров и сотрудничества, при которой обе стороны получают выгоду, а не одна за счёт другой" }
    ],
    conceptsEn: [
      { name: "Givers, Takers, Matchers (Adam Grant)", desc: "Three interaction strategies: givers, takers, and matchers. Strategic givers achieve the greatest success" },
      { name: "Psychological Safety (Amy Edmondson)", desc: "An environment where people aren't afraid to make mistakes, ask questions, or voice opinions — the top factor in team success" },
      { name: "RACI Matrix", desc: "Role distribution: who is Responsible, Accountable, Consulted, and Informed for each task" },
      { name: "Tuckman's Stages of Team Development", desc: "Forming, Storming, Norming, Performing: the natural path from a group of strangers to a cohesive team" },
      { name: "Win-Win Approach", desc: "A negotiation and collaboration strategy where both sides benefit rather than one at the expense of the other" }
    ],
  },
  {
    id: "communication",
    titleRu: "Коммуникация",
    titleEn: "Communication",
    contentRu: [
      "Коммуникация — это не просто передача информации, а создание общего понимания между людьми. В эпоху AI, когда машины берут на себя рутинную обработку данных, человеческая коммуникация — убеждение, переговоры, эмпатическое слушание — становится ключевым конкурентным преимуществом. Умение ясно формулировать мысли, адаптировать стиль под аудиторию и считывать невербальные сигналы определяет профессиональный успех.",
      "Модель Шульца фон Туна описывает четыре аспекта каждого сообщения: фактическое содержание (что я сообщаю), самораскрытие (что я говорю о себе), отношение (что я думаю о собеседнике) и призыв (чего я хочу добиться). Большинство конфликтов возникают, когда отправитель и получатель воспринимают сообщение на разных уровнях. Осознание этих четырёх «ушей» коммуникации резко снижает количество недоразумений.",
      "Активное слушание — фундамент эффективной коммуникации. Это не пассивное ожидание своей очереди говорить, а целенаправленный процесс: парафраз (пересказ своими словами), отражение чувств, уточняющие вопросы, резюмирование. Исследования показывают, что руководители, практикующие активное слушание, получают на 40% больше релевантной информации от подчинённых.",
      "Ненасильственное общение (NVC) Маршалла Розенберга предлагает структуру: наблюдение (без оценки) → чувства → потребности → просьба. Вместо «ты всегда опаздываешь» — «когда совещание начинается на 15 минут позже (наблюдение), я чувствую раздражение (чувство), потому что мне важна предсказуемость расписания (потребность), не мог бы ты предупреждать, если задерживаешься (просьба)?». Этот подход особенно ценен в межкультурных и удалённых командах."
    ],
    contentEn: [
      "Communication is not merely transmitting information but creating shared understanding between people. In the AI era, when machines handle routine data processing, human communication — persuasion, negotiation, empathetic listening — becomes a key competitive advantage. The ability to articulate thoughts clearly, adapt style to your audience, and read nonverbal signals determines professional success.",
      "Schulz von Thun's four-sides model describes four aspects of every message: factual content (what I'm communicating), self-revelation (what I'm saying about myself), relationship (what I think about the listener), and appeal (what I want to achieve). Most conflicts arise when the sender and receiver perceive the message on different levels. Awareness of these four 'ears' of communication dramatically reduces misunderstandings.",
      "Active listening is the foundation of effective communication. It is not passively waiting for your turn to speak but a deliberate process: paraphrasing (restating in your own words), reflecting feelings, asking clarifying questions, and summarizing. Research shows that managers who practice active listening receive 40% more relevant information from their reports.",
      "Marshall Rosenberg's Nonviolent Communication (NVC) offers a structure: observation (without judgment), feelings, needs, and request. Instead of 'you're always late,' try: 'when the meeting starts 15 minutes late (observation), I feel frustrated (feeling) because schedule predictability is important to me (need) — could you let me know if you'll be delayed (request)?' This approach is especially valuable in cross-cultural and remote teams."
    ],
    conceptsRu: [
      { name: "Четыре стороны сообщения (Шульц фон Тун)", desc: "Каждое сообщение содержит четыре слоя: факт, самораскрытие, отношение и призыв" },
      { name: "Активное слушание", desc: "Парафраз, отражение чувств, уточняющие вопросы — техники, которые превращают слушание в инструмент влияния" },
      { name: "Ненасильственное общение (NVC)", desc: "Структура Розенберга: наблюдение → чувства → потребности → просьба — для конфликтных и деликатных разговоров" },
      { name: "Обратная связь (SBI-модель)", desc: "Situation-Behavior-Impact: конкретная ситуация, наблюдаемое поведение, его воздействие — без оценок и ярлыков" },
      { name: "Сторителлинг", desc: "Структурированные истории для убеждения: герой, конфликт, решение — работает лучше фактов и аргументов" }
    ],
    conceptsEn: [
      { name: "Four Sides of a Message (Schulz von Thun)", desc: "Every message has four layers: factual content, self-revelation, relationship, and appeal" },
      { name: "Active Listening", desc: "Paraphrasing, reflecting feelings, clarifying questions — techniques that turn listening into a tool of influence" },
      { name: "Nonviolent Communication (NVC)", desc: "Rosenberg's structure: observation, feelings, needs, request — for difficult and sensitive conversations" },
      { name: "SBI Feedback Model", desc: "Situation-Behavior-Impact: the specific situation, observable behavior, and its impact — without judgments or labels" },
      { name: "Storytelling", desc: "Structured narratives for persuasion: hero, conflict, resolution — works better than facts and arguments alone" }
    ],
  },
  {
    id: "conflict-resolution",
    titleRu: "Разрешение конфликтов",
    titleEn: "Conflict Resolution",
    contentRu: [
      "Конфликт — естественная часть любого взаимодействия. Проблема не в самом конфликте, а в неумении его разрешать конструктивно. В AI-эпоху конфликты приобретают новые формы: споры о распределении работы между людьми и автоматизацией, страх замещения, конфликты между «ранними adopters» и «традиционалистами» в команде. Умение работать с конфликтом — один из самых ценных навыков лидера.",
      "Модель Томаса-Килманна описывает пять стратегий поведения в конфликте по двум осям (забота о своих интересах vs. забота об интересах другого): конкуренция (win-lose), уступчивость (lose-win), избегание (lose-lose), компромисс (частичный win-win) и сотрудничество (полный win-win). Нет «правильной» стратегии для всех случаев: конкуренция уместна в кризисе, избегание — когда проблема незначительна, а сотрудничество — когда важны и результат, и отношения.",
      "Эскалация конфликтов следует предсказуемым паттернам: от разногласий (disagreement) через персонализацию (переход от проблемы к личности) к поляризации (мы vs. они). Ключевой навык — деэскалация: вернуть разговор от личностей к проблемам, от позиций к интересам. Гарвардский метод переговоров (Fisher & Ury) учит: отделяйте людей от проблемы, фокусируйтесь на интересах, а не позициях, генерируйте варианты для взаимной выгоды, используйте объективные критерии.",
      "Медиация — структурированный процесс, в котором нейтральная третья сторона помогает участникам конфликта найти решение. Медиатор не предлагает решения, а создаёт пространство для диалога: каждая сторона высказывается, обозначает свои потребности, и вместе они ищут варианты. Этот навык всё чаще требуется не только от HR, но и от тимлидов и менеджеров проектов."
    ],
    contentEn: [
      "Conflict is a natural part of any interaction. The problem is not conflict itself but the inability to resolve it constructively. In the AI era, conflicts take new forms: disputes over work distribution between humans and automation, fear of replacement, clashes between 'early adopters' and 'traditionalists' on teams. The ability to manage conflict is one of the most valuable leadership skills.",
      "The Thomas-Kilmann model describes five conflict-handling strategies along two axes (concern for self vs. concern for others): competing (win-lose), accommodating (lose-win), avoiding (lose-lose), compromising (partial win-win), and collaborating (full win-win). There is no 'correct' strategy for all situations: competing is appropriate in a crisis, avoiding when the issue is trivial, and collaborating when both the outcome and the relationship matter.",
      "Conflict escalation follows predictable patterns: from disagreement through personalization (shifting from the problem to the person) to polarization (us vs. them). The key skill is de-escalation: returning the conversation from personalities to problems, from positions to interests. The Harvard Negotiation method (Fisher & Ury) teaches: separate people from the problem, focus on interests not positions, generate options for mutual gain, and use objective criteria.",
      "Mediation is a structured process in which a neutral third party helps conflict participants find a resolution. The mediator doesn't propose solutions but creates space for dialogue: each party speaks, identifies their needs, and together they explore options. This skill is increasingly expected not only from HR professionals but also from team leads and project managers."
    ],
    conceptsRu: [
      { name: "Модель Томаса-Килманна", desc: "Пять стратегий конфликта: конкуренция, уступчивость, избегание, компромисс и сотрудничество — выбор зависит от контекста" },
      { name: "Гарвардский метод переговоров", desc: "Fisher & Ury: отделяйте людей от проблемы, фокусируйтесь на интересах, ищите варианты, используйте объективные критерии" },
      { name: "Эскалация и деэскалация", desc: "Конфликт проходит стадии: разногласие → персонализация → поляризация. Деэскалация — возврат от личностей к проблемам" },
      { name: "Медиация", desc: "Структурированный диалог с нейтральным посредником — медиатор не решает за участников, а помогает им найти решение" },
      { name: "Позиции vs. интересы", desc: "Позиция — то, что человек требует; интерес — почему ему это важно. Фокус на интересах открывает пространство для решений" }
    ],
    conceptsEn: [
      { name: "Thomas-Kilmann Model", desc: "Five conflict strategies: competing, accommodating, avoiding, compromising, and collaborating — the choice depends on context" },
      { name: "Harvard Negotiation Method", desc: "Fisher & Ury: separate people from the problem, focus on interests, invent options, and use objective criteria" },
      { name: "Escalation and De-escalation", desc: "Conflict progresses through stages: disagreement, personalization, polarization. De-escalation returns focus from personalities to problems" },
      { name: "Mediation", desc: "A structured dialogue with a neutral facilitator who doesn't decide for participants but helps them find their own resolution" },
      { name: "Positions vs. Interests", desc: "A position is what someone demands; an interest is why it matters. Focusing on interests opens space for solutions" }
    ],
  },
  {
    id: "critical-thinking",
    titleRu: "Критическое мышление",
    titleEn: "Critical Thinking",
    contentRu: [
      "Критическое мышление — способность анализировать информацию, выявлять скрытые допущения, оценивать аргументы и делать обоснованные выводы. В эпоху AI это навык первостепенной важности: когда модели генерируют убедительный, но потенциально ошибочный текст, умение проверять, сомневаться и задавать правильные вопросы становится ключевым отличием профессионала.",
      "Таксономия Блума описывает шесть уровней когнитивных процессов: запоминание → понимание → применение → анализ → оценка → создание. Критическое мышление начинается с уровня анализа и выше. AI-инструменты сильны на нижних уровнях (запоминание, понимание, применение), но человеческая ценность концентрируется на верхних: способность оценить качество аргумента, выявить ложные дихотомии, увидеть системные связи.",
      "Когнитивные искажения — систематические ошибки мышления, которые влияют на принятие решений. Confirmation bias заставляет нас искать информацию, подтверждающую наши убеждения. Anchoring effect привязывает оценки к первому числу, которое мы услышали. Dunning-Kruger effect объясняет, почему новички переоценивают свои способности, а эксперты — недооценивают. Знание этих ловушек не делает нас иммунными, но повышает шансы их заметить.",
      "Бритва Оккама — принцип «не умножай сущности без необходимости»: из двух объяснений выбирай более простое, если оно объясняет факты. Метод «пяти почему» (Toyota) помогает добраться до корневой причины проблемы, а не лечить симптомы. Мышление первых принципов (first principles thinking), популяризированное Илоном Маском, предлагает разбирать проблему до фундаментальных истин, а не опираться на аналогии и конвенции."
    ],
    contentEn: [
      "Critical thinking is the ability to analyze information, identify hidden assumptions, evaluate arguments, and draw well-founded conclusions. In the AI era, this is a skill of paramount importance: when models generate convincing but potentially erroneous text, the ability to verify, question, and ask the right questions becomes a key professional differentiator.",
      "Bloom's Taxonomy describes six levels of cognitive processes: remembering, understanding, applying, analyzing, evaluating, and creating. Critical thinking begins at the analysis level and above. AI tools excel at the lower levels (remembering, understanding, applying), but human value concentrates at the top: the ability to evaluate argument quality, identify false dichotomies, and see systemic connections.",
      "Cognitive biases are systematic thinking errors that affect decision-making. Confirmation bias makes us seek information that confirms our beliefs. The anchoring effect ties our estimates to the first number we hear. The Dunning-Kruger effect explains why beginners overestimate their abilities while experts underestimate theirs. Knowing these traps doesn't make us immune, but it increases our chances of noticing them.",
      "Occam's Razor is the principle of parsimony: 'do not multiply entities beyond necessity' — between two explanations, choose the simpler one if it accounts for the facts. The Five Whys method (Toyota) helps reach the root cause of a problem rather than treating symptoms. First principles thinking, popularized by Elon Musk, proposes breaking down problems to fundamental truths rather than relying on analogies and conventions."
    ],
    conceptsRu: [
      { name: "Таксономия Блума", desc: "Шесть уровней мышления: запоминание → понимание → применение → анализ → оценка → создание" },
      { name: "Когнитивные искажения", desc: "Системные ошибки мышления: confirmation bias, anchoring, Dunning-Kruger, sunk cost fallacy и другие" },
      { name: "Бритва Оккама", desc: "Из конкурирующих объяснений предпочитай более простое — не усложняй без необходимости" },
      { name: "Метод «пяти почему»", desc: "Последовательно спрашивай «почему?» пять раз, чтобы добраться от симптома к корневой причине" },
      { name: "First Principles Thinking", desc: "Разбирай проблему до фундаментальных истин, а не опирайся на аналогии, конвенции и «так принято»" }
    ],
    conceptsEn: [
      { name: "Bloom's Taxonomy", desc: "Six levels of thinking: remembering, understanding, applying, analyzing, evaluating, creating" },
      { name: "Cognitive Biases", desc: "Systematic thinking errors: confirmation bias, anchoring, Dunning-Kruger, sunk cost fallacy, and more" },
      { name: "Occam's Razor", desc: "Among competing explanations, prefer the simpler one — don't add complexity without necessity" },
      { name: "Five Whys Method", desc: "Ask 'why?' five times in succession to move from the symptom to the root cause" },
      { name: "First Principles Thinking", desc: "Break a problem down to fundamental truths rather than relying on analogies, conventions, and 'how it's always been done'" }
    ],
  },
  {
    id: "emotional-intelligence",
    titleRu: "Эмоциональный интеллект",
    titleEn: "Emotional Intelligence",
    contentRu: [
      "Эмоциональный интеллект (EQ) — способность распознавать, понимать и управлять своими эмоциями, а также понимать и влиять на эмоции других. Дэниел Гоулман показал, что EQ предсказывает профессиональный успех лучше, чем IQ, особенно на руководящих позициях. В AI-эпоху EQ становится ещё ценнее: машины превосходят нас в обработке данных, но эмпатия, мотивация и социальное влияние остаются человеческими территориями.",
      "Гоулман выделил пять компонентов EQ: самоосознанность (понимание своих эмоций), саморегуляция (управление импульсами), мотивация (внутренний драйв), эмпатия (понимание чувств других) и социальные навыки (управление отношениями). Самоосознанность — фундамент: без способности распознать, что ты чувствуешь и почему, невозможно управлять ни своими, ни чужими эмоциями. Практика: ведение «эмоционального дневника» или регулярная рефлексия.",
      "Эмпатия бывает трёх видов: когнитивная (я понимаю, что ты чувствуешь), эмоциональная (я чувствую то же, что и ты) и сострадательная (я хочу помочь). В профессиональном контексте чаще нужна когнитивная эмпатия — она позволяет понимать перспективу другого без эмоционального выгорания. Эмоциональная эмпатия важна, но без саморегуляции приводит к «эмпатическому дистрессу».",
      "Практическое применение EQ включает умение считывать «эмоциональную температуру» комнаты, адаптировать стиль общения под состояние собеседника и создавать среду, в которой люди могут быть уязвимыми. Это не soft skill в смысле «мягкий» — это сложный навык, требующий постоянной практики. Триггеры — ситуации, вызывающие сильные автоматические реакции — и работа с ними через паузу и осознанный выбор реакции являются основой саморегуляции."
    ],
    contentEn: [
      "Emotional intelligence (EQ) is the ability to recognize, understand, and manage your own emotions, as well as understand and influence the emotions of others. Daniel Goleman demonstrated that EQ predicts professional success better than IQ, especially in leadership positions. In the AI era, EQ becomes even more valuable: machines surpass us in data processing, but empathy, motivation, and social influence remain human territories.",
      "Goleman identified five components of EQ: self-awareness (understanding your emotions), self-regulation (managing impulses), motivation (internal drive), empathy (understanding others' feelings), and social skills (managing relationships). Self-awareness is the foundation: without the ability to recognize what you feel and why, it is impossible to manage either your own or others' emotions. Practice: keeping an 'emotional journal' or regular reflection.",
      "Empathy comes in three types: cognitive (I understand what you feel), emotional (I feel what you feel), and compassionate (I want to help). In a professional context, cognitive empathy is most needed — it allows understanding another's perspective without emotional burnout. Emotional empathy is important but, without self-regulation, leads to 'empathic distress.'",
      "Practical application of EQ includes the ability to read the 'emotional temperature' of the room, adapt your communication style to the listener's state, and create an environment where people can be vulnerable. This is not a 'soft' skill — it is a complex skill requiring constant practice. Triggers — situations that provoke strong automatic reactions — and managing them through pausing and making a conscious choice of response form the foundation of self-regulation."
    ],
    conceptsRu: [
      { name: "Пять компонентов EQ (Гоулман)", desc: "Самоосознанность, саморегуляция, мотивация, эмпатия и социальные навыки — пять измерений эмоционального интеллекта" },
      { name: "Три типа эмпатии", desc: "Когнитивная (понимаю), эмоциональная (чувствую то же) и сострадательная (хочу помочь) — разные уровни эмоциональной связи" },
      { name: "Эмоциональные триггеры", desc: "Ситуации, вызывающие автоматические сильные реакции. Осознание триггеров — первый шаг к управлению ими" },
      { name: "Саморегуляция", desc: "Умение управлять импульсами: пауза между стимулом и реакцией, осознанный выбор поведения вместо автоматического" },
      { name: "Эмоциональная гранулярность", desc: "Способность различать тонкие оттенки эмоций (не просто «плохо», а «разочарован», «обижен», «тревожен»)" }
    ],
    conceptsEn: [
      { name: "Five Components of EQ (Goleman)", desc: "Self-awareness, self-regulation, motivation, empathy, and social skills — five dimensions of emotional intelligence" },
      { name: "Three Types of Empathy", desc: "Cognitive (I understand), emotional (I feel the same), and compassionate (I want to help) — different levels of emotional connection" },
      { name: "Emotional Triggers", desc: "Situations that provoke strong automatic reactions. Awareness of triggers is the first step to managing them" },
      { name: "Self-Regulation", desc: "Managing impulses: a pause between stimulus and response, a conscious choice of behavior instead of automatic reaction" },
      { name: "Emotional Granularity", desc: "The ability to distinguish subtle shades of emotion (not just 'bad' but 'disappointed,' 'hurt,' 'anxious')" }
    ],
  },
  {
    id: "leadership",
    titleRu: "Лидерство",
    titleEn: "Leadership",
    contentRu: [
      "Лидерство — это способность вдохновлять людей и направлять их усилия к общей цели. В AI-эпоху лидерство трансформируется: авторитарный стиль «я знаю лучше всех» уступает место адаптивному лидерству, где ключевые навыки — умение задавать правильные вопросы, создавать среду для экспериментов и управлять командами, состоящими из людей и AI-агентов.",
      "Модель ситуационного лидерства Херси-Бланшара описывает четыре стиля: директивный (высокие указания, мало поддержки), наставнический (высокие указания + поддержка), поддерживающий (мало указаний + поддержка) и делегирующий (мало указаний, мало поддержки). Эффективный лидер выбирает стиль в зависимости от зрелости сотрудника: новичку нужны чёткие инструкции, опытному — доверие и автономия.",
      "Трансформационное лидерство (Бернс, Басс) противопоставляется транзакционному. Транзакционный лидер управляет через систему вознаграждений и наказаний — «сделай X, получишь Y». Трансформационный лидер вдохновляет через видение, личный пример и интеллектуальную стимуляцию. Четыре «I» трансформационного лидерства: Idealized Influence (пример), Inspirational Motivation (вдохновение), Intellectual Stimulation (развитие), Individualized Consideration (внимание к каждому).",
      "Servant leadership (лидерство-служение) Роберта Гринлифа предлагает инверсию: лидер существует для того, чтобы помогать команде быть успешной, а не наоборот. В AI-командах этот подход особенно актуален: лидер не может быть экспертом во всём, его роль — убирать барьеры, обеспечивать ресурсы и создавать контекст, в котором эксперты и AI-инструменты дают максимальный результат."
    ],
    contentEn: [
      "Leadership is the ability to inspire people and direct their efforts toward a shared goal. In the AI era, leadership is transforming: the authoritarian 'I know best' style is giving way to adaptive leadership, where key skills include asking the right questions, creating an environment for experimentation, and managing teams composed of humans and AI agents.",
      "The Hersey-Blanchard Situational Leadership model describes four styles: directing (high direction, low support), coaching (high direction + support), supporting (low direction + support), and delegating (low direction, low support). An effective leader chooses the style based on the employee's maturity: a newcomer needs clear instructions; an experienced professional needs trust and autonomy.",
      "Transformational leadership (Burns, Bass) contrasts with transactional leadership. A transactional leader manages through rewards and punishments — 'do X, get Y.' A transformational leader inspires through vision, personal example, and intellectual stimulation. The four I's of transformational leadership: Idealized Influence (example), Inspirational Motivation (inspiration), Intellectual Stimulation (development), and Individualized Consideration (attention to each person).",
      "Robert Greenleaf's servant leadership proposes an inversion: the leader exists to help the team succeed, not the other way around. In AI-powered teams, this approach is especially relevant: the leader cannot be an expert in everything; their role is to remove barriers, provide resources, and create the context in which experts and AI tools deliver maximum results."
    ],
    conceptsRu: [
      { name: "Ситуационное лидерство (Херси-Бланшар)", desc: "Четыре стиля руководства, выбор зависит от зрелости сотрудника: от директив до делегирования" },
      { name: "Трансформационное лидерство", desc: "Вдохновение через видение и личный пример — четыре «I»: Influence, Motivation, Stimulation, Consideration" },
      { name: "Servant Leadership (Гринлиф)", desc: "Лидер-слуга: роль руководителя — обслуживать команду, убирать барьеры и обеспечивать условия для успеха" },
      { name: "Делегирование", desc: "Передача задач с ответственностью и полномочиями. Микроменеджмент — антипаттерн: убивает мотивацию и рост" },
      { name: "Транзакционное vs. трансформационное", desc: "Управление через «кнут и пряник» vs. вдохновение через смысл и развитие — два полюса лидерства" }
    ],
    conceptsEn: [
      { name: "Situational Leadership (Hersey-Blanchard)", desc: "Four leadership styles chosen based on the employee's maturity level: from directing to delegating" },
      { name: "Transformational Leadership", desc: "Inspiration through vision and personal example — the four I's: Influence, Motivation, Stimulation, Consideration" },
      { name: "Servant Leadership (Greenleaf)", desc: "The leader-as-servant: the manager's role is to serve the team, remove barriers, and provide conditions for success" },
      { name: "Delegation", desc: "Transferring tasks with responsibility and authority. Micromanagement is an anti-pattern: it kills motivation and growth" },
      { name: "Transactional vs. Transformational", desc: "Management through rewards and punishments vs. inspiration through meaning and development — two poles of leadership" }
    ],
  },
  {
    id: "product-thinking",
    titleRu: "Продуктовое мышление",
    titleEn: "Product Thinking",
    contentRu: [
      "Продуктовое мышление — это способность видеть любую работу через призму ценности для пользователя. Это не навык только продакт-менеджеров: инженер с продуктовым мышлением спрашивает «зачем мы это строим?» перед тем как писать код; дизайнер думает о бизнес-метриках; маркетолог анализирует данные об использовании. В эпоху AI продуктовое мышление определяет, какие задачи автоматизировать, а какие оставить людям.",
      "Фреймворк Jobs To Be Done (JTBD) предлагает смотреть не на то, кто ваш клиент, а на то, какую «работу» он нанимает ваш продукт выполнить. Клиент не покупает дрель — он «нанимает» её, чтобы повесить полку. Это смещение фокуса от демографии к мотивации радикально меняет подход к решениям. В AI-контексте: пользователь не хочет «chatbot» — он хочет быстро получить ответ на вопрос.",
      "Lean Startup Эрика Риса и цикл Build-Measure-Learn формализуют процесс быстрых экспериментов. MVP (Minimum Viable Product) — это не недоделанный продукт, а самый маленький эксперимент, который проверяет главную гипотезу. Метрики AARRR (Acquisition, Activation, Retention, Revenue, Referral) — «пиратская» воронка — показывают здоровье продукта на каждом этапе пользовательского пути.",
      "Приоритизация — ключевая боль продуктовых команд. Фреймворки RICE (Reach, Impact, Confidence, Effort) и MoSCoW (Must, Should, Could, Won't) структурируют принятие решений. Impact mapping связывает бизнес-цели с конкретными функциями через цепочку: цель → акторы → воздействия → deliverables. Эти инструменты помогают команде говорить на одном языке и принимать решения на основе данных, а не мнений."
    ],
    contentEn: [
      "Product thinking is the ability to see any work through the lens of user value. It is not just a product manager's skill: an engineer with product thinking asks 'why are we building this?' before writing code; a designer thinks about business metrics; a marketer analyzes usage data. In the AI era, product thinking determines which tasks to automate and which to leave to humans.",
      "The Jobs To Be Done (JTBD) framework suggests looking not at who your customer is but at what 'job' they are hiring your product to do. The customer doesn't buy a drill — they 'hire' it to hang a shelf. This shift from demographics to motivation radically changes the approach to solutions. In the AI context: the user doesn't want a 'chatbot' — they want to quickly get an answer to a question.",
      "Eric Ries' Lean Startup and the Build-Measure-Learn cycle formalize the process of rapid experimentation. An MVP (Minimum Viable Product) is not an unfinished product but the smallest experiment that tests the main hypothesis. AARRR metrics (Acquisition, Activation, Retention, Revenue, Referral) — the 'pirate' funnel — show product health at each stage of the user journey.",
      "Prioritization is the key pain point for product teams. The RICE framework (Reach, Impact, Confidence, Effort) and MoSCoW (Must, Should, Could, Won't) structure decision-making. Impact mapping connects business goals to specific features through a chain: goal, actors, impacts, deliverables. These tools help teams speak the same language and make decisions based on data rather than opinions."
    ],
    conceptsRu: [
      { name: "Jobs To Be Done (JTBD)", desc: "Фокус на «работе», которую пользователь «нанимает» продукт выполнить, а не на демографии и персонах" },
      { name: "Build-Measure-Learn (Lean Startup)", desc: "Цикл быстрых экспериментов: построй MVP → измерь результат → сделай выводы → повтори" },
      { name: "RICE / MoSCoW", desc: "Фреймворки приоритизации: RICE оценивает reach, impact, confidence, effort; MoSCoW делит на must/should/could/won't" },
      { name: "AARRR-метрики", desc: "«Пиратская» воронка: привлечение → активация → удержание → выручка → рекомендации" },
      { name: "MVP (Minimum Viable Product)", desc: "Самый маленький эксперимент для проверки главной гипотезы — не недоделанный продукт, а инструмент обучения" }
    ],
    conceptsEn: [
      { name: "Jobs To Be Done (JTBD)", desc: "Focus on the 'job' the user 'hires' the product to do, not on demographics and personas" },
      { name: "Build-Measure-Learn (Lean Startup)", desc: "Rapid experiment cycle: build MVP, measure results, draw conclusions, repeat" },
      { name: "RICE / MoSCoW", desc: "Prioritization frameworks: RICE evaluates reach, impact, confidence, effort; MoSCoW categorizes must/should/could/won't" },
      { name: "AARRR Metrics", desc: "The 'pirate' funnel: Acquisition, Activation, Retention, Revenue, Referral" },
      { name: "MVP (Minimum Viable Product)", desc: "The smallest experiment to test the main hypothesis — not an unfinished product but a learning tool" }
    ],
  },
  {
    id: "self-organization",
    titleRu: "Самоорганизация",
    titleEn: "Self-Organization",
    contentRu: [
      "Самоорганизация — это умение управлять собой: своей энергией, вниманием, приоритетами и рабочими процессами без внешнего контроля. В AI-эпоху, когда удалённая работа стала нормой, а границы между «рабочим» и «личным» размылись, самоорганизация — это не роскошь, а необходимость. Те, кто умеют структурировать свой день, значительно продуктивнее тех, кто реагирует на входящие задачи.",
      "GTD (Getting Things Done) Дэвида Аллена — одна из самых влиятельных систем продуктивности. Её ядро — принцип «разгрузи голову»: все задачи, идеи и обязательства записываются в надёжную внешнюю систему. Пять шагов GTD: сбор (capture), обработка (clarify), организация (organize), обзор (reflect), выполнение (engage). Правило двух минут: если задача занимает меньше двух минут — делай сразу, не записывай.",
      "Deep Work Кэла Ньюпорта описывает способность фокусироваться на когнитивно сложных задачах без отвлечений. Ньюпорт утверждает, что в экономике знаний deep work — самый ценный навык и одновременно самый редкий. Практика: блоки времени по 90 минут без уведомлений, email и мессенджеров. Закон Паркинсона дополняет: «работа заполняет всё время, отведённое на неё» — без дедлайнов и ограничений задачи растягиваются бесконечно.",
      "Привычки играют ключевую роль в самоорганизации. Модель Habit Loop (Чарлз Дахигг): триггер → рутина → вознаграждение. Атомные привычки (Джеймс Клир) предлагают «правило 1%»: маленькие улучшения каждый день дают экспоненциальный рост со временем. Утренние ритуалы, регулярные обзоры задач, еженедельное планирование — всё это привычки, которые создают каркас продуктивного дня."
    ],
    contentEn: [
      "Self-organization is the ability to manage yourself: your energy, attention, priorities, and workflows without external oversight. In the AI era, when remote work has become the norm and the boundaries between 'work' and 'personal' have blurred, self-organization is not a luxury but a necessity. Those who can structure their day are significantly more productive than those who merely react to incoming tasks.",
      "David Allen's GTD (Getting Things Done) is one of the most influential productivity systems. Its core principle is 'empty your head': all tasks, ideas, and commitments are recorded in a reliable external system. Five GTD steps: capture, clarify, organize, reflect, and engage. The two-minute rule: if a task takes less than two minutes, do it immediately instead of writing it down.",
      "Cal Newport's Deep Work describes the ability to focus on cognitively demanding tasks without distraction. Newport argues that in the knowledge economy, deep work is the most valuable skill and simultaneously the rarest. Practice: 90-minute time blocks without notifications, email, or messaging. Parkinson's Law complements this: 'work expands to fill the time available for its completion' — without deadlines and constraints, tasks stretch indefinitely.",
      "Habits play a key role in self-organization. The Habit Loop model (Charles Duhigg): cue, routine, reward. Atomic Habits (James Clear) proposes the '1% rule': small daily improvements yield exponential growth over time. Morning rituals, regular task reviews, weekly planning — all of these are habits that create the scaffolding of a productive day."
    ],
    conceptsRu: [
      { name: "GTD — Getting Things Done (Дэвид Аллен)", desc: "Система продуктивности: сбор → обработка → организация → обзор → выполнение. Принцип «разгрузи голову»" },
      { name: "Deep Work (Кэл Ньюпорт)", desc: "Фокусированная работа без отвлечений — самый ценный навык в экономике знаний" },
      { name: "Правило двух минут", desc: "Если задача занимает меньше двух минут — делай сразу, не записывай и не откладывай" },
      { name: "Закон Паркинсона", desc: "Работа заполняет всё время, отведённое на неё — без дедлайнов задачи растягиваются бесконечно" },
      { name: "Атомные привычки (Джеймс Клир)", desc: "Правило 1%: маленькие ежедневные улучшения создают экспоненциальный рост. Триггер → рутина → вознаграждение" }
    ],
    conceptsEn: [
      { name: "GTD — Getting Things Done (David Allen)", desc: "Productivity system: capture, clarify, organize, reflect, engage. The 'empty your head' principle" },
      { name: "Deep Work (Cal Newport)", desc: "Focused work without distraction — the most valuable skill in the knowledge economy" },
      { name: "Two-Minute Rule", desc: "If a task takes less than two minutes, do it immediately — don't write it down or postpone it" },
      { name: "Parkinson's Law", desc: "Work expands to fill the time available for its completion — without deadlines, tasks stretch indefinitely" },
      { name: "Atomic Habits (James Clear)", desc: "The 1% rule: small daily improvements create exponential growth over time. Cue, routine, reward" }
    ],
  },
  {
    id: "time-management",
    titleRu: "Управление временем",
    titleEn: "Time Management",
    contentRu: [
      "Управление временем — это не про то, чтобы «успевать больше», а про то, чтобы делать правильные вещи. В AI-эпоху, когда многие рутинные задачи автоматизируются, умение правильно распределять человеческое время становится стратегическим навыком. Вопрос не «как мне всё успеть?», а «на что стоит тратить именно моё время, а что отдать AI?»",
      "Матрица Эйзенхауэра делит задачи по двум осям: срочность и важность. Четыре квадранта: важное и срочное (делай), важное и не срочное (планируй), не важное и срочное (делегируй), не важное и не срочное (удали). Большинство людей застревают в квадранте «срочное, но не важное» — тушат пожары вместо того, чтобы инвестировать время в стратегически важные, но несрочные задачи.",
      "Принцип Парето (80/20) утверждает, что 80% результатов приходят от 20% усилий. В тайм-менеджменте это означает: определи свои 20% задач с наибольшим воздействием и защити время для них. Техника Pomodoro (25 минут работы + 5 минут отдыха) помогает поддерживать фокус и предотвращать когнитивное истощение. Timeboxing — выделение фиксированного временного блока на задачу — предотвращает перфекционизм и закон Паркинсона.",
      "Мультитаскинг — это миф: исследования показывают, что «переключение контекстов» (context switching) снижает продуктивность на 20-40% и увеличивает количество ошибок. Каждое переключение стоит 23 минуты на восстановление фокуса. Батчинг (группировка однотипных задач) и single-tasking — более эффективные стратегии. Eat the frog (Брайан Трейси): начинай день с самой сложной задачи, когда ментальная энергия максимальна."
    ],
    contentEn: [
      "Time management is not about 'getting more done' but about doing the right things. In the AI era, when many routine tasks are being automated, the ability to properly allocate human time becomes a strategic skill. The question is not 'how do I get everything done?' but 'what is worth spending my time on, and what should I hand off to AI?'",
      "The Eisenhower Matrix divides tasks along two axes: urgency and importance. Four quadrants: important and urgent (do it), important and not urgent (schedule it), not important but urgent (delegate it), not important and not urgent (eliminate it). Most people get stuck in the 'urgent but not important' quadrant — fighting fires instead of investing time in strategically important but non-urgent tasks.",
      "The Pareto Principle (80/20) states that 80% of results come from 20% of efforts. In time management, this means: identify your 20% of highest-impact tasks and protect time for them. The Pomodoro Technique (25 minutes of work + 5 minutes of rest) helps maintain focus and prevent cognitive exhaustion. Timeboxing — allocating a fixed time block to a task — prevents perfectionism and Parkinson's Law.",
      "Multitasking is a myth: research shows that context switching reduces productivity by 20-40% and increases errors. Each switch costs 23 minutes to regain focus. Batching (grouping similar tasks) and single-tasking are more effective strategies. Eat the Frog (Brian Tracy): start your day with the hardest task when mental energy is at its peak."
    ],
    conceptsRu: [
      { name: "Матрица Эйзенхауэра", desc: "Четыре квадранта по осям важность/срочность: делай, планируй, делегируй, удали" },
      { name: "Принцип Парето (80/20)", desc: "80% результатов приходят от 20% усилий — фокусируйся на задачах с наибольшим воздействием" },
      { name: "Техника Pomodoro", desc: "25 минут фокусированной работы + 5 минут отдыха — ритм, который поддерживает концентрацию" },
      { name: "Timeboxing", desc: "Фиксированный блок времени на задачу — предотвращает перфекционизм и растягивание задач" },
      { name: "Eat the Frog (Брайан Трейси)", desc: "Начинай день с самой сложной задачи — когда ментальная энергия максимальна, не откладывай на потом" }
    ],
    conceptsEn: [
      { name: "Eisenhower Matrix", desc: "Four quadrants along importance/urgency axes: do, schedule, delegate, eliminate" },
      { name: "Pareto Principle (80/20)", desc: "80% of results come from 20% of efforts — focus on the highest-impact tasks" },
      { name: "Pomodoro Technique", desc: "25 minutes of focused work + 5 minutes of rest — a rhythm that sustains concentration" },
      { name: "Timeboxing", desc: "A fixed time block for a task — prevents perfectionism and task creep" },
      { name: "Eat the Frog (Brian Tracy)", desc: "Start the day with the hardest task — when mental energy is at its peak, don't postpone it" }
    ],
  },
];

/* ─── Component ─── */
export default function GuidePage() {
  const { lang } = useLang();
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* Track which section is visible */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    const sections = document.querySelectorAll("[data-guide-section]");
    sections.forEach((s) => observerRef.current?.observe(s));
    return () => observerRef.current?.disconnect();
  }, []);

  /* Smooth-scroll to section */
  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileNavOpen(false);
    }
  }

  const isRu = lang === "ru";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-slate-950 to-indigo-950/30" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            {isRu ? "Справочник по soft skills" : "Soft Skills Reference Guide"}
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-6">
            {isRu
              ? "Ключевые концепции, фреймворки и модели — всё, что нужно знать для прохождения теста и развития навыков"
              : "Key concepts, frameworks, and models — everything you need to know for the quiz and skill development"}
          </p>
          <p className="text-sm text-slate-500 max-w-xl mx-auto bg-slate-900/60 rounded-lg px-4 py-3 border border-slate-800">
            {isRu
              ? "Этот справочник сопровождает вопросы квиза. Каждый раздел охватывает ключевые концепции и фреймворки, на которые ссылаются вопросы."
              : "This guide accompanies the quiz questions. Each section covers the key concepts and frameworks referenced in the quiz."}
          </p>
        </div>
      </section>

      {/* ── Layout: sidebar + content ── */}
      <div className="mx-auto max-w-7xl flex">
        {/* Sidebar — desktop */}
        <nav className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-slate-800 bg-slate-950/80 backdrop-blur py-8 px-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            {isRu ? "Содержание" : "Contents"}
          </h2>
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => scrollTo(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === s.id
                      ? "bg-violet-500/10 text-violet-400 font-medium"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  {isRu ? s.titleRu : s.titleEn}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile nav toggle */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-violet-900/40 transition-colors"
            aria-label={isRu ? "Содержание" : "Contents"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile nav overlay */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-sm">
            <div className="absolute bottom-20 right-4 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                {isRu ? "Содержание" : "Contents"}
              </h2>
              <ul className="space-y-1">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollTo(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeSection === s.id
                          ? "bg-violet-500/10 text-violet-400 font-medium"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      {isRu ? s.titleRu : s.titleEn}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 py-8 px-4 sm:px-8 lg:px-12">
          <div className="max-w-3xl mx-auto space-y-16">
            {SECTIONS.map((section, idx) => (
              <article
                key={section.id}
                id={section.id}
                data-guide-section
                className="scroll-mt-8"
              >
                {/* Section number + title */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-500/10 text-violet-400 text-sm font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {isRu ? section.titleRu : section.titleEn}
                  </h2>
                </div>

                {/* Content paragraphs */}
                <div className="space-y-4 mb-8">
                  {(isRu ? section.contentRu : section.contentEn).map((p, i) => (
                    <p key={i} className="text-slate-300 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>

                {/* Key concepts */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-400 mb-4">
                    {isRu ? "Ключевые концепции" : "Key Concepts"}
                  </h3>
                  <ul className="space-y-3">
                    {(isRu ? section.conceptsRu : section.conceptsEn).map((c, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                        <div>
                          <span className="font-medium text-white">{c.name}</span>
                          <span className="text-slate-400"> — {c.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Divider (except last) */}
                {idx < SECTIONS.length - 1 && (
                  <div className="mt-16 border-t border-slate-800/50" />
                )}
              </article>
            ))}

            {/* Bottom CTA */}
            <div className="text-center py-12 border-t border-slate-800">
              <p className="text-slate-400 mb-4">
                {isRu
                  ? "Готовы проверить свои знания?"
                  : "Ready to test your knowledge?"}
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium px-6 py-3 rounded-xl transition-colors"
              >
                {isRu ? "Пройти тест" : "Take the Test"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
