import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Soft Skills Check — soft skills для эпохи AI",
  description:
    "AI становится частью каждого бизнеса. Пойми, какие человеческие навыки тебе усилить. 10 тем, AI-анализ, персональный план роста.",
  openGraph: {
    title: "Soft skills для эпохи AI — бесплатный тренажёр",
    description:
      "Технические навыки уже не отличают — отличают человеческие. 10 тем, AI-анализ, план роста. Open source.",
    type: "website",
    url: "https://soft-skills.transformerinstitute.org",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-950 text-slate-200 antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-slate-800/50 py-6">
              <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-600">
                Open source project. MIT License.
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
