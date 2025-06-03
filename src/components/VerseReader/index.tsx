"use client";
import { useState, useEffect } from "react";
import { QuranSurah } from "@/utils/types/quran";
import { quranService } from "@/utils/quranService";
import LazyVerse from "../LazyVerse";
import { lazyTranslationService } from "@/utils/lazyTranslationService";

interface VerseReaderProps {
  surah: QuranSurah;
  onBack: () => void;
}

export default function VerseReader({ surah, onBack }: VerseReaderProps) {
  const [fontSize, setFontSize] = useState<number>(16);
  const [verses, setVerses] = useState<
    Array<{
      arabic: string;
      verseNumber: number;
    }>
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [preloadingProgress, setPreloadingProgress] = useState<number>(0);

  useEffect(() => {
    const loadVerses = async () => {
      try {
        setLoading(true);

        // Get Arabic verses from quran-json (fast)
        const surahData = quranService.getSurahById(surah.id);
        if (surahData && surahData.verses) {
          const verseData = surahData.verses.map((verse, index) => ({
            arabic: verse.text,
            verseNumber: index + 1,
          }));

          setVerses(verseData);
          setLoading(false);

          // Start preloading first few translations in background
          const firstFewVerses = verseData.slice(0, 5).map((verse) => ({
            surahNumber: surah.id,
            verseNumber: verse.verseNumber,
          }));

          lazyTranslationService.preloadTranslations(firstFewVerses);
        }
      } catch (error) {
        console.error("Error loading verses:", error);
        setLoading(false);
      }
    };

    loadVerses();
  }, [surah]);

  const handlePreloadAll = async () => {
    const allVerses = verses.map((verse) => ({
      surahNumber: surah.id,
      verseNumber: verse.verseNumber,
    }));

    setPreloadingProgress(0);

    // Preload with progress tracking
    for (let i = 0; i < allVerses.length; i++) {
      await lazyTranslationService.loadTranslation(
        allVerses[i].surahNumber,
        allVerses[i].verseNumber
      );
      setPreloadingProgress(((i + 1) / allVerses.length) * 100);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-pulse text-gray-600 dark:text-gray-300 mb-4">
            {surah.transliteration} لوڈ ہو رہا ہے...
          </div>
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

        <div className="flex items-center gap-4">
          {/* Font Size Control */}
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

          {/* Preload All Button */}
          <button
            onClick={handlePreloadAll}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            disabled={preloadingProgress > 0 && preloadingProgress < 100}
          >
            {preloadingProgress > 0 && preloadingProgress < 100
              ? `${Math.round(preloadingProgress)}% لوڈ ہو رہا ہے`
              : "تمام ترجمے لوڈ کریں"}
          </button>
        </div>
      </div>

      {/* Progress Bar for Preloading */}
      {preloadingProgress > 0 && preloadingProgress < 100 && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${preloadingProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {verses.map((verse, index) => (
          <LazyVerse
            key={index}
            surahNumber={surah.id}
            verseNumber={verse.verseNumber}
            arabicText={verse.arabic}
            verseIndex={verse.verseNumber}
            fontSize={fontSize}
            isVisible={true} // Can be enhanced with intersection observer
          />
        ))}
      </div>
    </div>
  );
}
