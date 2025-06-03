"use client";
import { useState, useEffect, useRef } from "react";
import { lazyTranslationService } from "@/utils/lazyTranslationService";

interface LazyVerseProps {
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  verseIndex: number;
  fontSize: number;
  isVisible?: boolean;
  onBookmark?: () => void;
}

export default function LazyVerse({
  surahNumber,
  verseNumber,
  arabicText,
  verseIndex,
  fontSize,
  isVisible = true,
  onBookmark,
}: LazyVerseProps) {
  const [translationState, setTranslationState] = useState(() =>
    lazyTranslationService.getTranslationState(surahNumber, verseNumber)
  );
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = lazyTranslationService.subscribe(
      surahNumber,
      verseNumber,
      setTranslationState
    );

    return unsubscribe;
  }, [surahNumber, verseNumber]);

  useEffect(() => {
    if (isVisible && !hasStartedLoading && !translationState.loaded) {
      setHasStartedLoading(true);
      lazyTranslationService.loadTranslation(surahNumber, verseNumber);
    }
  }, [
    isVisible,
    hasStartedLoading,
    translationState.loaded,
    surahNumber,
    verseNumber,
  ]);

  const handleRetryTranslation = () => {
    setHasStartedLoading(true);
    lazyTranslationService.loadTranslation(surahNumber, verseNumber);
  };

  return (
    <div
      ref={elementRef}
      className="border-b-2 border-gray-100 dark:border-gray-600 pb-6 hover:bg-gray-50 dark:hover:bg-gray-700 p-4 rounded-lg transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1">
          🔢 آیت {verseIndex}
        </span>

        <div className="flex items-center gap-2">
          {translationState.loading && (
            <div className="flex items-center gap-2 text-blue-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">لوڈ ہو رہا ہے...</span>
            </div>
          )}

          {onBookmark && (
            <button
              onClick={onBookmark}
              className="text-gray-500 hover:text-blue-500 transition-colors"
              title="بک مارک کریں"
            >
              📌
            </button>
          )}
        </div>
      </div>

      {/* Arabic Text */}
      <div
        className="mb-4 text-gray-800 dark:text-white font-semibold leading-loose bg-blue-50 dark:bg-gray-600 p-4 rounded-lg border-r-4 border-blue-400"
        style={{
          fontSize: `${fontSize + 4}px`,
          direction: "rtl",
          fontFamily: "Arial, sans-serif",
          textAlign: "right",
        }}
      >
        {arabicText}
      </div>

      {/* Urdu Translation */}
      <div
        className={`text-gray-700 dark:text-gray-300 leading-relaxed p-4 rounded-lg border-r-4 transition-all duration-300 ${
          translationState.loading
            ? "bg-gray-50 dark:bg-gray-700 border-gray-300 animate-pulse"
            : translationState.error
            ? "bg-red-50 dark:bg-red-900/20 border-red-400"
            : "bg-green-50 dark:bg-gray-600 border-green-400"
        }`}
        style={{
          fontSize: `${fontSize}px`,
          direction: "rtl",
          textAlign: "right",
          fontFamily: "Noto Nastaliq Urdu, Arial, sans-serif",
        }}
      >
        {translationState.loading ? (
          <div className="flex items-center justify-end gap-2">
            <span>اردو ترجمہ لوڈ ہو رہا ہے</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        ) : translationState.error ? (
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-2">
              ترجمہ لوڈ کرنے میں خرابی
            </p>
            <button
              onClick={handleRetryTranslation}
              className="text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
            >
              دوبارہ کوشش کریں
            </button>
          </div>
        ) : (
          translationState.text
        )}
      </div>
    </div>
  );
}
