"use client";

import { useLang } from "@/lib/LangContext";

export default function StatsPage() {
  const { lang } = useLang();
  const isRu = lang === "ru";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {isRu ? "Мы не показываем рейтинги" : "We don't show leaderboards"}
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          {isRu ? "И это осознанное решение." : "And that's a deliberate choice."}
        </p>
      </div>

      <div className="space-y-6 animate-fade-in-up">
        {/* Why */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            {isRu ? "Почему нет «писькомерок»" : "Why no rankings"}
          </h2>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>
              {isRu
                ? "Мы сделали этот сайт для людей, которые пришли развиваться. Не для тех, у кого и так всё хорошо — им рейтинги не нужны. А для тех, кто хочет расти."
                : "We built this site for people who came to grow. Not for those who are already doing great — they don't need rankings. But for those who want to improve."}
            </p>
            <p>
              {isRu
                ? "Публичные рейтинги и сравнения мотивируют тех, кто наверху. Но демотивируют тех, кто пришёл учиться — а именно им мы хотим помочь больше всего."
                : "Public rankings and comparisons motivate those at the top. But they demotivate those who came to learn — and those are the people we want to help most."}
            </p>
          </div>
        </div>

        {/* Research */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            {isRu ? "Что говорит наука" : "What the research says"}
          </h2>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>
              {isRu
                ? "Систематический обзор 2024 года (Li et al., опубликован в Journal of Computer Assisted Learning) проанализировал исследования эффекта лидербордов на обучение. Результат:"
                : "A 2024 systematic review (Li et al., published in the Journal of Computer Assisted Learning) analyzed research on the effect of leaderboards on learning. The finding:"}
            </p>
            <blockquote className="border-l-2 border-violet-500/50 pl-4 py-1 text-slate-400 italic">
              {isRu
                ? "Лидерборды мотивируют лучших, но активно демотивируют людей с низкой конкурентностью. Теория социального сравнения объясняет: люди, которые видят себя внизу рейтинга, теряют мотивацию вместо того, чтобы усиливать её."
                : "Leaderboards motivate high-performers but actively demotivate people with low trait competitiveness. Social Comparison Theory explains: people who see themselves at the bottom of a ranking lose motivation instead of gaining it."}
            </blockquote>
            <p className="text-xs text-slate-500">
              Li et al. (2024). &ldquo;Leaderboards in education: A double-edged sword.&rdquo; <a href="https://onlinelibrary.wiley.com/doi/10.1111/jcal.13077" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">Journal of Computer Assisted Learning</a>
            </p>
          </div>
        </div>

        {/* Privacy promise */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-semibold text-green-300 mb-4">
            {isRu ? "Наши обещания" : "Our promises"}
          </h2>
          <div className="space-y-3">
            {[
              isRu ? "Ваши результаты видны только вам" : "Your results are visible only to you",
              isRu ? "Никаких публичных рейтингов, таблиц, сравнений" : "No public rankings, tables, or comparisons",
              isRu ? "Данные хранятся только в вашем браузере — мы не собираем персональную статистику" : "Data stays in your browser — we don't collect personal statistics",
              isRu ? "Если вы делитесь профилем — это ваш выбор, и ссылка анонимна" : "If you share your profile — it's your choice, and the link is anonymous",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What we show instead */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            {isRu ? "Что мы показываем вместо рейтингов" : "What we show instead of rankings"}
          </h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <span className="text-violet-400 font-bold mt-0.5">1</span>
              <p>{isRu ? "Ваш личный прогресс — как вы выросли по сравнению с собой вчерашним" : "Your personal progress — how you've grown compared to your past self"}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-violet-400 font-bold mt-0.5">2</span>
              <p>{isRu ? "Анонимные средние показатели — чтобы понимать контекст, без имён" : "Anonymous averages — for context, without names"}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-violet-400 font-bold mt-0.5">3</span>
              <p>{isRu ? "Конкретные области для роста — не «ты хуже других», а «вот что читать дальше»" : "Specific growth areas — not 'you're worse than others' but 'here's what to study next'"}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <p className="text-slate-500 text-sm mb-4">
            {isRu
              ? "Здесь нет соревнования. Есть только ваш путь."
              : "There's no competition here. Only your journey."}
          </p>
          <a
            href="/context"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20"
          >
            {isRu ? "Начать свой путь" : "Start your journey"}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
