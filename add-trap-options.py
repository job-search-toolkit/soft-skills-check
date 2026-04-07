#!/usr/bin/env python3
"""Add 5th trap options (key "e") to quiz questions that only have 4 options."""

import json
import re

# Trap options for each question ID
# Format: { "id": { "text": "Russian text", "textEn": "English text" } }
TRAPS = {
    # === ADAPTABILITY ===
    "ad_q01": {
        "text": "Способности развиваются, но только при наличии базового «порога таланта» по модели Двек",
        "textEn": "Abilities develop, but only if a baseline 'talent threshold' exists per Dweck's model"
    },
    "ad_q02": {
        "text": "Acceptance (Принятие) — без внутреннего принятия невозможно двигаться дальше",
        "textEn": "Acceptance — without internal acceptance it's impossible to move forward"
    },
    "ad_q04": {
        "text": "Создать пилотную группу из early adopters и масштабировать по модели диффузии Роджерса",
        "textEn": "Create a pilot group of early adopters and scale using Rogers' diffusion model"
    },
    "ad_q07": {
        "text": "Глубокая экспертиза в одной области с навыками делегирования задач из смежных",
        "textEn": "Deep expertise in one area with skills to delegate tasks from adjacent ones"
    },
    "ad_q16": {
        "text": "«Ты использовал эффективную стратегию декомпозиции по Блуму»",
        "textEn": "'You used an effective decomposition strategy according to Bloom's taxonomy'"
    },
    "ad_q17": {
        "text": "Торг — человек пытается договориться с реальностью и минимизировать потери",
        "textEn": "Bargaining — the person tries to negotiate with reality and minimize losses"
    },
    "ad_q18": {
        "text": "Self-awareness agility — способность осознавать свои паттерны поведения в реальном времени",
        "textEn": "Self-awareness agility — ability to recognize your own behavior patterns in real time"
    },
    "ad_q19": {
        "text": "Из-за эффекта привыкания (гедонистическая адаптация) знакомое перестаёт стимулировать мозг",
        "textEn": "Due to hedonic adaptation effect, the familiar stops stimulating the brain"
    },
    "ad_q23": {
        "text": "I-shaped владеет инструментами AI для автоматизации, а T-shaped — нет",
        "textEn": "I-shaped masters AI automation tools while T-shaped does not"
    },
    "ad_q26": {
        "text": "70% менторинг, 20% проектное обучение, 10% саморефлексия по модели Колба",
        "textEn": "70% mentoring, 20% project-based learning, 10% self-reflection per Kolb's model"
    },
    "ad_q27": {
        "text": "Регулярное повторение материала с увеличивающимися интервалами по методу Лейтнера",
        "textEn": "Regular spaced repetition of material with increasing intervals per the Leitner method"
    },
    "ad_q28": {
        "text": "Внедрить Agile-ретроспективы по методу «Парусник», чтобы стадии проходились итеративно",
        "textEn": "Implement Agile retrospectives using the 'Sailboat' method so stages are iterated through"
    },
    "ad_q29": {
        "text": "Потому что growth mindset работает только совместно с «deliberate practice» Эриксона",
        "textEn": "Because growth mindset only works combined with Ericsson's 'deliberate practice' approach"
    },
    "ad_q30": {
        "text": "Использовать метод двойной петли обучения Аргириса для рефрейминга ментальных моделей",
        "textEn": "Use Argyris's double-loop learning to reframe mental models systematically"
    },
    "ad_q31": {
        "text": "Он имеет высокий балл по Openness в Big Five, что коррелирует с learning agility",
        "textEn": "They score high on Openness in Big Five, which correlates with learning agility"
    },
    "ad_q32": {
        "text": "Умение предвидеть «чёрных лебедей» (по Талебу) и готовить план B заранее",
        "textEn": "Ability to foresee 'black swans' (per Taleb) and prepare plan B in advance"
    },
    "ad_q33": {
        "text": "Построить личную карту компетенций (skills matrix) и закрывать пробелы инструментами AI",
        "textEn": "Build a personal skills matrix and fill gaps using AI automation tools"
    },
    "ad_q34": {
        "text": "Grit (упорство по Дакворт) — но только в сочетании с высоким IQ по данным метаанализов",
        "textEn": "Grit (per Duckworth) — but only combined with high IQ according to meta-analyses"
    },
    "ad_q40": {
        "text": "AI автоматизирует горизонтальную перекладину T, освобождая время для углубления вертикали",
        "textEn": "AI automates the T's horizontal bar, freeing time to deepen the vertical specialization"
    },
    "ad_q06": {
        "text": "Потому что Reinforcement активирует цикл привычки «сигнал — действие — награда» Дахигга",
        "textEn": "Because Reinforcement activates Duhigg's habit loop of 'cue — routine — reward'"
    },

    # === COLLABORATION ===
    "cl_q02": {
        "text": "Прозрачность и чёткие KPI — по методологии Management by Objectives Друкера",
        "textEn": "Transparency and clear KPIs — per Drucker's Management by Objectives methodology"
    },
    "cl_q03": {
        "text": "Forming → Storming → Performing → Norming → Adjourning",
        "textEn": "Forming → Storming → Performing → Norming → Adjourning"
    },
    "cl_q07": {
        "text": "Руководитель выступает фасилитатором, а не принимает решения единолично",
        "textEn": "The manager acts as a facilitator rather than making decisions unilaterally"
    },
    "cl_q08": {
        "text": "Использовать AI как парного программиста и документировать это через co-author коммиты",
        "textEn": "Use AI as a pair programmer and document it through co-author commit messages"
    },
    "cl_b02": {
        "text": "Координирует работу между подкомандами по матричной структуре проекта",
        "textEn": "Coordinates work between sub-teams according to the project's matrix structure"
    },
    "cl_b03": {
        "text": "Разнообразие когнитивных стилей в команде (по MBTI или Belbin)",
        "textEn": "Diversity of cognitive styles in the team (per MBTI or Belbin team roles)"
    },
    "cl_b05": {
        "text": "В мобе используется метод «round-robin code review» — каждый ревьюит код следующего",
        "textEn": "Mobbing uses 'round-robin code review' where each person reviews the next person's code"
    },
    "cl_b06": {
        "text": "Лидер команды неосознанно устанавливает социальную норму пассивности по Бандуре",
        "textEn": "The team lead unconsciously sets a social norm of passivity per Bandura's theory"
    },
    "cl_b13": {
        "text": "После каждого зелёного теста — по методу TDD red-green-refactor цикла",
        "textEn": "After each green test — following the TDD red-green-refactor cycle"
    },
    "cl_b15": {
        "text": "Внедрить систему OKR, чтобы каждый видел, как его задачи связаны с целями команды",
        "textEn": "Implement an OKR system so everyone sees how their tasks connect to team goals"
    },
    "cl_b16": {
        "text": "Код пишется методом TDD: сначала тест, потом реализация, потом рефакторинг всей командой",
        "textEn": "Code is written using TDD: first a test, then implementation, then refactoring by the team"
    },
    "cl_b17": {
        "text": "Performing+ — стадия, на которой команда достигает сверхпроизводительности и автономии",
        "textEn": "Performing+ — the stage where the team achieves hyper-productivity and full autonomy"
    },
    "cl_b18": {
        "text": "7±2 человека — по правилу магического числа Миллера для рабочей памяти",
        "textEn": "7±2 people — per Miller's Magic Number rule for working memory capacity"
    },
    "cl_q05": {
        "text": "Compassionate Empathy (сострадательная эмпатия) — по типологии Гоулмана",
        "textEn": "Compassionate Empathy — per Goleman's empathy typology framework"
    },
    "cl_q06": {
        "text": "Adjourning — именно при расформировании всплывают все подавленные разногласия",
        "textEn": "Adjourning — all suppressed disagreements surface during the disbanding phase"
    },
    "cl_q11": {
        "text": "Показывают более высокий NPS (Net Promoter Score) по оценкам стейкхолдеров",
        "textEn": "Show higher NPS (Net Promoter Score) in stakeholder satisfaction assessments"
    },
    "cl_q12": {
        "text": "Архитектурные решения — AI склонен к over-engineering по паттернам из обучающих данных",
        "textEn": "Architectural decisions — AI tends to over-engineer based on patterns from training data"
    },
    "cl_q13": {
        "text": "Команда проводит пре-мортем по методу Клейна для предотвращения будущих конфликтов",
        "textEn": "The team conducts pre-mortem using Klein's method to prevent future conflicts"
    },
    "cl_q15": {
        "text": "Passive Aggression (пассивная агрессия) — скрытое сопротивление без прямой конфронтации",
        "textEn": "Passive Aggression — hidden resistance without direct confrontation or feedback"
    },
    "cl_b01": {
        "text": "Norming — именно на стадии нормализации возникает наибольшее трение вокруг стандартов",
        "textEn": "Norming — the greatest friction around standards arises during the normalization stage"
    },

    # === COMMUNICATION ===
    "cm_q01": {
        "text": "Структурировать по модели SCQA (Situation, Complication, Question, Answer) Минто",
        "textEn": "Structure using Minto's SCQA model (Situation, Complication, Question, Answer)"
    },
    "cm_q02": {
        "text": "Strengths, Threats, Aspirations, Results — гибридная SWOT-модель для карьерного нарратива",
        "textEn": "Strengths, Threats, Aspirations, Results — a hybrid SWOT model for career narratives"
    },
    "cm_q03": {
        "text": "Эмпатия (Empathy) — сначала нужно прочувствовать состояние собеседника",
        "textEn": "Empathy — you must first feel the other person's state before anything else"
    },
    "cm_q08": {
        "text": "Указание системной роли (system prompt) с описанием персоны эксперта для модели",
        "textEn": "Specifying a system role (system prompt) with an expert persona description for the model"
    },
    "cm_q28": {
        "text": "Когнитивная перегрузка от многозадачности, описанная в модели ограниченной рациональности Саймона",
        "textEn": "Cognitive overload from multitasking, described in Simon's bounded rationality model"
    },
    "cm_q29": {
        "text": "GROW-модель лучше обоих, потому что включает цель (Goal) перед обратной связью",
        "textEn": "The GROW model is better than both because it includes a Goal before any feedback"
    },
    "cm_q30": {
        "text": "Пройти оценку 360° — она автоматически уменьшает все зоны окна Джохари",
        "textEn": "Complete a 360-degree assessment — it automatically reduces all Johari Window zones"
    },
    "cm_q31": {
        "text": "Использование chain-of-thought промпта, где модель рассуждает пошагово до ответа",
        "textEn": "Using a chain-of-thought prompt where the model reasons step by step before answering"
    },
    "cm_q33": {
        "text": "Использование фреймворка «объясни как пятилетнему» по методу Фейнмана",
        "textEn": "Using the 'explain it like I'm five' framework per the Feynman technique"
    },

    # === CONFLICT RESOLUTION ===
    "cr_q01": {
        "text": "Компромисс (Compromising) — обе стороны идут навстречу, что требует высокой кооперативности",
        "textEn": "Compromising — both sides meet halfway, which requires high cooperativeness"
    },
    "cr_q02": {
        "text": "Эмпатия → Рефлексия → Диалог → Соглашение — по модели Роджерса",
        "textEn": "Empathy → Reflection → Dialogue → Agreement — per Rogers' person-centered model"
    },
    "cr_q14": {
        "text": "Стороны должны привлечь сертифицированного медиатора для валидации критериев",
        "textEn": "Parties should engage a certified mediator to validate the proposed criteria"
    },
    "cr_b01": {
        "text": "Reforming — когда команда после конфликта переформатирует свои рабочие нормы",
        "textEn": "Reforming — when the team reformats its working norms after the conflict"
    },
    "cr_b03": {
        "text": "Стороны используют технику активного слушания Роджерса для достижения консенсуса",
        "textEn": "Parties use Rogers' active listening technique to reach full consensus"
    },
    "cr_b04": {
        "text": "Спасатель берёт на себя чужую ответственность, нарушая границы по модели RACI",
        "textEn": "The Rescuer takes on others' accountability, violating boundaries per the RACI model"
    },
    "cr_b07": {
        "text": "Участники имеют разный организационный уровень (например, менеджер и подчинённый)",
        "textEn": "Participants are at different organizational levels (e.g., manager and subordinate)"
    },
    "cr_b11": {
        "text": "Применить технику «тайм-аут» и вернуться к разговору через 24 часа по правилу Готтмана",
        "textEn": "Apply the 'time-out' technique and return to the conversation in 24 hours per Gottman's rule"
    },
    "cr_b17": {
        "text": "Использует метод Дельфи для достижения анонимного консенсуса между сторонами",
        "textEn": "Uses the Delphi method to achieve anonymous consensus between parties"
    },
    "cr_q05": {
        "text": "Высокой ассертивностью и высокой кооперативностью — избегание через силу позиции",
        "textEn": "High assertiveness and high cooperativeness — avoidance through position of strength"
    },
    "cr_q06": {
        "text": "Наблюдение использует объективные метрики (KPI), а оценка — субъективное мнение",
        "textEn": "Observation uses objective metrics (KPIs) while evaluation uses subjective opinion"
    },
    "cr_q08": {
        "text": "Когда применяется BATNA и ты можешь позволить себе уступить стратегически",
        "textEn": "When BATNA applies and you can afford to make a strategic concession"
    },
    "cr_q13": {
        "text": "Просьба формулируется в мягкой форме, а требование — в форме ультиматума с санкциями",
        "textEn": "A request uses soft phrasing while a demand is an ultimatum with stated sanctions"
    },
    "cr_b02": {
        "text": "Установить раппорт через подстройку по модели НЛП (нейролингвистического программирования)",
        "textEn": "Establish rapport through matching per the NLP (neurolinguistic programming) model"
    },
    "cr_b05": {
        "text": "Использования фреймворка Design Thinking для генерации креативных решений",
        "textEn": "Using the Design Thinking framework to generate creative problem solutions"
    },
    "cr_b06": {
        "text": "Чувство всегда начинается со слова «я», а оценка — со слова «ты»",
        "textEn": "A feeling always starts with 'I' while an evaluation starts with 'you'"
    },
    "cr_b08": {
        "text": "Нижняя граница (reservation price) в зоне возможного соглашения (ZOPA)",
        "textEn": "The reservation price at the lower boundary of the Zone of Possible Agreement (ZOPA)"
    },
    "cr_b09": {
        "text": "Когда обе стороны исчерпали BATNA и нуждаются в перерыве для переоценки позиций",
        "textEn": "When both sides have exhausted their BATNA and need a break to reassess positions"
    },
    "cr_b10": {
        "text": "Нападающий, Защитник и Арбитр — по модели конфликтной триады Левина",
        "textEn": "Attacker, Defender, and Arbiter — per Lewin's conflict triad model"
    },
    "cr_b12": {
        "text": "Использовать I-messages (я-сообщения) из NVC при обсуждении позиций за столом переговоров",
        "textEn": "Use I-messages from NVC when discussing positions at the negotiation table"
    },

    # === CRITICAL THINKING ===
    "ct_q01": {
        "text": "Метакогниция (Metacognition) — осознание своего мыслительного процесса",
        "textEn": "Metacognition — awareness of one's own thinking process"
    },
    "ct_q02": {
        "text": "Корректно оценивают себя после получения обратной связи по модели SBI",
        "textEn": "Accurately self-assess after receiving feedback using the SBI model framework"
    },
    "ct_q04": {
        "text": "Попросить другую AI-модель проверить ответ первой (cross-validation моделей)",
        "textEn": "Ask another AI model to verify the first one's answer (model cross-validation)"
    },
    "ct_q07": {
        "text": "Ты перепроверяешь ответ AI через тот же промпт, ожидая получить тот же результат",
        "textEn": "You re-check AI's answer with the same prompt expecting to get the same result"
    },
    "ct_q16": {
        "text": "Модели используют RAG (Retrieval-Augmented Generation), но индекс цитат устаревает",
        "textEn": "Models use RAG (Retrieval-Augmented Generation) but the citation index becomes stale"
    },
    "ct_q17": {
        "text": "«Это правда, потому что никто не смог это опровергнуть до сих пор»",
        "textEn": "'This is true because nobody has been able to disprove it so far'"
    },
    "ct_q18": {
        "text": "Использовать chain-of-thought промптинг, чтобы модель показала ход рассуждения",
        "textEn": "Use chain-of-thought prompting so the model shows its reasoning process"
    },
    "ct_q19": {
        "text": "делаем выводы на основе слишком маленькой выборки данных",
        "textEn": "draw conclusions based on a sample size that is far too small"
    },
    "ct_q20": {
        "text": "«Этот метод не может быть неэффективным, раз он используется более 50 лет»",
        "textEn": "'This method cannot be ineffective since it has been used for over 50 years'"
    },
    "ct_q21": {
        "text": "Эффект якорения (anchoring bias) — первая информация непропорционально влияет на оценку",
        "textEn": "Anchoring bias — first information disproportionately influences the assessment"
    },
    "ct_q22": {
        "text": "Построение гипотезы на основе неполных данных из-за ограничений рабочей памяти (Миллер)",
        "textEn": "Forming a hypothesis from incomplete data due to working memory limits (Miller)"
    },
    "ct_q24": {
        "text": "Провести A/B-тест с рандомизацией по методу Фишера для исключения систематической ошибки",
        "textEn": "Run a Fisher-randomized A/B test to rule out systematic error in the data"
    },
    "ct_q26": {
        "text": "инвестируем в слишком много проектов одновременно и не можем расставить приоритеты",
        "textEn": "invest in too many projects simultaneously and cannot prioritize effectively"
    },
    "ct_q27": {
        "text": "Критическое мышление требует использования формальной логики и силлогизмов Аристотеля",
        "textEn": "Critical thinking requires the use of formal logic and Aristotelian syllogisms"
    },
    "ct_q28": {
        "text": "SWOT-анализ: оценить Strengths, Weaknesses, Opportunities и Threats стратегии",
        "textEn": "SWOT analysis: evaluate the strategy's Strengths, Weaknesses, Opportunities and Threats"
    },
    "ct_q29": {
        "text": "Оценить индекс цитирования (h-index) автора через Google Scholar",
        "textEn": "Evaluate the author's citation index (h-index) through Google Scholar"
    },
    "ct_q30": {
        "text": "нашего предыдущего опыта с похожими ситуациями (эвристика доступности Тверски)",
        "textEn": "our previous experience with similar situations (Tversky's availability heuristic)"
    },
    "ct_q31": {
        "text": "Консенсус экспертного сообщества, подтверждённый мета-анализами и систематическими обзорами",
        "textEn": "Expert community consensus confirmed by meta-analyses and systematic reviews"
    },
    "ct_q32": {
        "text": "участники используют System 1 мышление (по Канеману) вместо System 2 для экономии энергии",
        "textEn": "members use System 1 thinking (per Kahneman) instead of System 2 to conserve energy"
    },
    "ct_q33": {
        "text": "«Модель генерировала ответ с высоким confidence score (>0.95)?»",
        "textEn": "'Did the model generate the answer with a high confidence score (>0.95)?'"
    },

    # === EMOTIONAL INTELLIGENCE ===
    "ei_q04": {
        "text": "Презрение (Contempt) — Экман добавил его позже как седьмую базовую эмоцию",
        "textEn": "Contempt — Ekman later added it as the seventh basic universal emotion"
    },
    "ei_q05": {
        "text": "Деперсонализация — ощущение отчуждения от своей личности и диссоциация от роли",
        "textEn": "Depersonalization — feeling alienated from your identity and dissociation from role"
    },
    "ei_q06": {
        "text": "Рационализируешь эмоции, переводя их в когнитивные схемы по модели Бека",
        "textEn": "Rationalize emotions by converting them into cognitive schemas per Beck's model"
    },
    "ei_q12": {
        "text": "Social Skills — организуй командный воркшоп по AI, чтобы снять страх через коллективный опыт",
        "textEn": "Social Skills — organize a team AI workshop to reduce fear through collective experience"
    },
    "ei_q15": {
        "text": "Self-regulation — без управления импульсами все остальные навыки бесполезны",
        "textEn": "Self-regulation — without managing impulses all other EQ skills are useless"
    },
    "ei_b04": {
        "text": "Способность к рефлексии и самоанализу (интроспекция по модели метакогниции)",
        "textEn": "Capacity for reflection and self-analysis (introspection per metacognition model)"
    },
    "ei_b05": {
        "text": "Избирательная абстракция — фокус на одной негативной детали при игнорировании контекста",
        "textEn": "Selective abstraction — focusing on one negative detail while ignoring the full context"
    },
    "ei_b06": {
        "text": "Стресс, прокрастинация и синдром самозванца (по Клэнс и Аймс)",
        "textEn": "Stress, procrastination, and impostor syndrome (per Clance and Imes)"
    },
    "ei_b07": {
        "text": "Способность зеркально отражать эмоции другого через микровыражения лица (по Экману)",
        "textEn": "Ability to mirror another's emotions through facial micro-expressions (per Ekman)"
    },
    "ei_b09": {
        "text": "Техника когнитивной перестройки мыслей из негативных в позитивные по модели CBT Бека",
        "textEn": "A cognitive restructuring technique converting negative thoughts to positive ones per Beck's CBT"
    },
    "ei_b15": {
        "text": "Уровень эмоциональной стабильности (низкий нейротизм в Big Five)",
        "textEn": "Level of emotional stability (low neuroticism score in the Big Five)"
    },
    "ei_b17": {
        "text": "Несоответствие ценностей сотрудника и компании по модели Person-Organization Fit",
        "textEn": "Mismatch between employee and company values per the Person-Organization Fit model"
    },
    "ei_nq04": {
        "text": "Использовать технику «рефрейминга» — превратить негативную ситуацию в возможность для роста",
        "textEn": "Use the 'reframing' technique — turn a negative situation into a growth opportunity"
    },
    "ei_q14": {
        "text": "Использовать рефлексивное слушание по модели Карла Роджерса для выбора реакции",
        "textEn": "Use reflective listening per Carl Rogers' model to choose the appropriate response"
    },
    "ei_b01": {
        "text": "Empathy — эмпатия является основным инструментом построения любых отношений",
        "textEn": "Empathy — empathy is the primary tool for building any type of relationship"
    },
    "ei_b02": {
        "text": "Префронтальная кора активирует режим deep work, блокируя эмоциональные отвлечения",
        "textEn": "The prefrontal cortex activates deep work mode, blocking emotional distractions"
    },
    "ei_b03": {
        "text": "Применять когнитивную переоценку (reappraisal) по модели Гросса для смены фрейма эмоции",
        "textEn": "Apply cognitive reappraisal per Gross's model to reframe the emotional experience"
    },
    "ei_b08": {
        "text": "Оценить свой тип личности по MBTI для понимания предпочтений в принятии решений",
        "textEn": "Assess your personality type via MBTI to understand decision-making preferences"
    },
    "ei_b10": {
        "text": "Автоматическое приписывание негативных намерений другим (ошибка атрибуции по Россу)",
        "textEn": "Automatically attributing negative intentions to others (Ross's attribution error)"
    },
    "ei_b11": {
        "text": "Требует обязательного физического контакта (прикосновения) для активации зеркальных нейронов",
        "textEn": "Requires physical contact (touch) to activate mirror neurons for empathic response"
    },

    # === LEADERSHIP ===
    "ld_q02": {
        "text": "Развивать эмоциональный интеллект команды через групповой коучинг по модели Гоулмана",
        "textEn": "Develop the team's emotional intelligence through group coaching per Goleman's model"
    },
    "ld_q04": {
        "text": "Who — с кем они работают, какие люди в команде и как они взаимодействуют",
        "textEn": "Who — who they work with, what people are on the team and how they interact"
    },
    "ld_q05": {
        "text": "Coaching — объяснять логику и развивать мышление через сократические вопросы",
        "textEn": "Coaching — explain logic and develop thinking through Socratic questioning method"
    },
    "ld_q06": {
        "text": "Создать AI Center of Excellence (CoE) с формальной сертификацией по уровням",
        "textEn": "Create an AI Center of Excellence (CoE) with formal certification by proficiency levels"
    },
    "ld_b01": {
        "text": "Низкой компетенцией, но с высоким потенциалом роста (по оценке 9-Box Grid)",
        "textEn": "Low competence but high growth potential (per the 9-Box Grid assessment)"
    },
    "ld_b02": {
        "text": "Выстраивать горизонтальные связи через кросс-функциональные OKR по методу Дорра",
        "textEn": "Build horizontal connections through cross-functional OKRs per Doerr's methodology"
    },
    "ld_b04": {
        "text": "Амбициозными, но достижимыми (по принципу stretch goals Локка-Латхэма)",
        "textEn": "Ambitious but achievable (per Locke-Latham's stretch goals principle)"
    },
    "ld_b05": {
        "text": "Использует Agile-коучинг с фокусом на ретроспективы по Scrum Guide",
        "textEn": "Uses Agile coaching with a focus on retrospectives per the Scrum Guide"
    },
    "ld_b06": {
        "text": "Стейкхолдерам, спонсору проекта и комитету по этике AI организации",
        "textEn": "To stakeholders, project sponsor, and the organization's AI ethics committee"
    },
    "ld_b08": {
        "text": "Отсутствие формализованной системы грейдов и карьерных треков в компании",
        "textEn": "Lack of a formalized grading system and career tracks within the company"
    },
    "ld_b19": {
        "text": "Проводить 360-градусную обратную связь по стандарту CCL (Center for Creative Leadership)",
        "textEn": "Conduct 360-degree feedback per the CCL (Center for Creative Leadership) standard"
    },
    "ld_q07": {
        "text": "Transformational лидер — вдохновляет через харизму и интеллектуальную стимуляцию по Бассу",
        "textEn": "Transformational leader — inspires through charisma and intellectual stimulation per Bass"
    },
    "ld_q13": {
        "text": "Внедрить Objectives and Key Results (OKR) для привязки целей к измеримым результатам",
        "textEn": "Implement Objectives and Key Results (OKR) to tie goals to measurable outcomes"
    },
    "ld_q15": {
        "text": "Использовать матрицу Эйзенхауэра для приоритизации задач по срочности и важности",
        "textEn": "Use Eisenhower's matrix to prioritize tasks by urgency and importance"
    },
    "ld_b03": {
        "text": "Применять модель DISC для адаптации стиля коммуникации к типу личности сотрудника",
        "textEn": "Apply the DISC model to adapt communication style to the employee's personality type"
    },
    "ld_b07": {
        "text": "Строить кросс-функциональные команды по модели Spotify Squads для повышения автономии",
        "textEn": "Build cross-functional teams using the Spotify Squad model to increase autonomy"
    },
    "ld_b09": {
        "text": "Использовать модель RACI для формализации зон ответственности в матричной структуре",
        "textEn": "Use the RACI model to formalize accountability zones within a matrix structure"
    },
    "ld_b10": {
        "text": "Проводить еженедельные 1-on-1 по шаблону Manager Tools с фокусом на обратную связь",
        "textEn": "Conduct weekly 1-on-1s using the Manager Tools template with a focus on feedback"
    },
    "ld_b11": {
        "text": "Культура «психологического владения» (psychological ownership) по модели Пирса",
        "textEn": "A culture of 'psychological ownership' per Pierce's organizational behavior model"
    },
    "ld_b12": {
        "text": "Транзакционное лидерство — система чётких вознаграждений за достижение KPI",
        "textEn": "Transactional leadership — a clear reward system for achieving KPI targets"
    },

    # === PROBLEM-SOLVING / PRESENTATION (pt_*) ===
    "pt_q01": {
        "text": "Иррациональная настойчивость (escalation of commitment) — увеличение вложений при неудаче",
        "textEn": "Irrational persistence (escalation of commitment) — increasing investment upon failure"
    },
    "pt_q02": {
        "text": "Метод «5 Почему» Тойоты — итеративный поиск первопричины через цепочку вопросов",
        "textEn": "Toyota's '5 Whys' method — iterative root cause search through a chain of questions"
    },
    "pt_q03": {
        "text": "Анализ решения по матрице Пью для взвешенного сравнения альтернатив",
        "textEn": "Analyze the decision using a Pugh matrix for weighted comparison of alternatives"
    },
    "pt_q16": {
        "text": "Метод «6 шляп мышления» Де Боно — анализ с разных перспектив для полноты картины",
        "textEn": "De Bono's '6 Thinking Hats' method — analyzing from different perspectives for completeness"
    },
    "pt_q17": {
        "text": "Отсутствие Design Thinking подхода: empathize-define-ideate-prototype-test",
        "textEn": "Absence of Design Thinking approach: empathize-define-ideate-prototype-test"
    },
    "pt_q18": {
        "text": "Метод TRIZ (теория решения изобретательских задач) Альтшуллера для системных противоречий",
        "textEn": "Altshuller's TRIZ method (theory of inventive problem solving) for systemic contradictions"
    },
    "pt_q19": {
        "text": "Применить Cynefin-фреймворк Сноудена для классификации типа проблемы перед выбором подхода",
        "textEn": "Apply Snowden's Cynefin framework to classify the problem type before choosing an approach"
    },
    "pt_q20": {
        "text": "Построить дерево проблем (problem tree) по методологии логического фреймворка (LogFrame)",
        "textEn": "Build a problem tree using the Logical Framework (LogFrame) methodology approach"
    },
    "pt_q21": {
        "text": "Использовать эвристику Полья: понять задачу, составить план, выполнить, проверить",
        "textEn": "Use Polya's heuristic: understand the problem, make a plan, execute, and review"
    },
    "pt_q22": {
        "text": "Проблема требует agile-подхода: запустить MVP и итерировать на основе обратной связи",
        "textEn": "The problem needs an agile approach: launch an MVP and iterate based on feedback"
    },
    "pt_q25": {
        "text": "Применить метод «обратного мозгового штурма» — сначала ухудшить, потом инвертировать",
        "textEn": "Apply 'reverse brainstorming' — first make it worse, then invert the solutions"
    },
    "pt_q26": {
        "text": "Метод «анализ разрывов» (gap analysis) — сравнение текущего и целевого состояния по KPI",
        "textEn": "Gap analysis method — comparing current vs. target state using KPI measurements"
    },
    "pt_q27": {
        "text": "Использовать диаграмму Исикавы (рыбья кость) для визуализации корневых причин по категориям",
        "textEn": "Use an Ishikawa (fishbone) diagram to visualize root causes organized by category"
    },
    "pt_q28": {
        "text": "Запустить цикл PDCA (Plan-Do-Check-Act) Деминга для непрерывного улучшения процесса",
        "textEn": "Launch a Deming PDCA (Plan-Do-Check-Act) cycle for continuous process improvement"
    },
    "pt_q29": {
        "text": "Провести PESTEL-анализ для оценки макрофакторов, влияющих на проблему",
        "textEn": "Conduct a PESTEL analysis to assess macro-factors impacting the problem"
    },
    "pt_q30": {
        "text": "Использовать матрицу приоритизации MoSCoW (Must, Should, Could, Won't) для ранжирования решений",
        "textEn": "Use MoSCoW prioritization (Must, Should, Could, Won't) to rank possible solutions"
    },
    "pt_q33": {
        "text": "Нанять внешнего консультанта для проведения аудита процессов по стандарту ISO 9001",
        "textEn": "Hire an external consultant to audit processes per the ISO 9001 standard"
    },
    "pt_q36": {
        "text": "Построить модель Monte Carlo для симуляции всех возможных исходов решения",
        "textEn": "Build a Monte Carlo simulation model to evaluate all possible decision outcomes"
    },
    "pt_q37": {
        "text": "Использовать фреймворк RICE (Reach, Impact, Confidence, Effort) для скоринга решений",
        "textEn": "Use the RICE framework (Reach, Impact, Confidence, Effort) for scoring solutions"
    },
    "pt_q38": {
        "text": "Применить теорию ограничений Голдратта (TOC) для поиска узкого места в процессе",
        "textEn": "Apply Goldratt's Theory of Constraints (TOC) to find the process bottleneck"
    },

    # === SELF-ORGANIZATION (so_*) ===
    "so_q03": {
        "text": "Использовать метод Bullet Journal (BuJo) для аналоговой системы продуктивности",
        "textEn": "Use the Bullet Journal (BuJo) method for an analog productivity system"
    },
    "so_q04": {
        "text": "Применить метод «канбан-поток» по модели Андерсона для визуализации WIP-лимитов",
        "textEn": "Apply Anderson's Kanban flow model to visualize work-in-progress (WIP) limits"
    },
    "so_q05": {
        "text": "Метод Agile Results (J.D. Meier) — «правило трёх» для дня, недели и месяца",
        "textEn": "Agile Results method (J.D. Meier) — the 'rule of three' for day, week, and month"
    },
}

def add_traps(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    added = 0
    skipped = 0

    for qid, trap in TRAPS.items():
        # Find the question block and its options closing bracket
        # Pattern: find the question by ID, then find its options array closing "]"
        # We need to insert the new option before the closing "]" of the options array

        # First, check if the question already has option "e"
        # Find the position of this question's id
        id_pattern = f'"id": "{qid}"'
        id_pos = content.find(id_pattern)
        if id_pos == -1:
            print(f"WARNING: Question {qid} not found!")
            skipped += 1
            continue

        # Find the next question's id (or end of array) to bound our search
        next_id_pos = content.find('"id":', id_pos + len(id_pattern))
        if next_id_pos == -1:
            next_id_pos = len(content)

        block = content[id_pos:next_id_pos]

        if '"key": "e"' in block:
            print(f"SKIP: {qid} already has option 'e'")
            skipped += 1
            continue

        # Find the last option "d" closing brace within this block, then the "]" after it
        # We look for the pattern: closing of option d "}" followed by newline and spaces and "]"
        # The options array looks like:
        #     {
        #       "key": "d",
        #       "text": "...",
        #       "textEn": "..."
        #     }
        #   ],

        # Find "key": "d" within the block
        d_key_pos_in_block = block.find('"key": "d"')
        if d_key_pos_in_block == -1:
            print(f"WARNING: {qid} has no option 'd'!")
            skipped += 1
            continue

        # From option d's key, find its closing brace "}"
        d_closing_brace_in_block = block.find('}', d_key_pos_in_block)
        if d_closing_brace_in_block == -1:
            print(f"WARNING: {qid} cannot find closing brace for option d!")
            skipped += 1
            continue

        # After the closing brace, find the "]" that closes the options array
        options_close_in_block = block.find(']', d_closing_brace_in_block)
        if options_close_in_block == -1:
            print(f"WARNING: {qid} cannot find options array close!")
            skipped += 1
            continue

        # Calculate the absolute position
        abs_d_closing = id_pos + d_closing_brace_in_block

        # Determine indentation by looking at the "key": "d" line
        # Find the line start before "key": "d"
        abs_d_key = id_pos + d_key_pos_in_block
        line_start = content.rfind('\n', 0, abs_d_key) + 1
        d_key_line = content[line_start:abs_d_key]
        indent = d_key_line  # This is the whitespace before "key": "d"

        # Build the new option
        new_option = ',\n'
        new_option += indent.rstrip('"') + '{\n'  # Same indent as opening brace of option d
        # Look at actual structure - the option block looks like:
        #       {
        #         "key": "d",
        #         "text": "...",
        #         "textEn": "..."
        #       }
        # The indent for the opening { is 6 spaces, and key/text are 8 spaces

        # Let's detect the actual indentation from the file
        # Find the "{" before "key": "d"
        d_brace_pos_in_block = block.rfind('{', 0, d_key_pos_in_block)
        abs_d_brace = id_pos + d_brace_pos_in_block
        brace_line_start = content.rfind('\n', 0, abs_d_brace) + 1
        brace_indent = content[brace_line_start:abs_d_brace]

        # And the indent for properties inside the option
        prop_indent = content[line_start:abs_d_key][:content[line_start:abs_d_key].find('"')]

        # Build properly indented option
        escaped_text = trap["text"].replace('"', '\\"')
        escaped_text_en = trap["textEn"].replace('"', '\\"')

        new_option = f',\n{brace_indent}{{\n{prop_indent}"key": "e",\n{prop_indent}"text": "{escaped_text}",\n{prop_indent}"textEn": "{escaped_text_en}"\n{brace_indent}}}'

        # Insert after the closing brace of option d
        content = content[:abs_d_closing + 1] + new_option + content[abs_d_closing + 1:]

        added += 1
        print(f"ADDED: {qid}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"\nDone! Added: {added}, Skipped: {skipped}")
    return added, skipped

if __name__ == "__main__":
    add_traps("/Users/vova/Documents/soft-skills-check/src/lib/quiz-pool.ts")
