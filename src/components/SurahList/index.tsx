"use client";
import { useState, useEffect } from "react";
import { quranService } from "@/utils/quranService";
import { QuranSurah } from "@/utils/types/quran";

interface SurahListProps {
  onSelectSurah: (surah: QuranSurah) => void;
}

export default function SurahList({ onSelectSurah }: SurahListProps) {
  const [surahs, setSurahs] = useState<QuranSurah[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredSurahs, setFilteredSurahs] = useState<QuranSurah[]>([]);

  useEffect(() => {
    const allSurahs = quranService.getAllSurahs();
    setSurahs(allSurahs);
    setFilteredSurahs(allSurahs);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSurahs(surahs);
    } else {
      const filtered = quranService.searchSurahs(searchTerm);
      setFilteredSurahs(filtered);
    }
  }, [searchTerm, surahs]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white flex items-center justify-center gap-2">
        📚 سورہ فہرست
      </h2>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="سورہ تلاش کریں..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          style={{ textAlign: "right" }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurahs.map((surah) => (
          <button
            key={surah.id}
            onClick={() => onSelectSurah(surah)}
            className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-200 text-right group"
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="font-semibold text-lg group-hover:text-white">
                  {surah.transliteration}
                </div>
                <div className="text-sm opacity-75 group-hover:text-white/80">
                  {surah.total_verses} آیات
                </div>
                <div className="text-xs opacity-60 group-hover:text-white/60 capitalize">
                  {surah.type}
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
                  {surah.name}
                </div>
                <div className="text-sm bg-green-100 group-hover:bg-white/20 text-green-600 group-hover:text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {surah.id}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredSurahs.length === 0 && searchTerm && (
        <div className="text-center text-gray-500 mt-6">کوئی سورہ نہیں ملا</div>
      )}
    </div>
  );
}
