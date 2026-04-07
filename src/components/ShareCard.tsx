"use client";

import { useRef, useState } from "react";
import { useLang } from "@/lib/LangContext";
import { ui } from "@/lib/i18n";

interface ShareCardProps {
  label: { name: string; desc: string; emoji: string; id: string };
  rarity: number;
  overallScore: number;
  dimensionScores: { dimension: string; name: string; score: number }[];
  topDimensions: string[];
}

export default function ShareCard({
  label,
  rarity,
  overallScore,
  dimensionScores,
  topDimensions,
}: ShareCardProps) {
  const { lang } = useLang();
  const t = ui[lang];
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const sorted = [...dimensionScores].sort((a, b) => b.score - a.score);

  const downloadCard = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);

    try {
      // Dynamic import to keep bundle small
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0f172a",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `soft-skills-${label.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Fallback: copy text
      const text = [
        `${label.emoji} ${label.name}`,
        label.desc,
        "",
        `Score: ${overallScore}/5`,
        ...sorted.map((d) => `${d.name}: ${d.score}/5`),
        "",
        "soft-skills.transformerinstitute.org",
      ].join("\n");
      await navigator.clipboard.writeText(text);
    }
    setDownloading(false);
  };

  const shareCard = async () => {
    if (navigator.share) {
      const text = [
        `${label.emoji} ${label.name} — ${label.desc}`,
        `${t.resultsOverallLabel} ${overallScore}/5`,
        "",
        `${t.profileRarity} ${rarity}% ${t.profileRarityOf}`,
        "",
        "https://soft-skills.transformerinstitute.org",
      ].join("\n");
      try {
        await navigator.share({ title: t.shareTitle, text });
      } catch {
        // user cancelled
      }
    } else {
      const text = `${label.emoji} ${label.name} — ${overallScore}/5`;
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent("https://soft-skills.transformerinstitute.org")}&text=${encodeURIComponent(text)}`,
        "_blank"
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* The card itself */}
      <div
        ref={cardRef}
        className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-6 md:p-8 overflow-hidden relative"
      >
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Label */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{label.emoji}</div>
            <h3 className="text-2xl font-bold text-white mb-1">{label.name}</h3>
            <p className="text-slate-400 text-sm">{label.desc}</p>
          </div>

          {/* Score + Rarity */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {overallScore}
                <span className="text-lg text-slate-500">/5</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{t.resultsOverallLabel}</div>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-400">
                {rarity}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t.profileRarity}
              </div>
            </div>
          </div>

          {/* Top skills mini bars */}
          <div className="space-y-2">
            {sorted.slice(0, 5).map((dim) => (
              <div key={dim.dimension} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-28 truncate text-right">
                  {dim.name}
                </span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(dim.score / 5) * 100}%`,
                      background: topDimensions.includes(dim.dimension)
                        ? "linear-gradient(to right, #8b5cf6, #6366f1)"
                        : "#475569",
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8">
                  {dim.score}
                </span>
              </div>
            ))}
          </div>

          {/* Branding */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[8px] font-bold">
              S
            </div>
            <span className="text-[10px] text-slate-600">
              soft-skills.transformerinstitute.org
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={downloadCard}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {downloading
            ? "..."
            : t.downloadCard}
        </button>
        <button
          onClick={shareCard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {t.shareCard}
        </button>
      </div>
    </div>
  );
}
