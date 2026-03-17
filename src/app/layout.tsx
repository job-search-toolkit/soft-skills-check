import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Soft Skills Check — Тренажёр soft skills",
  description:
    "Пойми себя лучше. 30 вопросов, AI-анализ, персональный план роста. Бесплатный open-source тренажёр.",
  openGraph: {
    title: "Тренажёр soft skills — пойми себя и расти",
    description:
      "Бесплатный AI-тренажёр: 30 вопросов, персональный анализ, план роста. Open source.",
    type: "website",
    url: "https://soft-skills.chillai.space",
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
