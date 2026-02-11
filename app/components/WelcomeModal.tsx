"use client";

import { useState } from "react";
import { Lang, translations } from "@/lib/i18n";

interface WelcomeModalProps {
  onStart: (lang: Lang) => void;
}

export default function WelcomeModal({ onStart }: WelcomeModalProps) {
  const [lang, setLang] = useState<Lang>("fr");
  const tr = translations[lang];

  return (
    <div className="modal-overlay">
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {tr.welcomeTitle}
        </h2>

        <p className="text-gray-700 text-sm mb-4 leading-relaxed">
          {tr.welcomeIntro}
        </p>

        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          {tr.welcomeHowTitle}
        </h3>
        <ol className="text-sm text-gray-700 space-y-2 mb-5 list-decimal list-inside">
          <li>{tr.welcomeStep1}</li>
          <li>{tr.welcomeStep2}</li>
          <li>{tr.welcomeStep3}</li>
          <li>{tr.welcomeStep4}</li>
        </ol>

        {/* Language selection */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {tr.welcomeLangQuestion}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border-2 transition-colors ${
                lang === "fr"
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
              }`}
            >
              Francais
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border-2 transition-colors ${
                lang === "en"
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
              }`}
            >
              English
            </button>
          </div>
        </div>

        <button
          onClick={() => onStart(lang)}
          className="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold text-sm"
        >
          {tr.welcomeStart}
        </button>
      </div>
    </div>
  );
}
