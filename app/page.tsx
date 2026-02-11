"use client";

import { useState, useEffect } from "react";
import Flag from "./components/Flag";
import WelcomeModal from "./components/WelcomeModal";
import { Lang, t } from "@/lib/i18n";

export default function Home() {
  const [lang, setLang] = useState<Lang>("fr");
  const [showWelcome, setShowWelcome] = useState(true);

  // Restore language preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("flag-lang");
    if (saved === "fr" || saved === "en") {
      setLang(saved);
      setShowWelcome(false);
    }
  }, []);

  const handleStart = (chosenLang: Lang) => {
    setLang(chosenLang);
    localStorage.setItem("flag-lang", chosenLang);
    setShowWelcome(false);
  };

  const toggleLang = () => {
    const newLang = lang === "fr" ? "en" : "fr";
    setLang(newLang);
    localStorage.setItem("flag-lang", newLang);
  };

  const tr = t(lang);

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <header className="text-center py-2 px-4 shrink-0 relative">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {tr.title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">{tr.subtitle}</p>
        <button
          onClick={toggleLang}
          className="absolute top-2 right-4 px-2 py-1 text-xs font-semibold bg-gray-200 hover:bg-gray-300 rounded-md transition-colors text-gray-700"
          title={lang === "fr" ? "Switch to English" : "Passer en francais"}
        >
          {lang === "fr" ? "EN" : "FR"}
        </button>
      </header>
      <main className="flex-1 min-h-0 px-2 pb-2 sm:px-4 sm:pb-4">
        <Flag lang={lang} />
      </main>

      {showWelcome && <WelcomeModal onStart={handleStart} />}
    </div>
  );
}
