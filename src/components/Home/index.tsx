"use client";
import { useState } from "react";
import Header from "../Header";
import SurahList from "../SurahList";
import VerseReader from "../VerseReader";
import DailyVerse from "../DailyVerse";
import ContinueReading from "../ContinueReading";
import ReadingStats from "../ReadingStats";
import Bookmarks from "../Bookmarks";
import ReadingHistory from "../ReadingHistory";
import { QuranSurah } from "@/utils/types/quran";
import { quranService } from "@/utils/quranService";

export default function Home() {
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
  const [currentView, setCurrentView] = useState<
    "home" | "surah" | "daily" | "progress"
  >("home");
  const [startFromVerse, setStartFromVerse] = useState<number>(1);

  const handleContinueReading = (surahId: number, verseId: number) => {
    const surah = quranService.getSurahById(surahId);
    if (surah) {
      setSelectedSurah(surah);
      setStartFromVerse(verseId);
      setCurrentView("surah");
    }
  };

  const handleNavigateToVerse = (surahId: number, verseId: number) => {
    const surah = quranService.getSurahById(surahId);
    if (surah) {
      setSelectedSurah(surah);
      setStartFromVerse(verseId);
      setCurrentView("surah");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedSurah={selectedSurah}
      />

      <main className="container mx-auto px-4 py-6">
        {currentView === "home" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center gap-3">
                📖 قرآن مجید
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 rounded-lg px-6 py-3 inline-block">
                اردو ترجمے کے ساتھ قرآن پاک پڑھیں
              </p>
            </div>

            {/* Continue Reading Section */}
            <ContinueReading onContinue={handleContinueReading} />

            {/* Daily Verse */}
            <DailyVerse />

            {/* Reading Stats */}
            <ReadingStats />

            {/* Surah List */}
            <SurahList
              onSelectSurah={(surah) => {
                setSelectedSurah(surah);
                setStartFromVerse(1);
                setCurrentView("surah");
              }}
            />
          </div>
        )}

        {currentView === "surah" && selectedSurah && (
          <VerseReader
            surah={selectedSurah}
            startFromVerse={startFromVerse}
            onBack={() => {
              setCurrentView("home");
              setStartFromVerse(1);
            }}
          />
        )}

        {currentView === "daily" && (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentView("home")}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← ہوم پیج
            </button>
            <DailyVerse expanded={true} />
          </div>
        )}

        {currentView === "progress" && (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentView("home")}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← ہوم پیج
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ReadingStats />
                <ReadingHistory />
              </div>
              <div>
                <Bookmarks onNavigateToVerse={handleNavigateToVerse} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
