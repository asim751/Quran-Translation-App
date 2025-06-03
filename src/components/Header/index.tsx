"use client";
import { useState, useEffect } from "react";
import { QuranSurah } from "@/utils/types/quran";
import NotificationButton from "../NotificationButton";

interface HeaderProps {
  currentView: "home" | "surah" | "daily" | "progress";
  setCurrentView: (view: "home" | "surah" | "daily" | "progress") => void;
  selectedSurah: QuranSurah | null;
}

export default function Header({
  currentView,
  setCurrentView,
  selectedSurah,
}: HeaderProps) {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const isDark =
      localStorage.getItem("darkMode") === "true" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b-2 border-green-500">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView("home")}
              className="text-2xl font-bold text-green-600 hover:text-yellow-500 transition-colors flex items-center gap-2"
            >
              📖 قرآن ریڈر
            </button>

            {currentView === "surah" && selectedSurah && (
              <div className="hidden md:block">
                <span className="text-lg text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                  {selectedSurah.transliteration} - {selectedSurah.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView("daily")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              آج کی آیت
            </button>

            <button
              onClick={() => setCurrentView("progress")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              📊 پیش قدمی
            </button>

            {/* Use the new NotificationButton component */}
            <NotificationButton />

            <button
              onClick={toggleDarkMode}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Mobile view for surah name */}
        {currentView === "surah" && selectedSurah && (
          <div className="md:hidden mt-3">
            <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
              {selectedSurah.transliteration} - {selectedSurah.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
