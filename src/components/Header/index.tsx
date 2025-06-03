"use client";
import { useState, useEffect } from "react";
import { QuranSurah } from "@/utils/types/quran";

interface HeaderProps {
  currentView: "home" | "surah" | "daily";
  setCurrentView: (view: "home" | "surah" | "daily") => void;
  selectedSurah: QuranSurah | null;
}

export default function Header({
  currentView,
  setCurrentView,
  selectedSurah,
}: HeaderProps) {
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Check if notifications are already enabled
    const enabled = localStorage.getItem("notificationsEnabled") === "true";
    setNotificationsEnabled(enabled);

    // Check dark mode preference
    const isDark =
      localStorage.getItem("darkMode") === "true" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      // Request permission
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
          localStorage.setItem("notificationsEnabled", "true");

          // Register service worker for notifications
          if ("serviceWorker" in navigator) {
            try {
              await navigator.serviceWorker.register("/sw.js");
              scheduleNotification();
            } catch (error) {
              console.error("Service Worker registration failed:", error);
            }
          }

          // Show success message
          new Notification("قرآن ریڈر", {
            body: "روزانہ آیات کی اطلاع فعال ہو گئی! آپ کو ہر دن 8 بجے صبح نئی آیت کی اطلاع ملے گی۔",
            icon: "/icon-192x192.png",
          });
        } else {
          alert("اطلاعات کی اجازت درکار ہے");
        }
      } else {
        alert("آپ کا برائوزر اطلاعات کو سپورٹ نہیں کرتا");
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem("notificationsEnabled", "false");
      alert("روزانہ آیات کی اطلاع بند ہو گئی");
    }
  };

  const scheduleNotification = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0); // 8 AM next day

    const timeUntilNotification = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      if (Notification.permission === "granted") {
        const verseNumber = parseInt(
          localStorage.getItem("currentVerseNumber") || "1"
        );
        new Notification("آج کی آیت - قرآن مجید", {
          body: `آج کی نئی آیت پڑھنے کے لیے ایپ کھولیں (آیت نمبر ${verseNumber})`,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
        });
      }

      // Schedule next notification
      scheduleNotification();
    }, timeUntilNotification);
  };

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
              onClick={handleNotificationToggle}
              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                notificationsEnabled
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {notificationsEnabled
                ? "🔕 اطلاع بند کریں"
                : "🔔 اطلاع فعال کریں"}
            </button>

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
