"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LangContext";
import { ui } from "@/lib/i18n";

type Tab = "upload" | "paste";

export default function ContextPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = ui[lang];
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore context from sessionStorage if returning to this page
  useEffect(() => {
    const stored = sessionStorage.getItem("assessment_context");
    if (stored) {
      try {
        const ctx = JSON.parse(stored);
        if (ctx.resume) setResumeText(ctx.resume);
        if (ctx.jobDescription) setJobDescription(ctx.jobDescription);
      } catch {
        // ignore
      }
    }
  }, []);

  const extractTextFromPdf = useCallback(async (file: File) => {
    setParsing(true);
    setParseError(null);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: unknown) => (item as { str: string }).str)
          .join(" ");
        pages.push(pageText);
      }

      const fullText = pages.join("\n\n").trim();
      if (!fullText) {
        setParseError(t.contextPdfEmpty);
        setActiveTab("paste");
      } else {
        setResumeText(fullText);
        setFileName(file.name);
      }
    } catch (err) {
      console.error("PDF parse error:", err);
      setParseError(t.contextPdfError);
      setActiveTab("paste");
    } finally {
      setParsing(false);
    }
  }, [t]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type === "application/pdf") {
        extractTextFromPdf(file);
      } else {
        setParseError(t.contextPdfWrongType);
      }
    },
    [extractTextFromPdf, t]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        extractTextFromPdf(file);
      }
    },
    [extractTextFromPdf]
  );

  const handleContinue = () => {
    const context = {
      resume: resumeText.trim() || undefined,
      jobDescription: jobDescription.trim() || undefined,
    };
    sessionStorage.setItem("assessment_context", JSON.stringify(context));
    router.push("/test");
  };

  const handleSkip = () => {
    // Clear any previous context
    sessionStorage.removeItem("assessment_context");
    router.push("/test");
  };

  const hasResume = resumeText.trim().length > 0;
  const hasJob = jobDescription.trim().length > 0;
  const hasAnyContext = hasResume || hasJob;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 animate-fade-in-up">
        <div className="inline-block px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-4">
          {t.contextBadge}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t.contextTitle}
        </h1>
        <p className="text-slate-400 leading-relaxed">
          {t.contextSubtitle}
        </p>
      </div>

      {/* Resume section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-4">
          {t.contextResumeTitle}
        </h2>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1 mb-6 max-w-sm">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "upload"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            {t.contextTabUpload}
          </button>
          <button
            onClick={() => setActiveTab("paste")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "paste"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            {t.contextTabPaste}
          </button>
        </div>

        {activeTab === "upload" && (
          <div>
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? "border-violet-500 bg-violet-500/5"
                  : fileName
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-slate-700 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {parsing ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3 animate-pulse">
                    <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-300">{t.contextParsing}</p>
                </div>
              ) : fileName ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-white font-medium mb-1">{fileName}</p>
                  <p className="text-xs text-slate-400">
                    {resumeText.length} {t.contextCharsExtracted}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-300 mb-1">
                    {t.contextDropHint}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.contextDropNote}
                  </p>
                </div>
              )}
            </div>

            {parseError && (
              <div className="mt-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                {parseError}
              </div>
            )}
          </div>
        )}

        {activeTab === "paste" && (
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder={t.contextPasteHint}
            className="w-full h-48 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 resize-y transition-colors"
          />
        )}

        {hasResume && activeTab === "paste" && (
          <p className="mt-2 text-xs text-slate-500">
            {resumeText.trim().length} {t.contextChars}
          </p>
        )}
      </div>

      {/* Job description section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-2">
          {t.contextJobTitle}
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          {t.contextJobNote}
        </p>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder={t.contextJobPlaceholder}
          className="w-full h-36 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 resize-y transition-colors"
        />
        {hasJob && (
          <p className="mt-2 text-xs text-slate-500">
            {jobDescription.trim().length} {t.contextChars}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
        <button
          onClick={handleContinue}
          disabled={!hasAnyContext}
          className={`inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all duration-200 ${
            hasAnyContext
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-105"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          {t.contextContinue}
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
        </button>
        <button
          onClick={handleSkip}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors border border-slate-700"
        >
          {t.contextSkip}
        </button>
      </div>
    </div>
  );
}
