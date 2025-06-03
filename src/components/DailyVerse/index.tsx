"use client";
import { useState, useEffect } from "react";

import { quranService } from "@/utils/quranService";
import { DailyVerseData } from "@/utils/types/quran";

interface DailyVerseProps {
  expanded?: boolean;
}

export default function DailyVerse({ expanded = false }: DailyVerseProps) {
  const [dailyVerse, setDailyVerse] = useState<DailyVerseData | null>(null);
  const [verseNumber, setVerseNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDailyVerse = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date();
        const storedVerseNumber = parseInt(
          localStorage.getItem("currentVerseNumber") || "1"
        );
        const lastUpdateDate = localStorage.getItem("lastVerseUpdate");
        const todayString = today.toDateString();

        let currentVerseNumber = storedVerseNumber;

        // Check if we need to move to next verse (once per day)
        if (lastUpdateDate !== todayString) {
          const totalVerses = quranService.getTotalVerses();
          currentVerseNumber =
            storedVerseNumber < totalVerses ? storedVerseNumber + 1 : 1;

          localStorage.setItem(
            "currentVerseNumber",
            currentVerseNumber.toString()
          );
          localStorage.setItem("lastVerseUpdate", todayString);
        }

        setVerseNumber(currentVerseNumber);

        // Get the verse with Urdu translation
        const verse = await quranService.getVerseBySequentialNumber(
          currentVerseNumber
        );
        setDailyVerse(verse);
      } catch (err) {
        console.error("Error loading daily verse:", err);
        setError("آیت لوڈ کرنے میں خرابی");
      } finally {
        setLoading(false);
      }
    };

    initializeDailyVerse();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-green-600 to-blue-500 text-white rounded-lg p-6 text-center">
        <div className="animate-pulse flex items-center justify-center gap-2">
          <div className="w-4 h-4 bg-white/30 rounded-full animate-bounce"></div>
          <div
            className="w-4 h-4 bg-white/30 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-4 h-4 bg-white/30 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <span className="ml-2">آج کی آیت لوڈ ہو رہی ہے...</span>
        </div>
      </div>
    );
  }

  if (error || !dailyVerse) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-6 text-center">
        <div className="mb-2">⚠️ {error || "آیت لوڈ کرنے میں خرابی"}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-sm bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
        >
          دوبارہ کوشش کریں
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-r from-green-600 to-blue-500 text-white rounded-lg p-6 shadow-lg ${
        expanded ? "max-w-4xl mx-auto" : ""
      }`}
    >
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
          🌟 آج کی آیت - {dailyVerse.surahName}
        </h3>
        <p className="text-sm opacity-90 bg-white/20 rounded-full px-4 py-1 inline-block">
          آیت نمبر {verseNumber} - {dailyVerse.surahNameArabic} (
          {dailyVerse.verseIndex})
        </p>
      </div>

      <div className="space-y-4">
        <div
          className="text-xl text-center leading-loose font-semibold bg-white/10 p-4 rounded-lg border-r-4 border-yellow-300"
          style={{
            direction: "rtl",
            fontFamily: "Arial, sans-serif",
            textAlign: "right",
          }}
        >
          {dailyVerse.arabic}
        </div>

        <div
          className="text-lg text-center leading-relaxed bg-white/10 p-4 rounded-lg border-r-4 border-green-300"
          style={{
            direction: "rtl",
            textAlign: "right",
            fontFamily: "Noto Nastaliq Urdu, Arial, sans-serif",
          }}
        >
          {dailyVerse.urdu}
        </div>
      </div>

      {!expanded && (
        <div className="text-center mt-4">
          <p className="text-sm opacity-90 bg-white/20 rounded-lg px-4 py-2 inline-block">
            🔔 روزانہ نئی آیت کے لیے اطلاع فعال کریں
          </p>
        </div>
      )}
    </div>
  );
}
