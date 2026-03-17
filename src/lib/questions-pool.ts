import { Question } from "@/types/assessment";

// Extended question pool — 10 per topic for randomization
// From each topic, 5 random questions are selected per test run

export const extendedQuestions: Question[] = 
[
  {
    "id": "ad_01",
    "dimension": "adaptability",
    "text": "Когда выходит новый AI-инструмент, я пробую его в первые дни — мне интересно, даже если он 'сырой'.",
    "textEn": "When a new AI tool comes out, I try it within the first few days — I'm curious even if it's rough around the edges.",
    "reverse": false
  },
  {
    "id": "ad_02",
    "dimension": "adaptability",
    "text": "Если мой привычный подход не работает, я быстро переключаюсь на другой, а не продолжаю упираться.",
    "textEn": "If my usual approach isn't working, I quickly switch to another one rather than keep pushing.",
    "reverse": false
  },
  {
    "id": "ad_03",
    "dimension": "adaptability",
    "text": "Я до сих пор делаю многое вручную, хотя знаю, что AI мог бы ускорить процесс — привычка сильнее.",
    "textEn": "I still do many things manually even though I know AI could speed up the process — habit is stronger.",
    "reverse": true
  },
  {
    "id": "ad_04",
    "dimension": "adaptability",
    "text": "После неудачи мне нужно много времени, чтобы прийти в себя и начать снова — я долго переживаю.",
    "textEn": "After a failure, I need a lot of time to recover and start again — I dwell on it for a long time.",
    "reverse": true
  },
  {
    "id": "ad_05",
    "dimension": "adaptability",
    "text": "Я регулярно обновляю свой рабочий процесс — пробую новые AI-модели, плагины, воркфлоу.",
    "textEn": "I regularly update my workflow — trying new AI models, plugins, workflows.",
    "reverse": false
  },
  {
    "id": "ad_06",
    "dimension": "adaptability",
    "text": "Когда на проекте резко меняются приоритеты, я адаптируюсь без паники — это нормальная часть работы.",
    "textEn": "When project priorities shift abruptly, I adapt without panic — it's a normal part of work.",
    "reverse": false
  },
  {
    "id": "ad_07",
    "dimension": "adaptability",
    "text": "Мне некомфортно использовать AI для задач, которые я раньше делал сам — как будто теряю контроль.",
    "textEn": "I feel uncomfortable using AI for tasks I used to do myself — it feels like losing control.",
    "reverse": true
  },
  {
    "id": "ad_08",
    "dimension": "adaptability",
    "text": "Если я изучил фреймворк полгода назад, а сейчас появился лучший аналог — мне сложно бросить 'инвестицию' и переучиться.",
    "textEn": "If I learned a framework six months ago and a better alternative appeared — it's hard for me to abandon my 'investment' and relearn.",
    "reverse": true
  },
  {
    "id": "ad_09",
    "dimension": "adaptability",
    "text": "Я совмещаю AI с ручной работой — знаю, где AI силён, а где лучше сделать самому.",
    "textEn": "I combine AI with manual work — I know where AI excels and where it's better to do things myself.",
    "reverse": false
  },
  {
    "id": "ad_10",
    "dimension": "adaptability",
    "text": "Я комфортно себя чувствую в ситуации, когда у меня нет чёткого плана — разберусь по ходу.",
    "textEn": "I feel comfortable in situations where I don't have a clear plan — I'll figure it out as I go.",
    "reverse": false
  },
  {
    "id": "cl_01",
    "dimension": "collaboration",
    "text": "На код-ревью я стараюсь не просто указать на проблему, а объяснить почему это проблема и предложить альтернативу — чтобы автору было понятно и полезно.",
    "textEn": "In code review, I try not just to point out problems but explain why it's a problem and suggest an alternative — so the author learns something useful.",
    "reverse": false
  },
  {
    "id": "cl_02",
    "dimension": "collaboration",
    "text": "Когда я нахожу классный AI-промпт или workflow, который экономит мне часы работы — я держу это при себе, потому что это моё конкурентное преимущество.",
    "textEn": "When I find an amazing AI prompt or workflow that saves me hours — I keep it to myself because it's my competitive advantage.",
    "reverse": true
  },
  {
    "id": "cl_03",
    "dimension": "collaboration",
    "text": "Я спокойно воспринимаю критику своего кода — понимаю, что ревью направлено на код, а не на меня лично.",
    "textEn": "I take code criticism calmly — I understand that review is aimed at the code, not at me personally.",
    "reverse": false
  },
  {
    "id": "cl_04",
    "dimension": "collaboration",
    "text": "Когда коллега использует AI для генерации кода, я при ревью придираюсь строже, чем к написанному вручную — мне кажется, AI-код требует больше скепсиса.",
    "textEn": "When a colleague uses AI to generate code, I'm stricter in review than with hand-written code — I feel AI code deserves more skepticism.",
    "reverse": true
  },
  {
    "id": "cl_05",
    "dimension": "collaboration",
    "text": "Я регулярно делюсь промежуточными результатами работы с командой — даже если работа ещё не закончена. Лучше получить ранний фидбек, чем переделывать готовое.",
    "textEn": "I regularly share work-in-progress with the team — even when it's not finished. Better to get early feedback than rework the finished product.",
    "reverse": false
  },
  {
    "id": "cl_06",
    "dimension": "collaboration",
    "text": "Если я использовал AI для написания значительной части кода, я предпочитаю это не упоминать в PR — не хочу, чтобы коллеги относились к этому коду с предубеждением.",
    "textEn": "If I used AI for a significant part of the code, I prefer not to mention it in the PR — I don't want colleagues to be biased against it.",
    "reverse": true
  },
  {
    "id": "cl_07",
    "dimension": "collaboration",
    "text": "При парном программировании я умею переключаться между ролью «ведущего» и «наблюдателя» — мне комфортно и писать код, и наблюдать, давая советы.",
    "textEn": "In pair programming, I can switch between 'driver' and 'navigator' roles — I'm comfortable both writing code and observing with suggestions.",
    "reverse": false
  },
  {
    "id": "cl_08",
    "dimension": "collaboration",
    "text": "Когда я работаю с AI-ассистентом, я фактически перестаю нуждаться в обсуждении решений с командой — AI заменяет мне «второе мнение».",
    "textEn": "When working with an AI assistant, I essentially stop needing to discuss solutions with the team — AI replaces my 'second opinion'.",
    "reverse": true
  },
  {
    "id": "cl_09",
    "dimension": "collaboration",
    "text": "Я пишу документацию и комментарии не потому что заставляют, а потому что понимаю — через три месяца никто, включая меня, не вспомнит, почему этот код такой.",
    "textEn": "I write documentation and comments not because I'm forced to, but because I know in three months nobody, including me, will remember why this code is the way it is.",
    "reverse": false
  },
  {
    "id": "cl_10",
    "dimension": "collaboration",
    "text": "В удалённой команде я проактивно пишу апдейты о статусе задач, а не жду, пока спросят на стендапе.",
    "textEn": "In a remote team, I proactively post task status updates rather than waiting to be asked at standup.",
    "reverse": false
  },
  {
    "id": "cm_01",
    "dimension": "communication",
    "text": "Когда я формулирую задачу для AI, я даю контекст — зачем это нужно, в какой проект, какие ограничения.",
    "textEn": "When I formulate a task for AI, I provide context — why it's needed, what project it's for, what constraints exist.",
    "reverse": false
  },
  {
    "id": "cm_02",
    "dimension": "communication",
    "text": "Когда коллега объясняет свою идею, я жду, пока он закончит, и только потом высказываюсь.",
    "textEn": "When a colleague explains their idea, I wait until they finish before I respond.",
    "reverse": false
  },
  {
    "id": "cm_03",
    "dimension": "communication",
    "text": "Если AI не понял мой запрос с первого раза, я обычно перефразирую и уточняю, а не повторяю то же самое громче.",
    "textEn": "If AI doesn't understand my request the first time, I usually rephrase and clarify rather than repeating the same thing louder.",
    "reverse": false
  },
  {
    "id": "cm_04",
    "dimension": "communication",
    "text": "Мне сложно объяснить техническую проблему нетехническому человеку — я или упрощаю до потери смысла, или перегружаю деталями.",
    "textEn": "I struggle to explain a technical problem to a non-technical person — I either oversimplify to the point of losing meaning or overload with details.",
    "reverse": true
  },
  {
    "id": "cm_05",
    "dimension": "communication",
    "text": "Я разбиваю сложные промпты на шаги: сначала контекст, потом задача, потом формат ответа.",
    "textEn": "I break complex prompts into steps: first context, then the task, then the expected output format.",
    "reverse": false
  },
  {
    "id": "cm_06",
    "dimension": "communication",
    "text": "В переписке я часто получаю уточняющие вопросы — видимо, мои сообщения не всегда понятны с первого раза.",
    "textEn": "In written communication, I often get follow-up questions — apparently my messages aren't always clear the first time.",
    "reverse": true
  },
  {
    "id": "cm_07",
    "dimension": "communication",
    "text": "Когда AI выдаёт не то, что нужно, я анализирую свой промпт — может, я сам нечётко сформулировал.",
    "textEn": "When AI produces something off-target, I analyze my prompt — maybe I wasn't clear enough myself.",
    "reverse": false
  },
  {
    "id": "cm_08",
    "dimension": "communication",
    "text": "Я адаптирую свой стиль общения под собеседника: с разработчиком говорю иначе, чем с дизайнером или менеджером.",
    "textEn": "I adapt my communication style to the audience: I speak differently with a developer than with a designer or manager.",
    "reverse": false
  },
  {
    "id": "cm_09",
    "dimension": "communication",
    "text": "Я использую примеры в промптах — показываю AI, какой результат хочу, а не только описываю его словами.",
    "textEn": "I use examples in prompts — I show AI what result I want, not just describe it in words.",
    "reverse": false
  },
  {
    "id": "cm_10",
    "dimension": "communication",
    "text": "Я плохо документирую свою работу — через месяц сам не помню, почему принял то или иное решение.",
    "textEn": "I'm bad at documenting my work — a month later I can't remember why I made a particular decision.",
    "reverse": true
  },
  {
    "id": "cr_01",
    "dimension": "conflict_resolution",
    "text": "Когда я не согласен с коллегой, я стараюсь сначала пересказать его позицию своими словами — чтобы убедиться, что правильно понял, прежде чем спорить.",
    "textEn": "When I disagree with a colleague, I first try to restate their position in my own words — to make sure I understand before arguing.",
    "reverse": false
  },
  {
    "id": "cr_02",
    "dimension": "conflict_resolution",
    "text": "В споре о том, использовать AI или делать вручную — я готов привести конкретные аргументы: время, качество, поддерживаемость — а не просто «AI лучше» или «руками надёжнее».",
    "textEn": "In a debate about using AI vs doing it manually — I'm ready to give specific arguments: time, quality, maintainability — not just 'AI is better' or 'manual is safer'.",
    "reverse": false
  },
  {
    "id": "cr_03",
    "dimension": "conflict_resolution",
    "text": "Мне проще написать в чат, чем обсуждать конфликт голосом — в тексте я лучше контролирую эмоции.",
    "textEn": "I find it easier to write in chat than discuss conflict by voice — I control my emotions better in text.",
    "reverse": true
  },
  {
    "id": "cr_04",
    "dimension": "conflict_resolution",
    "text": "Когда я понимаю, что ошибся в техническом споре — я могу прямо сказать: «Ты был прав, я ошибался. Спасибо, что настоял».",
    "textEn": "When I realize I was wrong in a technical argument, I can directly say: 'You were right, I was wrong. Thanks for pushing back.'",
    "reverse": false
  },
  {
    "id": "cr_05",
    "dimension": "conflict_resolution",
    "text": "Когда коллега категорически против AI-инструментов и блокирует их внедрение — я скорее отступлю, чем буду настаивать, даже если уверен в пользе.",
    "textEn": "When a colleague is categorically against AI tools and blocks their adoption — I'd rather back down than insist, even if I'm confident in the benefit.",
    "reverse": true
  },
  {
    "id": "cr_06",
    "dimension": "conflict_resolution",
    "text": "Я умею давать жёсткий фидбек так, чтобы человек не закрылся — фокусируюсь на конкретных действиях и последствиях, а не на личности.",
    "textEn": "I can give tough feedback without making the person shut down — I focus on specific actions and consequences, not on personality.",
    "reverse": false
  },
  {
    "id": "cr_07",
    "dimension": "conflict_resolution",
    "text": "Когда двое коллег спорят и не могут договориться — я иногда выступаю медиатором: помогаю обоим увидеть суть разногласия и найти компромисс.",
    "textEn": "When two colleagues argue and can't agree — I sometimes step in as a mediator: help both see the core disagreement and find a compromise.",
    "reverse": false
  },
  {
    "id": "cr_08",
    "dimension": "conflict_resolution",
    "text": "В споре о качестве AI-сгенерированного кода я склонен переходить на личности: «Ты просто не умеешь промптить» или «Ты просто боишься нового».",
    "textEn": "In debates about AI-generated code quality, I tend to get personal: 'You just can't prompt properly' or 'You're just afraid of new things.'",
    "reverse": true
  },
  {
    "id": "cr_09",
    "dimension": "conflict_resolution",
    "text": "Когда на меня повышают голос или критикуют резко — я могу сохранить спокойствие и отвечать по существу, не переходя в оборону.",
    "textEn": "When someone raises their voice or criticizes me harshly — I can stay calm and respond substantively without getting defensive.",
    "reverse": false
  },
  {
    "id": "cr_10",
    "dimension": "conflict_resolution",
    "text": "Я замечаю, когда мелкое недовольство в команде начинает перерастать в серьёзный конфликт — и стараюсь поднять тему раньше, чем бахнет.",
    "textEn": "I notice when small frustrations in the team start escalating into a serious conflict — and I try to address it before it explodes.",
    "reverse": false
  },
  {
    "id": "ct_01",
    "dimension": "critical_thinking",
    "text": "Когда AI генерирует мне код, я всегда прогоняю его в голове или на тестах, прежде чем вставлять в проект.",
    "textEn": "When AI generates code for me, I always mentally trace through it or run tests before putting it into my project.",
    "reverse": false
  },
  {
    "id": "ct_02",
    "dimension": "critical_thinking",
    "text": "Если результат выглядит правдоподобно и логично, я обычно принимаю его без дополнительной проверки — зачем тратить время.",
    "textEn": "If a result looks plausible and logical, I usually accept it without additional verification — why waste time.",
    "reverse": true
  },
  {
    "id": "ct_03",
    "dimension": "critical_thinking",
    "text": "Я замечаю, когда ChatGPT или другой AI уверенно выдаёт неправильный ответ — у меня уже выработалось чутьё на 'уверенную чушь'.",
    "textEn": "I notice when ChatGPT or another AI confidently gives a wrong answer — I've developed an instinct for 'confident nonsense'.",
    "reverse": false
  },
  {
    "id": "ct_04",
    "dimension": "critical_thinking",
    "text": "Когда я читаю статью или отчёт, я автоматически задаюсь вопросом: 'А какой источник? Можно ли ему доверять?'",
    "textEn": "When I read an article or report, I automatically ask myself: 'What's the source? Can it be trusted?'",
    "reverse": false
  },
  {
    "id": "ct_05",
    "dimension": "critical_thinking",
    "text": "Если AI предлагает решение, которое я не до конца понимаю, но оно работает — я оставляю его как есть и иду дальше.",
    "textEn": "If AI suggests a solution I don't fully understand but it works — I leave it as is and move on.",
    "reverse": true
  },
  {
    "id": "ct_06",
    "dimension": "critical_thinking",
    "text": "Я часто ловлю себя на том, что проверяю факты, даже когда коллеги уже приняли информацию как данность.",
    "textEn": "I often catch myself fact-checking things even when colleagues have already accepted the information as given.",
    "reverse": false
  },
  {
    "id": "ct_07",
    "dimension": "critical_thinking",
    "text": "Когда AI-код компилируется и проходит базовый тест, я считаю задачу решённой — edge cases можно разобрать потом.",
    "textEn": "When AI-generated code compiles and passes a basic test, I consider the task done — edge cases can be dealt with later.",
    "reverse": true
  },
  {
    "id": "ct_08",
    "dimension": "critical_thinking",
    "text": "Мне сложно спорить с экспертом, даже если я чувствую, что он неправ — авторитет давит.",
    "textEn": "I find it hard to argue with an expert, even when I feel they're wrong — authority pressure gets to me.",
    "reverse": true
  },
  {
    "id": "ct_09",
    "dimension": "critical_thinking",
    "text": "Я перепроверяю числа и расчёты, которые выдаёт AI, потому что знаю — LLM плохо считают.",
    "textEn": "I double-check numbers and calculations that AI produces, because I know LLMs are bad at math.",
    "reverse": false
  },
  {
    "id": "ct_10",
    "dimension": "critical_thinking",
    "text": "Когда кто-то приводит статистику в споре, я первым делом думаю: 'А что осталось за кадром?'",
    "textEn": "When someone cites statistics in a debate, my first thought is: 'What's been left out of the picture?'",
    "reverse": false
  },
  {
    "id": "ei_01",
    "dimension": "emotional_intelligence",
    "text": "Я замечаю по тону сообщений в чате, когда коллега раздражён или расстроен — даже если он прямо об этом не говорит.",
    "textEn": "I notice from the tone of chat messages when a colleague is irritated or upset — even when they don't say it explicitly.",
    "reverse": false
  },
  {
    "id": "ei_02",
    "dimension": "emotional_intelligence",
    "text": "Когда AI раз за разом выдаёт бред — я ловлю себя на том, что начинаю злиться на инструмент как на живого собеседника.",
    "textEn": "When AI repeatedly outputs nonsense — I catch myself getting angry at the tool as if it were a real person.",
    "reverse": true
  },
  {
    "id": "ei_03",
    "dimension": "emotional_intelligence",
    "text": "Я умею радоваться чужим успехам — когда коллега сделал крутую фичу или получил повышение, я искренне за него рад, без примеси зависти.",
    "textEn": "I can genuinely celebrate others' successes — when a colleague ships a cool feature or gets promoted, I'm happy for them without a hint of envy.",
    "reverse": false
  },
  {
    "id": "ei_04",
    "dimension": "emotional_intelligence",
    "text": "Мне сложно попросить о помощи, когда я застрял — я чувствую, что это покажет мою некомпетентность.",
    "textEn": "I find it hard to ask for help when I'm stuck — I feel it would show my incompetence.",
    "reverse": true
  },
  {
    "id": "ei_05",
    "dimension": "emotional_intelligence",
    "text": "Я замечаю, когда коллега переживает из-за того, что AI может заменить его работу — и стараюсь поддержать, показать перспективу.",
    "textEn": "I notice when a colleague is anxious that AI might replace their job — and I try to support them and show perspective.",
    "reverse": false
  },
  {
    "id": "ei_06",
    "dimension": "emotional_intelligence",
    "text": "Когда я устал или раздражён — я продолжаю общаться с командой как обычно, не считая нужным фильтровать тон. Они взрослые люди.",
    "textEn": "When I'm tired or irritated, I continue communicating with the team as usual without filtering my tone. They're adults.",
    "reverse": true
  },
  {
    "id": "ei_07",
    "dimension": "emotional_intelligence",
    "text": "Я знаю свои триггеры — ситуации, после которых я становлюсь менее продуктивным или раздражительным, и умею заранее принять меры.",
    "textEn": "I know my triggers — situations that make me less productive or irritable — and I can take preemptive measures.",
    "reverse": false
  },
  {
    "id": "ei_08",
    "dimension": "emotional_intelligence",
    "text": "Когда AI помогает мне сделать за час то, на что коллега тратит день вручную — я не хвастаюсь этим, а предлагаю показать подход.",
    "textEn": "When AI helps me do in an hour what a colleague spends a day on manually — I don't brag about it, I offer to show the approach.",
    "reverse": false
  },
  {
    "id": "ei_09",
    "dimension": "emotional_intelligence",
    "text": "Я замечаю у себя признаки выгорания — потерю интереса, цинизм, хроническую усталость — и принимаю меры, а не игнорирую.",
    "textEn": "I notice signs of burnout in myself — loss of interest, cynicism, chronic fatigue — and take action rather than ignore it.",
    "reverse": false
  },
  {
    "id": "ei_10",
    "dimension": "emotional_intelligence",
    "text": "Когда я чувствую фрустрацию от работы с AI (ничего не получается, модель тупит) — я делаю паузу, а не продолжаю злиться и генерировать запрос за запросом.",
    "textEn": "When I feel frustrated working with AI (nothing works, the model is being dumb) — I take a break instead of continuing to rage and prompt after prompt.",
    "reverse": false
  },
  {
    "id": "ld_01",
    "dimension": "leadership",
    "text": "Когда я вижу системную проблему в процессах команды — я не жду, пока руководство заметит, а сам формулирую предложение и выношу на обсуждение.",
    "textEn": "When I spot a systemic issue in team processes, I don't wait for management to notice — I formulate a proposal and bring it up for discussion.",
    "reverse": false
  },
  {
    "id": "ld_02",
    "dimension": "leadership",
    "text": "Я считаю, что предлагать изменения без просьбы — это лезть не в своё дело. Лучше делать что говорят и не высовываться.",
    "textEn": "I think proposing changes nobody asked for is overstepping. It's better to do what you're told and keep your head down.",
    "reverse": true
  },
  {
    "id": "ld_03",
    "dimension": "leadership",
    "text": "Когда появляется новый AI-инструмент, который может ускорить работу команды — я сам тестирую его, готовлю демо и предлагаю пилот, а не жду, пока кто-то сверху скажет «попробуйте».",
    "textEn": "When a new AI tool appears that could speed up the team — I test it myself, prepare a demo, and propose a pilot, rather than waiting for someone above to say 'try it'.",
    "reverse": false
  },
  {
    "id": "ld_04",
    "dimension": "leadership",
    "text": "Когда нужно принять решение, а данных мало и время поджимает — я могу взять ответственность на себя и решить, а не бесконечно собирать мнения.",
    "textEn": "When a decision needs to be made with little data and tight deadlines — I can take responsibility and decide rather than endlessly collecting opinions.",
    "reverse": false
  },
  {
    "id": "ld_05",
    "dimension": "leadership",
    "text": "Мне комфортнее, когда решение принимает кто-то другой — так если что-то пойдёт не так, ответственность не на мне.",
    "textEn": "I'm more comfortable when someone else makes the decision — that way if something goes wrong, the responsibility isn't on me.",
    "reverse": true
  },
  {
    "id": "ld_06",
    "dimension": "leadership",
    "text": "Я активно продвигаю в команде культуру AI-грамотности — объясняю возможности и ограничения, помогаю скептикам увидеть пользу, а энтузиастам — риски.",
    "textEn": "I actively promote AI literacy culture in the team — explaining capabilities and limitations, helping skeptics see benefits and enthusiasts see risks.",
    "reverse": false
  },
  {
    "id": "ld_07",
    "dimension": "leadership",
    "text": "Я умею делегировать задачи — даже если мне кажется, что сам сделаю лучше. Понимаю, что рост команды важнее моего перфекционизма.",
    "textEn": "I can delegate tasks — even when I think I'd do it better myself. I understand that team growth matters more than my perfectionism.",
    "reverse": false
  },
  {
    "id": "ld_08",
    "dimension": "leadership",
    "text": "Когда что-то идёт не так по моей вине — я не ищу виноватых и не прячусь за «AI так сгенерировал». Я открыто признаю ошибку и предлагаю план исправления.",
    "textEn": "When something goes wrong because of me — I don't look for someone to blame or hide behind 'AI generated it that way'. I openly admit the mistake and propose a fix.",
    "reverse": false
  },
  {
    "id": "ld_09",
    "dimension": "leadership",
    "text": "Я замечаю, когда команда теряет мотивацию или буксует — и стараюсь что-то с этим сделать: поговорить, предложить помощь, изменить подход.",
    "textEn": "I notice when the team loses motivation or gets stuck — and I try to do something about it: talk, offer help, change the approach.",
    "reverse": false
  },
  {
    "id": "ld_10",
    "dimension": "leadership",
    "text": "Когда руководство просит внедрить AI в рабочий процесс, а команда сопротивляется — я стою в стороне и жду, пока ситуация разрешится сама.",
    "textEn": "When management asks to adopt AI in the workflow and the team resists — I stand aside and wait for the situation to resolve itself.",
    "reverse": true
  },
  {
    "id": "pt_01",
    "dimension": "product_thinking",
    "text": "Когда я делаю фичу, я думаю не только о коде, но и о том, как пользователь будет с ней взаимодействовать.",
    "textEn": "When I build a feature, I think not just about the code but about how the user will interact with it.",
    "reverse": false
  },
  {
    "id": "pt_02",
    "dimension": "product_thinking",
    "text": "Я прошу AI сгенерировать MVP — минимально рабочую версию, а не идеальное решение с первого раза.",
    "textEn": "I ask AI to generate an MVP — a minimal working version, not a perfect solution on the first try.",
    "reverse": false
  },
  {
    "id": "pt_03",
    "dimension": "product_thinking",
    "text": "Я могу потратить неделю на идеальную архитектуру, даже если нужен был рабочий прототип за день.",
    "textEn": "I can spend a week on perfect architecture even when a working prototype was needed in a day.",
    "reverse": true
  },
  {
    "id": "pt_04",
    "dimension": "product_thinking",
    "text": "Когда AI генерирует UI, я оцениваю его глазами пользователя — удобно ли? Понятно ли? Что может пойти не так?",
    "textEn": "When AI generates UI, I evaluate it through the user's eyes — is it convenient? Is it clear? What could go wrong?",
    "reverse": false
  },
  {
    "id": "pt_05",
    "dimension": "product_thinking",
    "text": "Я думаю о пустых состояниях, ошибках и загрузке — не только о happy path.",
    "textEn": "I think about empty states, errors, and loading — not just the happy path.",
    "reverse": false
  },
  {
    "id": "pt_06",
    "dimension": "product_thinking",
    "text": "Я использую AI для быстрого прототипирования — генерирую варианты, показываю пользователям, собираю фидбек.",
    "textEn": "I use AI for rapid prototyping — I generate variants, show them to users, and collect feedback.",
    "reverse": false
  },
  {
    "id": "pt_07",
    "dimension": "product_thinking",
    "text": "Для меня 'готово' = код работает. UX, тексты, edge cases — это всё 'потом'.",
    "textEn": "For me 'done' = code works. UX, copy, edge cases — that's all 'later'.",
    "reverse": true
  },
  {
    "id": "pt_08",
    "dimension": "product_thinking",
    "text": "Когда AI предлагает добавить фичу, я спрашиваю себя: 'А кому это реально нужно? Это решает проблему?'",
    "textEn": "When AI suggests adding a feature, I ask myself: 'Who actually needs this? Does it solve a problem?'",
    "reverse": false
  },
  {
    "id": "pt_09",
    "dimension": "product_thinking",
    "text": "Я понимаю бизнес-контекст продукта: кто платит, зачем, какие метрики важны.",
    "textEn": "I understand the business context of the product: who pays, why, what metrics matter.",
    "reverse": false
  },
  {
    "id": "pt_10",
    "dimension": "product_thinking",
    "text": "Я часто увлекаюсь AI-генерацией и добавляю в проект вещи, которые никто не просил — 'ну AI же быстро сделал'.",
    "textEn": "I often get carried away with AI generation and add things to the project that nobody asked for — 'well, AI did it quickly'.",
    "reverse": true
  },
  {
    "id": "so_01",
    "dimension": "self_organization",
    "text": "Прежде чем начать писать код (или просить AI), я формулирую план — что нужно сделать, в каком порядке.",
    "textEn": "Before I start writing code (or asking AI), I formulate a plan — what needs to be done and in what order.",
    "reverse": false
  },
  {
    "id": "so_02",
    "dimension": "self_organization",
    "text": "Я часто начинаю новую задачу, не закончив предыдущую — хочется поскорее попробовать что-то свежее.",
    "textEn": "I often start a new task before finishing the previous one — I'm eager to try something fresh.",
    "reverse": true
  },
  {
    "id": "so_03",
    "dimension": "self_organization",
    "text": "Когда AI сгенерировал мне код, я прогоняю тесты и проверяю edge cases перед тем, как мержить.",
    "textEn": "When AI generates code for me, I run tests and check edge cases before merging.",
    "reverse": false
  },
  {
    "id": "so_04",
    "dimension": "self_organization",
    "text": "Мой git-репозиторий — это хаос: огромные коммиты, неинформативные сообщения, всё в одной ветке.",
    "textEn": "My git repository is a mess: huge commits, uninformative messages, everything in one branch.",
    "reverse": true
  },
  {
    "id": "so_05",
    "dimension": "self_organization",
    "text": "Я ставлю себе таймер на задачи с AI — знаю, что можно бесконечно 'улучшать' промпт, и это ловушка.",
    "textEn": "I set a timer for AI tasks — I know you can endlessly 'improve' a prompt, and that's a trap.",
    "reverse": false
  },
  {
    "id": "so_06",
    "dimension": "self_organization",
    "text": "Я разбиваю большие задачи на маленькие, чётко определённые шаги, прежде чем приступать.",
    "textEn": "I break large tasks into small, clearly defined steps before starting.",
    "reverse": false
  },
  {
    "id": "so_07",
    "dimension": "self_organization",
    "text": "Я легко ухожу в 'rabbit hole' с AI — начал с одной задачи, а через два часа делаю что-то совершенно другое.",
    "textEn": "I easily go down a rabbit hole with AI — I started with one task, and two hours later I'm doing something completely different.",
    "reverse": true
  },
  {
    "id": "so_08",
    "dimension": "self_organization",
    "text": "Я приоритизирую задачи: делаю важное и срочное первым, а не то, что проще или интереснее.",
    "textEn": "I prioritize tasks: I do what's important and urgent first, not what's easier or more interesting.",
    "reverse": false
  },
  {
    "id": "so_09",
    "dimension": "self_organization",
    "text": "Я храню промпты, шаблоны и рабочие конфигурации AI в организованном виде — легко нахожу их потом.",
    "textEn": "I keep prompts, templates, and working AI configurations organized — I can easily find them later.",
    "reverse": false
  },
  {
    "id": "so_10",
    "dimension": "self_organization",
    "text": "Мне сложно оценить, сколько времени займёт задача — я регулярно ошибаюсь в 2-3 раза.",
    "textEn": "I struggle to estimate how long a task will take — I'm regularly off by 2-3x.",
    "reverse": true
  },
  {
    "id": "tm_01",
    "dimension": "time_management",
    "text": "Я умею отличать задачу, которая реально требует 8 часов, от той, которую я сам раздуваю до 8 часов перфекционизмом.",
    "textEn": "I can tell the difference between a task that genuinely requires 8 hours and one I inflate to 8 hours through perfectionism.",
    "reverse": false
  },
  {
    "id": "tm_02",
    "dimension": "time_management",
    "text": "Я часто ныряю в AI-генерацию «ещё одного варианта» — и через два часа понимаю, что первый вариант был нормальным.",
    "textEn": "I often dive into generating 'one more variant' with AI — and two hours later realize the first version was fine.",
    "reverse": true
  },
  {
    "id": "tm_03",
    "dimension": "time_management",
    "text": "Я чётко понимаю, когда задача быстрее решается руками, а когда стоит потратить время на промптинг — и не попадаю в ловушку автоматизации ради автоматизации.",
    "textEn": "I clearly understand when a task is faster done by hand vs when it's worth investing time in prompting — and I don't fall into the automation-for-automation's-sake trap.",
    "reverse": false
  },
  {
    "id": "tm_04",
    "dimension": "time_management",
    "text": "Я умею говорить «нет» — если задача не влезает в спринт или я уже перегружен, я честно говорю об этом, а не молча беру и потом не успеваю.",
    "textEn": "I can say 'no' — if a task doesn't fit the sprint or I'm already overloaded, I'm honest about it instead of silently taking it and then missing deadlines.",
    "reverse": false
  },
  {
    "id": "tm_05",
    "dimension": "time_management",
    "text": "Мне сложно остановиться, когда AI предлагает «а можно ещё вот это улучшить» — и в итоге я полирую то, что уже работает, вместо того чтобы двигаться дальше.",
    "textEn": "I find it hard to stop when AI suggests 'we could also improve this' — and I end up polishing what already works instead of moving forward.",
    "reverse": true
  },
  {
    "id": "tm_06",
    "dimension": "time_management",
    "text": "Я защищаю своё время для deep work — ставлю блоки в календаре, отключаю нотификации, не позволяю встречам съесть весь день.",
    "textEn": "I protect my deep work time — I block calendar slots, turn off notifications, and don't let meetings eat up the whole day.",
    "reverse": false
  },
  {
    "id": "tm_07",
    "dimension": "time_management",
    "text": "Когда я даю оценку срока задачи — я учитываю время на ревью, тестирование, фиксы, а не только на написание кода.",
    "textEn": "When I estimate a task timeline, I account for review, testing, and fixes — not just writing the code.",
    "reverse": false
  },
  {
    "id": "tm_08",
    "dimension": "time_management",
    "text": "Я иногда трачу час на то, чтобы заставить AI написать идеальный regex или SQL-запрос, хотя за 10 минут мог бы написать его сам.",
    "textEn": "I sometimes spend an hour trying to get AI to write the perfect regex or SQL query, when I could have written it myself in 10 minutes.",
    "reverse": true
  },
  {
    "id": "tm_09",
    "dimension": "time_management",
    "text": "Я умею батчить похожие задачи — собираю все мелкие правки, баг-фиксы или ревью и делаю их блоком, а не переключаюсь туда-сюда.",
    "textEn": "I batch similar tasks — I collect all small fixes, bug patches, or reviews and do them in a block, rather than switching back and forth.",
    "reverse": false
  },
  {
    "id": "tm_10",
    "dimension": "time_management",
    "text": "Когда я использую AI для нескольких задач параллельно — я часто теряю фокус и в итоге ни одна задача не доведена до конца.",
    "textEn": "When I use AI for several tasks in parallel — I often lose focus and end up with none of the tasks completed.",
    "reverse": true
  }
]
;
