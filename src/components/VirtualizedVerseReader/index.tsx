"use client";
import { useState, useEffect, useMemo, RefObject } from "react";
import { QuranSurah } from "@/utils/types/quran";
import { quranService } from "@/utils/quranService";

import LazyVerse from "../LazyVerse";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface VirtualizedVerseReaderProps {
  surah: QuranSurah;
  onBack: () => void;
}

const ITEMS_PER_PAGE = 20;

export default function VirtualizedVerseReader({
  surah,
  onBack,
}: VirtualizedVerseReaderProps) {
  const [fontSize, setFontSize] = useState<number>(16);
  const [verses, setVerses] = useState<
    Array<{
      arabic: string;
      verseNumber: number;
    }>
  >([]);
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: ITEMS_PER_PAGE,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const { isVisible: loadMoreVisible, elementRef: loadMoreRef } =
    useIntersectionObserver({
      threshold: 0.1,
      rootMargin: "100px",
    });

  useEffect(() => {
    const loadVerses = async () => {
      try {
        setLoading(true);

        const surahData = quranService.getSurahById(surah.id);
        if (surahData && surahData.verses) {
          const verseData = surahData.verses.map((verse, index) => ({
            arabic: verse.text,
            verseNumber: index + 1,
          }));

          setVerses(verseData);
        }
      } catch (error) {
        console.error("Error loading verses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVerses();
  }, [surah]);

  // Load more verses when scroll indicator is visible
  useEffect(() => {
    if (loadMoreVisible && visibleRange.end < verses.length) {
      setVisibleRange((prev) => ({
        ...prev,
        end: Math.min(prev.end + ITEMS_PER_PAGE, verses.length),
      }));
    }
  }, [loadMoreVisible, verses.length, visibleRange.end]);

  const visibleVerses = useMemo(() => {
    return verses.slice(visibleRange.start, visibleRange.end);
  }, [verses, visibleRange]);

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

      {/* Progress indicator */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {visibleRange.end} میں سے {verses.length} آیات دکھائی جا رہی ہیں
      </div>

      <div className="space-y-6">
        {visibleVerses.map((verse, index) => (
          <LazyVerse
            key={verse.verseNumber}
            surahNumber={surah.id}
            verseNumber={verse.verseNumber}
            arabicText={verse.arabic}
            verseIndex={verse.verseNumber}
            fontSize={fontSize}
            isVisible={true}
          />
        ))}
      </div>

      {/* Load more indicator */}
      {visibleRange.end < verses.length && (
        <div
          ref={loadMoreRef as RefObject<HTMLDivElement>}
          className="text-center py-8"
        >
          <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>مزید آیات لوڈ ہو رہی ہیں...</span>
          </div>
        </div>
      )}

      {visibleRange.end >= verses.length && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          ✅ تمام آیات مکمل ہو گئیں
        </div>
      )}
    </div>
  );
}
