import { Question, DimensionInfo, DimensionKey } from "@/types/assessment";

export const dimensions: DimensionInfo[] = [
  {
    key: "critical_thinking",
    name: "Критическое мышление и оценка AI-выхода",
    nameEn: "Critical Thinking & AI Evaluation",
    description:
      "Способность оценивать качество AI-генерации, замечать ошибки и не принимать результат на веру",
    descriptionEn:
      "Ability to evaluate AI output quality, spot errors, and not take results at face value",
  },
  {
    key: "communication",
    name: "Коммуникация и промпт-инжиниринг",
    nameEn: "Communication & Prompt Engineering",
    description:
      "Умение чётко формулировать задачи для AI и эффективно общаться с командой",
    descriptionEn:
      "Ability to clearly formulate tasks for AI and communicate effectively with the team",
  },
  {
    key: "adaptability",
    name: "Адаптивность и скорость обучения",
    nameEn: "Adaptability & Learning Speed",
    description:
      "Готовность осваивать новые инструменты и подходы, гибкость в работе",
    descriptionEn:
      "Readiness to learn new tools and approaches, flexibility at work",
  },
  {
    key: "self_organization",
    name: "Самоорганизация и дисциплина",
    nameEn: "Self-Organization & Discipline",
    description:
      "Системный подход к работе, планирование, контроль качества своего кода",
    descriptionEn:
      "Systematic approach to work, planning, quality control of your code",
  },
  {
    key: "product_thinking",
    name: "Продуктовое мышление и UX-чутьё",
    nameEn: "Product Thinking & UX Sense",
    description:
      "Понимание пользовательских потребностей, умение думать о продукте, а не только о коде",
    descriptionEn:
      "Understanding user needs, thinking about the product, not just the code",
  },
  {
    key: "collaboration",
    name: "Коллаборация и обратная связь",
    nameEn: "Collaboration & Feedback",
    description:
      "Навыки командной работы, открытость к фидбеку, готовность делиться знаниями",
    descriptionEn:
      "Teamwork skills, openness to feedback, willingness to share knowledge",
  },
  {
    key: "leadership",
    name: "Лидерство и инициатива",
    nameEn: "Leadership & Initiative",
    description:
      "Способность брать на себя ответственность, мотивировать команду и предлагать улучшения",
    descriptionEn:
      "Ability to take responsibility, motivate the team, and propose improvements",
  },
  {
    key: "conflict_resolution",
    name: "Управление конфликтами",
    nameEn: "Conflict Resolution",
    description:
      "Умение разрешать разногласия, давать и принимать обратную связь конструктивно",
    descriptionEn:
      "Ability to resolve disagreements, give and receive feedback constructively",
  },
  {
    key: "emotional_intelligence",
    name: "Эмоциональный интеллект",
    nameEn: "Emotional Intelligence",
    description:
      "Понимание эмоций — своих и чужих, умение регулировать состояние и поддерживать атмосферу",
    descriptionEn:
      "Understanding emotions — yours and others', ability to regulate state and maintain atmosphere",
  },
  {
    key: "time_management",
    name: "Управление временем",
    nameEn: "Time Management",
    description:
      "Оценка сроков, приоритизация задач, умение говорить «нет» и не тонуть в перфекционизме",
    descriptionEn:
      "Estimating timelines, prioritizing tasks, saying 'no', and avoiding perfectionism traps",
  },
];

export const dimensionMap: Record<DimensionKey, DimensionInfo> =
  dimensions.reduce(
    (acc, dim) => {
      acc[dim.key] = dim;
      return acc;
    },
    {} as Record<DimensionKey, DimensionInfo>
  );

export const questions: Question[] = [
  // Critical Thinking (ct)
  {
    id: "ct_1",
    dimension: "critical_thinking",
    text: "Когда AI генерирует мне код, который с первого раза работает — я обычно сразу иду дальше, не вчитываясь в реализацию. Главное что работает.",
    textEn: "When AI generates code that works on the first try, I usually move on without reading through the implementation. If it works, it works.",
    reverse: true,
  },
  {
    id: "ct_2",
    dimension: "critical_thinking",
    text: 'Я замечаю, когда AI "галлюцинирует" — например, использует несуществующий метод библиотеки или выдумывает API-эндпоинт. У меня на это уже выработалось чутьё.',
    textEn: "I notice when AI 'hallucinates' \u2014 using a non-existent library method or making up an API endpoint. I've developed a sense for this.",
    reverse: false,
  },
  {
    id: "ct_3",
    dimension: "critical_thinking",
    text: "Если AI предлагает решение, которое я не до конца понимаю, но оно работает — я скорее оставлю его как есть, чем буду тратить время на разбор.",
    textEn: "If AI suggests a solution I don't fully understand but it works, I'd rather keep it than spend time digging into it.",
    reverse: true,
  },
  {
    id: "ct_4",
    dimension: "critical_thinking",
    text: "Я периодически специально прошу AI объяснить своё решение, а потом сверяю с документацией — и нередко нахожу расхождения.",
    textEn: "I regularly ask AI to explain its solution, then cross-check with documentation \u2014 and often find discrepancies.",
    reverse: false,
  },
  {
    id: "ct_5",
    dimension: "critical_thinking",
    text: "Когда я вижу, что AI-решение выглядит слишком сложным для задачи, я останавливаюсь и думаю — может, я неправильно сформулировал задачу, или есть более простой путь.",
    textEn: "When an AI solution looks too complex for the task, I stop and think \u2014 maybe I framed the problem wrong, or there's a simpler way.",
    reverse: false,
  },

  // Communication (cm)
  {
    id: "cm_1",
    dimension: "communication",
    text: "Прежде чем писать промпт, я обычно формулирую для себя: что именно я хочу получить, какие ограничения есть, и в каком формате нужен результат.",
    textEn: "Before writing a prompt, I usually clarify for myself: what I want, what constraints exist, and what format I need.",
    reverse: false,
  },
  {
    id: "cm_2",
    dimension: "communication",
    text: "Мне часто проще написать длинный сумбурный промпт и потом уточнять в диалоге, чем потратить время на структурированную постановку задачи с самого начала.",
    textEn: "I often find it easier to write a long messy prompt and clarify in conversation, rather than structuring the task description upfront.",
    reverse: true,
  },
  {
    id: "cm_3",
    dimension: "communication",
    text: "Когда я объясняю коллеге или заказчику техническое решение, я подбираю уровень детализации под собеседника — не гружу терминами, если человек не технический.",
    textEn: "When explaining a technical solution to a colleague or client, I adjust detail level to the audience \u2014 no jargon for non-technical people.",
    reverse: false,
  },
  {
    id: "cm_4",
    dimension: "communication",
    text: 'Я веду заметки или сохраняю удачные промпты и подходы, которые хорошо сработали — чтобы переиспользовать их в похожих задачах.',
    textEn: "I keep notes or save prompts and approaches that worked well \u2014 to reuse them for similar tasks.",
    reverse: false,
  },
  {
    id: "cm_5",
    dimension: "communication",
    text: 'Когда AI выдаёт не то, что нужно, я обычно просто перефразирую запрос наугад или нажимаю "регенерировать", пока не повезёт.',
    textEn: "When AI gives me something wrong, I usually just rephrase randomly or hit 'regenerate' until I get lucky.",
    reverse: true,
  },

  // Adaptability (ad)
  {
    id: "ad_1",
    dimension: "adaptability",
    text: "Когда появляется новый AI-инструмент или фича (например, новая модель, агентский режим, MCP) — я пробую в первые дни, даже если текущий стек устраивает.",
    textEn: "When a new AI tool or feature appears (new model, agent mode, MCP), I try it within days, even if my current stack is fine.",
    reverse: false,
  },
  {
    id: "ad_2",
    dimension: "adaptability",
    text: "Если мой привычный AI-инструмент не справляется с задачей, я довольно быстро переключаюсь на другой — у меня в арсенале несколько вариантов.",
    textEn: "If my usual AI tool can't handle a task, I switch to another quickly \u2014 I have several options in my toolkit.",
    reverse: false,
  },
  {
    id: "ad_3",
    dimension: "adaptability",
    text: "Когда что-то ломается после AI-генерации и я не понимаю почему — я чувствую сильную фрустрацию и иногда просто откатываю всё назад вместо того, чтобы разобраться.",
    textEn: "When something breaks after AI generation and I don't understand why, I feel strong frustration and sometimes just roll everything back instead of figuring it out.",
    reverse: true,
  },
  {
    id: "ad_4",
    dimension: "adaptability",
    text: "Я заметил, что за последние полгода мой подход к работе с AI существенно изменился — я выработал свои приёмы и workflow, которых не было раньше.",
    textEn: "Over the past six months my approach to working with AI has changed significantly \u2014 I've developed my own techniques and workflows.",
    reverse: false,
  },
  {
    id: "ad_5",
    dimension: "adaptability",
    text: "Мне комфортнее работать с одним проверенным инструментом, чем постоянно экспериментировать. Если что-то работает — лучше не трогать.",
    textEn: "I'm more comfortable with one proven tool than constantly experimenting. If something works, better not touch it.",
    reverse: true,
  },

  // Self-Organization (so)
  {
    id: "so_1",
    dimension: "self_organization",
    text: 'Перед тем как начать кодить с AI, я разбиваю задачу на шаги и понимаю, в каком порядке буду их делать. Не просто "сделай мне приложение", а конкретный план.',
    textEn: "Before coding with AI, I break the task into steps and know the order. Not just 'build me an app', but a specific plan.",
    reverse: false,
  },
  {
    id: "so_2",
    dimension: "self_organization",
    text: "Честно говоря, я иногда увлекаюсь процессом генерации и добавляю фичи, о которых никто не просил — просто потому что AI легко это делает.",
    textEn: "Honestly, I sometimes get carried away and add features nobody asked for \u2014 just because AI makes it easy.",
    reverse: true,
  },
  {
    id: "so_3",
    dimension: "self_organization",
    text: "После того как AI сгенерировал код, я всегда прогоняю хотя бы базовые сценарии вручную или пишу тесты — прежде чем считать задачу готовой.",
    textEn: "After AI generates code, I always run at least basic scenarios manually or write tests before considering it done.",
    reverse: false,
  },
  {
    id: "so_4",
    dimension: "self_organization",
    text: 'Я использую git осмысленно — делаю атомарные коммиты с понятными сообщениями, а не один гигантский коммит "AI generated everything".',
    textEn: "I use git meaningfully \u2014 atomic commits with clear messages, not one giant 'AI generated everything' commit.",
    reverse: false,
  },
  {
    id: "so_5",
    dimension: "self_organization",
    text: "Бывает, что я трачу полдня на промптинг, получая кучу вариантов, а потом понимаю, что стоило сначала подумать 15 минут и написать план на бумаге.",
    textEn: "Sometimes I spend half a day prompting, getting lots of variants, then realize I should have spent 15 minutes planning on paper first.",
    reverse: true,
  },

  // Product Thinking (pt)
  {
    id: "pt_1",
    dimension: "product_thinking",
    text: "Когда я делаю фичу, я думаю не только о том, как она работает технически, но и о том, как пользователь будет с ней взаимодействовать — где нажмёт, что увидит, что может пойти не так.",
    textEn: "When building a feature, I think about how the user will interact with it \u2014 where they'll click, what they'll see, what could go wrong.",
    reverse: false,
  },
  {
    id: "pt_2",
    dimension: "product_thinking",
    text: 'Я могу остановиться и сказать "этого достаточно для MVP" — даже если AI легко может добавить ещё десять улучшений. Я понимаю, когда пора шиппить.',
    textEn: "I can stop and say 'this is enough for MVP' \u2014 even if AI can easily add ten more improvements. I know when to ship.",
    reverse: false,
  },
  {
    id: "pt_3",
    dimension: "product_thinking",
    text: "Если задача сформулирована расплывчато, я скорее начну генерировать код и покажу результат, чем буду задавать уточняющие вопросы заказчику о пользовательских сценариях.",
    textEn: "If a task is vaguely defined, I'd rather start generating code and show the result than ask clarifying questions about user scenarios.",
    reverse: true,
  },
  {
    id: "pt_4",
    dimension: "product_thinking",
    text: "Я обращаю внимание на edge cases и error states — что увидит пользователь, если данные не загрузились, если ввёл что-то не то, если нет интернета.",
    textEn: "I pay attention to edge cases and error states \u2014 what happens if data doesn't load, wrong input, no internet.",
    reverse: false,
  },
  {
    id: "pt_5",
    dimension: "product_thinking",
    text: 'Мне бывает сложно объяснить, почему я выбрал именно такое решение, а не другое — я просто беру то, что AI предложил первым, если оно выглядит нормально.',
    textEn: "I find it hard to explain why I chose a particular solution \u2014 I just take what AI suggested first if it looks okay.",
    reverse: true,
  },

  // Collaboration (cl)
  {
    id: "cl_1",
    dimension: "collaboration",
    text: "Когда кто-то на ревью критикует код, который по сути написал AI — я не воспринимаю это на свой счёт, а разбираюсь в замечании и исправляю. Это ведь моя ответственность, а не AI.",
    textEn: "When someone criticizes AI-written code in review, I don't take it personally \u2014 I look into it and fix it. It's my responsibility, not AI's.",
    reverse: false,
  },
  {
    id: "cl_2",
    dimension: "collaboration",
    text: "Я оставляю комментарии в коде или в PR-описании, объясняя, почему было выбрано именно такое решение — особенно если AI предложил неочевидный подход.",
    textEn: "I leave comments in code or PR descriptions explaining why a solution was chosen \u2014 especially for non-obvious AI suggestions.",
    reverse: false,
  },
  {
    id: "cl_3",
    dimension: "collaboration",
    text: "Если коллега делает что-то неоптимально с AI-инструментами, я скорее промолчу — не хочу лезть с непрошенными советами.",
    textEn: "If a colleague uses AI tools suboptimally, I'd rather stay quiet \u2014 I don't want to give unsolicited advice.",
    reverse: true,
  },
  {
    id: "cl_4",
    dimension: "collaboration",
    text: "Мне некомфортно показывать черновой результат работы другим — я предпочитаю сначала довести до идеала и только потом делиться.",
    textEn: "I'm uncomfortable showing draft work to others \u2014 I prefer to polish it first and only then share.",
    reverse: true,
  },
  {
    id: "cl_5",
    dimension: "collaboration",
    text: "Когда я нахожу удачный промпт, workflow или приём работы с AI — я делюсь этим с командой, даже если никто не просил.",
    textEn: "When I find a good prompt, workflow, or AI technique, I share it with the team even if nobody asked.",
    reverse: false,
  },

  // Leadership (ld)
  {
    id: "ld_1",
    dimension: "leadership",
    text: "Если я вижу, что задача зависла и никто не берёт на себя ответственность — я беру инициативу, даже если это не моя зона.",
    textEn: "If I see a task stuck with nobody taking responsibility, I take initiative even if it's not my area.",
    reverse: false,
  },
  {
    id: "ld_2",
    dimension: "leadership",
    text: "Мне проще подождать, пока кто-то примет решение, чем взять ответственность на себя — особенно если последствия неясны.",
    textEn: "I'd rather wait for someone else to decide than take responsibility myself — especially when consequences are unclear.",
    reverse: true,
  },
  {
    id: "ld_3",
    dimension: "leadership",
    text: "Я могу мотивировать команду в трудный момент — подбодрить, предложить план, помочь людям не застрять.",
    textEn: "I can motivate the team in tough moments — encourage, suggest a plan, help people not get stuck.",
    reverse: false,
  },
  {
    id: "ld_4",
    dimension: "leadership",
    text: "Мне комфортнее быть исполнителем с чётким ТЗ, чем лидером, который определяет направление.",
    textEn: "I'm more comfortable as an executor with a clear spec than as a leader who sets direction.",
    reverse: true,
  },
  {
    id: "ld_5",
    dimension: "leadership",
    text: "Когда я вижу возможность улучшить процесс в команде, я предлагаю это — даже если никто не просил.",
    textEn: "When I see a chance to improve a team process, I suggest it — even if nobody asked.",
    reverse: false,
  },

  // Conflict Resolution (cr)
  {
    id: "cr_1",
    dimension: "conflict_resolution",
    text: "Если в команде возник конфликт, я стараюсь разобраться в позициях обеих сторон, прежде чем высказать своё мнение.",
    textEn: "When there's a team conflict, I try to understand both sides before sharing my opinion.",
    reverse: false,
  },
  {
    id: "cr_2",
    dimension: "conflict_resolution",
    text: "Мне некомфортно вступать в сложные разговоры — я обычно избегаю конфронтации, даже если проблема нарастает.",
    textEn: "I'm uncomfortable with difficult conversations — I usually avoid confrontation even when the problem is growing.",
    reverse: true,
  },
  {
    id: "cr_3",
    dimension: "conflict_resolution",
    text: "Я умею давать обратную связь так, чтобы человек не чувствовал себя атакованным — фокусируюсь на поведении, не на личности.",
    textEn: "I can give feedback so the person doesn't feel attacked — I focus on behavior, not personality.",
    reverse: false,
  },
  {
    id: "cr_4",
    dimension: "conflict_resolution",
    text: "Когда мне дают критический фидбек, моя первая реакция — защищаться, а не слушать.",
    textEn: "When I receive critical feedback, my first reaction is to defend myself rather than listen.",
    reverse: true,
  },
  {
    id: "cr_5",
    dimension: "conflict_resolution",
    text: "Я способен признать свою ошибку перед командой — мне не нужно быть правым в каждом споре.",
    textEn: "I can admit my mistake to the team — I don't need to be right in every argument.",
    reverse: false,
  },

  // Emotional Intelligence (ei)
  {
    id: "ei_1",
    dimension: "emotional_intelligence",
    text: "Я хорошо чувствую настроение собеседника — по тону голоса, скорости ответов, выбору слов.",
    textEn: "I'm good at sensing someone's mood — from tone of voice, response speed, word choice.",
    reverse: false,
  },
  {
    id: "ei_2",
    dimension: "emotional_intelligence",
    text: "Мне бывает сложно понять, почему коллега расстроен — я фокусируюсь на задаче и иногда не замечаю эмоциональный фон.",
    textEn: "I sometimes struggle to understand why a colleague is upset — I focus on the task and miss the emotional context.",
    reverse: true,
  },
  {
    id: "ei_3",
    dimension: "emotional_intelligence",
    text: "Я умею регулировать своё состояние — если чувствую раздражение или стресс, могу сделать паузу и не выплёскивать это на других.",
    textEn: "I can regulate my emotional state — if I feel irritated or stressed, I can pause and not take it out on others.",
    reverse: false,
  },
  {
    id: "ei_4",
    dimension: "emotional_intelligence",
    text: "Когда в команде напряжённая атмосфера, я замечаю это и стараюсь разрядить — шуткой, поддержкой или просто спросив, как дела.",
    textEn: "When the team atmosphere is tense, I notice and try to defuse it — with humor, support, or just asking how people are doing.",
    reverse: false,
  },
  {
    id: "ei_5",
    dimension: "emotional_intelligence",
    text: "Честно говоря, мне проще работать с данными и кодом, чем с людьми и их эмоциями.",
    textEn: "Honestly, I find it easier to work with data and code than with people and their emotions.",
    reverse: true,
  },

  // Time Management (tm)
  {
    id: "tm_1",
    dimension: "time_management",
    text: "Я умею оценивать, сколько времени займёт задача — и мои оценки обычно близки к реальности.",
    textEn: "I can estimate how long a task will take — and my estimates are usually close to reality.",
    reverse: false,
  },
  {
    id: "tm_2",
    dimension: "time_management",
    text: "Я часто недооцениваю время на задачу, а потом работаю в авральном режиме перед дедлайном.",
    textEn: "I often underestimate task time, then work in crisis mode before the deadline.",
    reverse: true,
  },
  {
    id: "tm_3",
    dimension: "time_management",
    text: "Я чётко приоритизирую задачи — сначала важное и срочное, а не то, что интереснее или проще.",
    textEn: "I clearly prioritize tasks — important and urgent first, not what's more interesting or easier.",
    reverse: false,
  },
  {
    id: "tm_4",
    dimension: "time_management",
    text: "Я умею говорить 'нет' или 'не сейчас', когда на меня пытаются повесить задачу, которая не в приоритете.",
    textEn: "I can say 'no' or 'not now' when someone tries to assign me a task that's not a priority.",
    reverse: false,
  },
  {
    id: "tm_5",
    dimension: "time_management",
    text: "Я иногда трачу много времени на перфекционизм в деталях, которые не влияют на результат.",
    textEn: "I sometimes spend too much time perfecting details that don't affect the outcome.",
    reverse: true,
  },
];

export const scaleLabels: Record<number, string> = {
  1: "Совсем не про меня",
  2: "Скорее не про меня",
  3: "Когда как",
  4: "Скорее про меня",
  5: "Точно про меня",
};

export const scaleLabelsEn: Record<number, string> = {
  1: "Not me at all",
  2: "Mostly not me",
  3: "Sometimes",
  4: "Mostly me",
  5: "That's exactly me",
};
