// components/SurahList.tsx - FIXED
"use client";
import { useState, useEffect, useMemo } from "react";
import { quranService } from "@/utils/quranService";
import { QuranSurah } from "@/utils/types/quran";

interface SurahListProps {
  onSelectSurah: (surah: QuranSurah) => void;
}

export default function SurahList({ onSelectSurah }: SurahListProps) {
  const [surahs, setSurahs] = useState<QuranSurah[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      setLoading(true);
      const allSurahs = quranService.getAllSurahs();
      setSurahs(allSurahs);

      // Debug log to check data structure
      if (process.env.NODE_ENV === "development") {
        console.log("Sample surah data:", allSurahs[0]);
        const validation = quranService.validateSurahData();
        console.log("Data validation:", validation);
      }
    } catch (error) {
      console.error("Error loading surahs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized filtered surahs for better performance
  const filteredSurahs = useMemo(() => {
    if (!searchTerm.trim()) {
      return surahs;
    }

    try {
      return quranService.searchSurahs(searchTerm);
    } catch (error) {
      console.error("Error filtering surahs:", error);
      // Fallback to simple filtering
      return surahs.filter((surah) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (surah.transliteration &&
            surah.transliteration.toLowerCase().includes(searchLower)) ||
          (surah.name && surah.name.includes(searchTerm)) ||
          surah.id.toString().includes(searchTerm)
        );
      });
    }
  }, [searchTerm, surahs]);

  // Safe display helper functions
  const getSurahName = (surah: any): string => {
    return surah.transliteration || surah.nameEnglish || `Surah ${surah.id}`;
  };

  const getSurahTranslation = (surah: any): string => {
    return (
      surah.translation || surah.nameEnglish || "Translation not available"
    );
  };

  const getSurahArabicName = (surah: QuranSurah): string => {
    return surah.name || "";
  };

  const getSurahType = (surah: QuranSurah): string => {
    return surah.type || "Unknown";
  };

  const getVerseCount = (surah: QuranSurah): number => {
    return surah.total_verses || surah.verses?.length || 0;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-pulse text-gray-600 dark:text-gray-300">
            سورے لوڈ ہو رہے ہیں...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white flex items-center justify-center gap-2">
        📚 سورہ فہرست
      </h2>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="سورہ تلاش کریں... (نام، نمبر، یا انگریزی نام)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ textAlign: "right" }}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>

        {/* Search results count */}
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            {filteredSurahs.length} سورے ملے
            {filteredSurahs.length === 0 && (
              <span className="text-red-500"> - کوئی نتیجہ نہیں ملا</span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurahs.map((surah: any) => (
          <button
            key={surah.id}
            onClick={() => onSelectSurah(surah)}
            className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-200 text-right group"
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="font-semibold text-lg group-hover:text-white">
                  {getSurahName(surah)}
                </div>
                <div className="text-sm opacity-75 group-hover:text-white/80">
                  {getVerseCount(surah)} آیات
                </div>
                <div className="text-xs opacity-60 group-hover:text-white/60 capitalize">
                  {getSurahType(surah)}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-xl font-bold mb-1"
                  style={{
                    fontFamily: "Arial, sans-serif",
                    direction: "rtl",
                  }}
                >
                  {getSurahArabicName(surah)}
                </div>
                <div className="text-sm bg-green-100 group-hover:bg-white/20 text-green-600 group-hover:text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {surah.id}
                </div>
              </div>
            </div>

            {/* Show translation on hover or for search results */}
            {/* {(searchTerm || process.env.NODE_ENV === "development") && (
              <div className="mt-2 text-xs text-gray-500 group-hover:text-white/70 text-center">
                {getSurahTranslation(surah)}
              </div>
            )} */}
          </button>
        ))}
      </div>

      {/* No results message */}
      {filteredSurahs.length === 0 && searchTerm && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-6 p-8">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-lg mb-2">کوئی سورہ نہیں ملا</p>
          <p className="text-sm">کوشش کریں:</p>
          <ul className="text-sm mt-2 space-y-1">
            <li>• سورہ کا نام (جیسے: فاتحہ، بقرہ)</li>
            <li>• سورہ نمبر (جیسے: 1, 2, 3)</li>
            <li>• انگریزی نام (جیسے: Fatiha, Baqarah)</li>
          </ul>
        </div>
      )}

      {/* Debug info in development */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs">
          <strong>Debug Info:</strong> Total Surahs: {surahs.length}, Filtered: {filteredSurahs.length}
        </div>
      )} */}
    </div>
  );
}
