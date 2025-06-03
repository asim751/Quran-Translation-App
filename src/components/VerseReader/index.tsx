"use client";
import { useState, useEffect } from "react";
import { QuranSurah, DailyVerseData } from "../../utils/types/quran";
import { quranService } from "@/utils/quranService";

interface VerseReaderProps {
  surah: QuranSurah;
  onBack: () => void;
}

export default function VerseReader({ surah, onBack }: VerseReaderProps) {
  const [fontSize, setFontSize] = useState<number>(16);
  const [verses, setVerses] = useState<DailyVerseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  useEffect(() => {
    const loadVerses = async () => {
      try {
        setLoading(true);
        setLoadingProgress(0);

        const verseData = await quranService.getAllVersesForSurah(surah.id);
        setVerses(verseData);
      } catch (error) {
        console.error("Error loading verses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVerses();
  }, [surah]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-pulse text-gray-600 dark:text-gray-300 mb-4">
            {surah.transliteration} کی آیات لوڈ ہو رہی ہیں...
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {Math.round(loadingProgress)}% مکمل
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← واپس
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {surah.transliteration}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {surah.translation} - {surah.type} • {surah.total_verses} آیات
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
          <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            خط کا سائز:
          </label>
          <input
            type="range"
            min="12"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300 font-bold min-w-[40px]">
            {fontSize}px
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {verses.map((verse, index) => (
          <div
            key={index}
            className="border-b-2 border-gray-100 dark:border-gray-600 pb-6 hover:bg-gray-50 dark:hover:bg-gray-700 p-4 rounded-lg transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1">
                🔢 آیت {verse.verseIndex}
              </span>
            </div>

            <div
              className="mb-4 text-gray-800 dark:text-white font-semibold leading-loose bg-blue-50 dark:bg-gray-600 p-4 rounded-lg border-r-4 border-blue-400"
              style={{
                fontSize: `${fontSize + 4}px`,
                direction: "rtl",
                fontFamily: "Arial, sans-serif",
                textAlign: "right",
              }}
            >
              {verse.arabic}
            </div>

            <div
              className="text-gray-700 dark:text-gray-300 leading-relaxed bg-green-50 dark:bg-gray-600 p-4 rounded-lg border-r-4 border-green-400"
              style={{
                fontSize: `${fontSize}px`,
                direction: "rtl",
                textAlign: "right",
                fontFamily: "Noto Nastaliq Urdu, Arial, sans-serif",
              }}
            >
              {verse.urdu}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
