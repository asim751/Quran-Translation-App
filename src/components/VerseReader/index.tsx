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
  const [isHeaderCompact, setIsHeaderCompact] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const { updatePosition, markSurahComplete } = useReadingProgress();

  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle scroll for header state and progress
  useEffect(() => {
    let lastScrollY = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Calculate scroll progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(Math.max(scrollPercent, 0), 100));

      // Header state logic
      if (currentScrollY > 150) {
        setIsHeaderCompact(true);
      } else {
        setIsHeaderCompact(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
        rootMargin: "-100px 0px -100px 0px",
      }
    );

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

  // Jump to specific verse from progress bar
  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progressPercent = (clickX / rect.width) * 100;
    const targetVerse = Math.ceil((progressPercent / 100) * verses.length);

    const verseElement =
      verseRefs.current[Math.max(1, Math.min(targetVerse, verses.length))];
    if (verseElement) {
      verseElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  // Navigate to previous/next verse
  const navigateVerse = (direction: "prev" | "next") => {
    const newVerse =
      direction === "prev"
        ? Math.max(1, currentVerse - 1)
        : Math.min(verses.length, currentVerse + 1);

    const verseElement = verseRefs.current[newVerse];
    if (verseElement) {
      verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
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
    <div className="relative">
      {/* Single Unified Sticky Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-600 transition-all duration-300">
        <div className="container mx-auto px-4">
          {/* Compact Header (When Scrolled) */}
          {isHeaderCompact ? (
            <div className="py-3">
              {/* Main Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onBack}
                    className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-1"
                  >
                    ← واپس
                  </button>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {surah.transliteration}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    آیت {currentVerse}/{verses.length} •{" "}
                    {Math.round((currentVerse / verses.length) * 100)}%
                  </div>

                  <button
                    onClick={() => setIsHeaderCompact(false)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    title="مکمل کنٹرولز دکھائیں"
                  >
                    ⬇️
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateVerse("prev")}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="پچھلی آیت"
                  disabled={currentVerse <= 1}
                >
                  ⬅️
                </button>

                <div className="flex-1">
                  <div
                    className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 cursor-pointer relative overflow-hidden group hover:h-3 transition-all duration-200"
                    onClick={handleProgressClick}
                    title="کلک کرکے کسی آیت پر جائیں"
                  >
                    {/* Verse Progress */}
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 relative"
                      style={{
                        width: `${(currentVerse / verses.length) * 100}%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white opacity-20 animate-pulse rounded-full"></div>
                    </div>

                    {/* Scroll Progress Overlay */}
                    <div
                      className="absolute top-0 left-0 h-full bg-green-400 opacity-40 rounded-full transition-all duration-100"
                      style={{ width: `${scrollProgress}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => navigateVerse("next")}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="اگلی آیت"
                  disabled={currentVerse >= verses.length}
                >
                  ➡️
                </button>
              </div>
            </div>
          ) : (
            /* Full Header (When at Top or Expanded) */
            <div className="py-4 space-y-4">
              {/* Main Controls Row */}
              <div className="flex justify-between items-center flex-wrap gap-4">
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
                      {surah.translation} - {surah.type} • {surah.total_verses}{" "}
                      آیات
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

                  {/* Minimize Button */}
                  <button
                    onClick={() => setIsHeaderCompact(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    title="چھوٹا کریں"
                  >
                    ⬆️
                  </button>
                </div>
              </div>

              {/* Full Progress Section */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    فی الوقت پڑھ رہے ہیں: آیت {currentVerse}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {Math.round((currentVerse / verses.length) * 100)}% مکمل
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigateVerse("prev")}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="پچھلی آیت"
                    disabled={currentVerse <= 1}
                  >
                    ⬅️
                  </button>

                  <div className="flex-1">
                    <div
                      className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 cursor-pointer relative overflow-hidden group hover:h-4 transition-all duration-200"
                      onClick={handleProgressClick}
                      title="کلک کرکے کسی آیت پر جائیں"
                    >
                      {/* Verse Progress */}
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 relative"
                        style={{
                          width: `${(currentVerse / verses.length) * 100}%`,
                        }}
                      >
                        <div className="absolute inset-0 bg-white opacity-20 animate-pulse rounded-full"></div>
                      </div>

                      {/* Scroll Progress Overlay */}
                      <div
                        className="absolute top-0 left-0 h-full bg-green-400 opacity-40 rounded-full transition-all duration-100"
                        style={{ width: `${scrollProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigateVerse("next")}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="اگلی آیت"
                    disabled={currentVerse >= verses.length}
                  >
                    ➡️
                  </button>
                </div>

                {/* Progress Legend */}
                <div className="flex justify-between items-center text-xs mt-2 text-gray-500 dark:text-gray-400">
                  <span>🔵 آیت کی پیشقدمی</span>
                  <span>🟢 صفحہ کی پیشقدمی</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Floating Buttons */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col gap-2">
          {/* Scroll to Top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            title="اوپر جائیں"
          >
            ⬆️
          </button>

          {/* Back to Home (Quick) */}
          <button
            onClick={onBack}
            className="w-12 h-12 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
            title="ہوم پیج"
          >
            🏠
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 min-h-screen">
        <div className="container mx-auto px-4 py-6">
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
      </div>
    </div>
  );
}
