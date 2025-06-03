"use client";
import { useState, useEffect, useRef } from "react";
import { QuranSurah } from "@/utils/types/quran";
import { quranService } from "@/utils/quranService";
import LazyVerse from "../LazyVerse";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { readingProgressService } from "@/utils/readingProgressService";

interface VerseReaderProps {
  surah: QuranSurah;
  onBack: () => void;
  startFromVerse?: number;
}

export default function VerseReader({
  surah,
  onBack,
  startFromVerse = 1,
}: VerseReaderProps) {
  const [fontSize, setFontSize] = useState<number>(16);
  const [verses, setVerses] = useState<
    Array<{
      arabic: string;
      verseNumber: number;
    }>
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentVerse, setCurrentVerse] = useState<number>(startFromVerse);
  const { updatePosition, markSurahComplete } = useReadingProgress();

  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

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

  // Set up intersection observer to track reading progress
  useEffect(() => {
    if (loading || verses.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const verseNumber = parseInt(
              entry.target.getAttribute("data-verse") || "0"
            );
            if (verseNumber > 0) {
              setCurrentVerse(verseNumber);
              updatePosition(surah.id, verseNumber);
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-50px 0px -50px 0px",
      }
    );

    // Observe all verse elements
    Object.values(verseRefs.current).forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, verses, surah.id, updatePosition]);

  // Scroll to specific verse
  useEffect(() => {
    if (!loading && startFromVerse > 1) {
      const timer = setTimeout(() => {
        const verseElement = verseRefs.current[startFromVerse];
        if (verseElement) {
          verseElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [loading, startFromVerse]);

  // Handle surah completion
  const handleMarkComplete = () => {
    if (confirm("کیا آپ نے یہ سورہ مکمل پڑھ لیا ہے؟")) {
      markSurahComplete(surah.id);
      alert("🎉 مبارک ہو! سورہ مکمل ہو گیا۔");
    }
  };

  // Add bookmark function
  const handleAddBookmark = (verseNumber: number) => {
    const verse = verses.find((v) => v.verseNumber === verseNumber);
    if (verse) {
      const note = prompt("اس آیت کے لیے کوئی نوٹ لکھیں (اختیاری):");
      readingProgressService.addBookmark(
        surah.id,
        verseNumber,
        surah.transliteration,
        verse.arabic,
        note || undefined
      );
      alert("📌 بک مارک محفوظ ہو گیا!");
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
            {startFromVerse > 1 && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                آیت {startFromVerse} سے شروع کر رہے ہیں
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
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

          {/* Mark Complete Button */}
          <button
            onClick={handleMarkComplete}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            ✅ مکمل
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            فی الوقت پڑھ رہے ہیں: آیت {currentVerse}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            {Math.round((currentVerse / verses.length) * 100)}% مکمل
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentVerse / verses.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-6">
        {verses.map((verse, index) => (
          <div
            key={verse.verseNumber}
            ref={(el) => (verseRefs.current[verse.verseNumber] = el) as any}
            data-verse={verse.verseNumber}
            className={`transition-all duration-300 ${
              currentVerse === verse.verseNumber
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : ""
            }`}
          >
            <LazyVerse
              surahNumber={surah.id}
              verseNumber={verse.verseNumber}
              arabicText={verse.arabic}
              verseIndex={verse.verseNumber}
              fontSize={fontSize}
              isVisible={true}
              onBookmark={() => handleAddBookmark(verse.verseNumber)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
