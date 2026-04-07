"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../lib/LangContext";
import { ui } from "../../lib/i18n";
import { dimensionMap } from "../../lib/questions";
import { DimensionKey } from "@/types/assessment";

interface ExchangeOffer {
  id: string;
  profileHash: string;
  strongTopics: string[];
  wantTopics: string[];
  format: "text" | "video" | "any";
  lang: string;
  message: string;
  createdAt: string;
  active: boolean;
}

function TopicTag({ topic, variant, lang }: { topic: string; variant: "strong" | "want"; lang: string }) {
  const dim = dimensionMap[topic as DimensionKey];
  const name = lang === "ru" ? dim?.name || topic : dim?.nameEn || topic;
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        variant === "strong"
          ? "bg-green-500/10 text-green-400 border border-green-500/20"
          : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
      }`}
    >
      {name}
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

export default function ExchangePage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = ui[lang];

  const [offers, setOffers] = useState<ExchangeOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedEmails, setRevealedEmails] = useState<Record<string, string>>({});
  const [myProfileHash, setMyProfileHash] = useState<string | null>(null);
  const [myStrongTopics, setMyStrongTopics] = useState<string[]>([]);
  const [myWantTopics, setMyWantTopics] = useState<string[]>([]);
  const [myExchangeId, setMyExchangeId] = useState<string | null>(null);
  const [filterTopic, setFilterTopic] = useState<string | null>(null);

  useEffect(() => {
    // Load user's profile for matching
    const hash = sessionStorage.getItem("profile_hash");
    if (hash) setMyProfileHash(hash);

    const analysisRaw = sessionStorage.getItem("analysisResult");
    if (analysisRaw) {
      try {
        const analysis = JSON.parse(analysisRaw);
        if (analysis.dimensionScores) {
          const sorted = [...analysis.dimensionScores].sort((a: { score: number }, b: { score: number }) => b.score - a.score);
          setMyStrongTopics(sorted.slice(0, 3).map((d: { dimension: string }) => d.dimension));
          setMyWantTopics(sorted.slice(-3).map((d: { dimension: string }) => d.dimension));
        }
      } catch { /* ignore */ }
    }

    // Fetch offers
    fetch("/api/exchange")
      .then((res) => res.json())
      .then((data) => {
        setOffers(data.offers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Check if user has own offer
  useEffect(() => {
    if (!myProfileHash) return;
    const own = offers.find((o) => o.profileHash === myProfileHash);
    if (own) setMyExchangeId(own.id);
  }, [offers, myProfileHash]);

  const handleRevealEmail = async (offerId: string) => {
    if (revealedEmails[offerId]) return;
    try {
      const res = await fetch(`/api/exchange/${offerId}`);
      if (res.ok) {
        const data = await res.json();
        setRevealedEmails((prev) => ({ ...prev, [offerId]: data.contactEmail }));
      }
    } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    if (!myExchangeId || !myProfileHash) return;
    try {
      await fetch(`/api/exchange/${myExchangeId}?profileHash=${myProfileHash}`, { method: "DELETE" });
      setOffers((prev) => prev.filter((o) => o.id !== myExchangeId));
      setMyExchangeId(null);
    } catch { /* ignore */ }
  };

  // Sort by match quality
  const sortedOffers = useMemo(() => {
    let filtered = offers;
    if (filterTopic) {
      filtered = offers.filter(
        (o) => o.strongTopics.includes(filterTopic) || o.wantTopics.includes(filterTopic)
      );
    }

    if (!myStrongTopics.length && !myWantTopics.length) return filtered;

    return [...filtered].sort((a, b) => {
      const scoreA =
        a.strongTopics.filter((t) => myWantTopics.includes(t)).length +
        a.wantTopics.filter((t) => myStrongTopics.includes(t)).length;
      const scoreB =
        b.strongTopics.filter((t) => myWantTopics.includes(t)).length +
        b.wantTopics.filter((t) => myStrongTopics.includes(t)).length;
      return scoreB - scoreA;
    });
  }, [offers, myStrongTopics, myWantTopics, filterTopic]);

  const isGoodMatch = (offer: ExchangeOffer) => {
    if (!myStrongTopics.length || !myWantTopics.length) return false;
    const theyHelpMe = offer.strongTopics.some((t) => myWantTopics.includes(t));
    const iHelpThem = offer.wantTopics.some((t) => myStrongTopics.includes(t));
    return theyHelpMe && iHelpThem;
  };

  // All unique topics across offers for filter
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    offers.forEach((o) => {
      o.strongTopics.forEach((t) => set.add(t));
      o.wantTopics.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [offers]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="inline-block px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-4">
          {t.exchangeTitle}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t.exchangeTitle}
        </h1>
        <p className="text-slate-400">{t.exchangeSubtitle}</p>
      </div>

      {/* Your skills summary */}
      {myStrongTopics.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-1.5">{t.exchangeYourStrong}</p>
              <div className="flex flex-wrap gap-1.5">
                {myStrongTopics.map((topic) => (
                  <TopicTag key={topic} topic={topic} variant="strong" lang={lang} />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-1.5">{t.exchangeYourWeak}</p>
              <div className="flex flex-wrap gap-1.5">
                {myWantTopics.map((topic) => (
                  <TopicTag key={topic} topic={topic} variant="want" lang={lang} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up">
        {!myExchangeId ? (
          <button
            onClick={() => router.push("/exchange/new")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20"
          >
            {t.exchangeCtaOffer}
          </button>
        ) : (
          <button
            onClick={handleDelete}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-colors border border-red-500/20"
          >
            {t.exchangeDelete}
          </button>
        )}
      </div>

      {/* Topic filter */}
      {allTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6 animate-fade-in-up">
          <button
            onClick={() => setFilterTopic(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !filterTopic ? "bg-violet-500/20 text-violet-300 border border-violet-500/50" : "bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300"
            }`}
          >
            {lang === "ru" ? "Все" : "All"}
          </button>
          {allTopics.map((topic) => {
            const dim = dimensionMap[topic as DimensionKey];
            const name = lang === "ru" ? dim?.name || topic : dim?.nameEn || topic;
            return (
              <button
                key={topic}
                onClick={() => setFilterTopic(filterTopic === topic ? null : topic)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterTopic === topic ? "bg-violet-500/20 text-violet-300 border border-violet-500/50" : "bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      {/* Offers list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm">{lang === "ru" ? "Загружаем..." : "Loading..."}</p>
        </div>
      ) : sortedOffers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">{t.exchangeEmpty}</p>
          <button
            onClick={() => router.push("/exchange/new")}
            className="text-violet-400 hover:text-violet-300 text-sm underline underline-offset-2 transition-colors"
          >
            {t.exchangeCtaOffer}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in-up">
          {sortedOffers.map((offer) => {
            const match = isGoodMatch(offer);
            const isOwn = offer.profileHash === myProfileHash;
            const emailRevealed = revealedEmails[offer.id];

            return (
              <div
                key={offer.id}
                className={`bg-slate-900 border rounded-2xl p-5 transition-colors ${
                  match ? "border-violet-500/30 bg-violet-500/5" : isOwn ? "border-green-500/30" : "border-slate-800"
                }`}
              >
                {/* Match / Own badge */}
                <div className="flex items-center gap-2 mb-3">
                  {match && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {t.exchangeGoodMatch}
                    </span>
                  )}
                  {isOwn && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                      {lang === "ru" ? "Моё предложение" : "Your offer"}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-600 ml-auto">{formatDate(offer.createdAt)}</span>
                </div>

                {/* Topics */}
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{t.exchangeCanHelp}</p>
                    <div className="flex flex-wrap gap-1">
                      {offer.strongTopics.map((topic) => (
                        <TopicTag key={topic} topic={topic} variant="strong" lang={lang} />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{t.exchangeWantsHelp}</p>
                    <div className="flex flex-wrap gap-1">
                      {offer.wantTopics.map((topic) => (
                        <TopicTag key={topic} topic={topic} variant="want" lang={lang} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message */}
                {offer.message && (
                  <p className="text-sm text-slate-400 mb-3 italic">&ldquo;{offer.message}&rdquo;</p>
                )}

                {/* Format + Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">
                    {t.exchangeFormat} {offer.format === "text" ? t.exchangeFormatText : offer.format === "video" ? t.exchangeFormatVideo : t.exchangeFormatAny}
                  </span>
                  <div className="flex items-center gap-3">
                    <a
                      href={`/p/${offer.profileHash}`}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
                    >
                      {t.exchangeViewProfile}
                    </a>
                    {!isOwn && (
                      emailRevealed ? (
                        <a
                          href={`mailto:${emailRevealed}`}
                          className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          {emailRevealed}
                        </a>
                      ) : (
                        <button
                          onClick={() => handleRevealEmail(offer.id)}
                          className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          {t.exchangeContact}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
