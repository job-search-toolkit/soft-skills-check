"use client";

import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { ui } from "@/lib/i18n";

export default function Home() {
  const { lang } = useLang();
  const t = ui[lang];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-16 animate-fade-in-up">
        <div className="inline-block px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-6">
          {t.landingBadge}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {t.landingTitle1}
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            {t.landingTitle2}
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          {t.landingSubtitle}
        </p>
        <Link
          href="/context"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-105"
        >
          {t.landingCta}
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>

      {/* How it works */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          {
            step: t.landingStep01,
            title: t.landingStep01Title,
            description: t.landingStep01Desc,
          },
          {
            step: t.landingStep02,
            title: t.landingStep02Title,
            description: t.landingStep02Desc,
          },
          {
            step: t.landingStep03,
            title: t.landingStep03Title,
            description: t.landingStep03Desc,
          },
        ].map((item) => (
          <div
            key={item.step}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
          >
            <span className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
              {item.step}
            </span>
            <h3 className="text-lg font-semibold text-slate-100 mt-3 mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Dimensions preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-semibold text-slate-100 mb-6">
          {t.landingDimensionsTitle}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: "\uD83D\uDD0D",
              name: t.landingDimCritical,
              desc: t.landingDimCriticalDesc,
            },
            {
              icon: "\uD83D\uDCAC",
              name: t.landingDimComm,
              desc: t.landingDimCommDesc,
            },
            {
              icon: "\u26A1",
              name: t.landingDimAdapt,
              desc: t.landingDimAdaptDesc,
            },
            {
              icon: "\uD83D\uDCCB",
              name: t.landingDimOrg,
              desc: t.landingDimOrgDesc,
            },
            {
              icon: "\uD83C\uDFAF",
              name: t.landingDimProduct,
              desc: t.landingDimProductDesc,
            },
            {
              icon: "\uD83E\uDD1D",
              name: t.landingDimCollab,
              desc: t.landingDimCollabDesc,
            },
            {
              icon: "\uD83D\uDE80",
              name: t.landingDimLeadership,
              desc: t.landingDimLeadershipDesc,
            },
            {
              icon: "\uD83E\uDDD1\u200D\u2696\uFE0F",
              name: t.landingDimConflict,
              desc: t.landingDimConflictDesc,
            },
            {
              icon: "\uD83D\uDCA1",
              name: t.landingDimEI,
              desc: t.landingDimEIDesc,
            },
            {
              icon: "\u23F1\uFE0F",
              name: t.landingDimTime,
              desc: t.landingDimTimeDesc,
            },
          ].map((dim) => (
            <div
              key={dim.name}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50"
            >
              <span className="text-xl mt-0.5">{dim.icon}</span>
              <div>
                <div className="font-medium text-slate-200 text-sm">
                  {dim.name}
                </div>
                <div className="text-xs text-slate-500">{dim.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-slate-500 text-sm mb-4">
          {t.landingFooterNote}
        </p>
        <Link
          href="/context"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors border border-slate-700"
        >
          {t.landingFooterCta}
        </Link>
      </div>
    </div>
  );
}
