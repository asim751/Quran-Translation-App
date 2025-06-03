"use client";
import { useState, useEffect } from "react";
import { quranService } from "@/utils/quranService";
import { lazyTranslationService } from "@/utils/lazyTranslationService";
import { useNotifications } from "@/hooks/useNotifications";

interface DailyVerseEnhancedProps {
  expanded?: boolean;
}

export default function DailyVerse({
  expanded = false,
}: DailyVerseEnhancedProps) {
  const [verseData, setVerseData] = useState<any>(null);
  const [translationState, setTranslationState] = useState({
    loading: false,
    loaded: false,
    error: null as string | null,
    text: "",
  });
  const [verseNumber, setVerseNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  const { isEnabled, enableNotifications, permission } = useNotifications();

  useEffect(() => {
    // Show notification prompt if user hasn't enabled notifications
    if (!isEnabled && permission !== "denied") {
      const lastPrompt = localStorage.getItem("last_notification_prompt");
      const today = new Date().toDateString();

      if (lastPrompt !== today) {
        setTimeout(() => {
          setShowNotificationPrompt(true);
          localStorage.setItem("last_notification_prompt", today);
        }, 3000); // Show after 3 seconds
      }
    }
  }, [isEnabled, permission]);

  useEffect(() => {
    const initializeDailyVerse = async () => {
      try {
        setLoading(true);

        const today = new Date();
        const storedVerseNumber = parseInt(
          localStorage.getItem("currentVerseNumber") || "1"
        );
        const lastUpdateDate = localStorage.getItem("lastVerseUpdate");
        const todayString = today.toDateString();

        let currentVerseNumber = storedVerseNumber;

        if (lastUpdateDate !== todayString) {
          const totalVerses = quranService.getTotalVerses();
          currentVerseNumber =
            storedVerseNumber < totalVerses ? storedVerseNumber + 1 : 1;

          localStorage.setItem(
            "currentVerseNumber",
            currentVerseNumber.toString()
          );
          localStorage.setItem("lastVerseUpdate", todayString);
        }

        setVerseNumber(currentVerseNumber);

        const verse = await quranService.getVerseBySequentialNumber(
          currentVerseNumber
        );

        if (verse) {
          setVerseData({
            arabic: verse.arabic,
            surahNumber: verse.surahNumber,
            verseNumber: verse.verseIndex,
            surahName: verse.surahName,
            surahNameArabic: verse.surahNameArabic,
            verseIndex: verse.verseIndex,
          });

          const currentState = lazyTranslationService.getTranslationState(
            verse.surahNumber,
            verse.verseIndex
          );
          setTranslationState(currentState);

          if (!currentState.loaded && !currentState.loading) {
            lazyTranslationService.loadTranslation(
              verse.surahNumber,
              verse.verseIndex
            );
          }

          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading daily verse:", err);
        setLoading(false);
      }
    };

    initializeDailyVerse();
  }, []);

  useEffect(() => {
    if (!verseData) return;

    const unsubscribe = lazyTranslationService.subscribe(
      verseData.surahNumber,
      verseData.verseIndex,
      (newState: any) => {
        setTranslationState(newState);
      }
    );

    return unsubscribe;
  }, [verseData]);

  const handleEnableNotifications = async () => {
    const success = await enableNotifications();
    if (success) {
      setShowNotificationPrompt(false);
      // Show success message
      setTimeout(() => {
        alert("🎉 بہترین! اب آپ کو ہر دن 8 بجے صبح نئی آیت کی اطلاع ملے گی۔");
      }, 500);
    }
  };

  const handleDismissPrompt = () => {
    setShowNotificationPrompt(false);
    localStorage.setItem("notification_prompt_dismissed", "true");
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-green-600 to-blue-500 text-white rounded-lg p-6 text-center">
        <div className="animate-pulse flex items-center justify-center gap-2">
          <div className="w-4 h-4 bg-white/30 rounded-full animate-bounce"></div>
          <div
            className="w-4 h-4 bg-white/30 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-4 h-4 bg-white/30 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <span className="ml-2">آج کی آیت لوڈ ہو رہی ہے...</span>
        </div>
      </div>
    );
  }

  if (!verseData) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-6 text-center">
        <div className="mb-2">⚠️ آیت لوڈ کرنے میں خرابی</div>
        <button
          onClick={() => window.location.reload()}
          className="text-sm bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
        >
          دوبارہ کوشش کریں
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Notification Prompt Modal */}
      {showNotificationPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                روزانہ آیات کی اطلاع
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                کیا آپ چاہتے ہیں کہ ہم آپ کو ہر دن 8 بجے صبح نئی آیت کی اطلاع
                دیں؟
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleEnableNotifications}
                  className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  ہاں، فعال کریں
                </button>
                <button
                  onClick={handleDismissPrompt}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  بعد میں
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Verse Component */}
      <div
        className={`bg-gradient-to-r from-green-600 to-blue-500 text-white rounded-lg p-6 shadow-lg ${
          expanded ? "max-w-4xl mx-auto" : ""
        }`}
      >
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
            🌟 آج کی آیت - {verseData.surahName}
          </h3>
          <p className="text-sm opacity-90 bg-white/20 rounded-full px-4 py-1 inline-block">
            آیت نمبر {verseNumber} - {verseData.surahNameArabic} (
            {verseData.verseIndex})
          </p>
        </div>

        <div className="space-y-4">
          <div
            className="text-xl text-center leading-loose font-semibold bg-white/10 p-4 rounded-lg border-r-4 border-yellow-300"
            style={{
              direction: "rtl",
              fontFamily: "Arial, sans-serif",
              textAlign: "right",
            }}
          >
            {verseData.arabic}
          </div>

          <div
            className={`text-lg text-center leading-relaxed p-4 rounded-lg border-r-4 transition-all duration-300 ${
              translationState.loading
                ? "bg-white/5 border-gray-300 animate-pulse"
                : translationState.error
                ? "bg-red-500/20 border-red-300"
                : "bg-white/10 border-green-300"
            }`}
            style={{
              direction: "rtl",
              textAlign: "right",
              fontFamily: "Noto Nastaliq Urdu, Arial, sans-serif",
            }}
          >
            {translationState.loading ? (
              <div className="flex items-center justify-center gap-2">
                <span>اردو ترجمہ لوڈ ہو رہا ہے</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            ) : translationState.error ? (
              <div className="text-center">
                <p className="text-red-200 mb-2">ترجمہ لوڈ کرنے میں خرابی</p>
                <button
                  onClick={() =>
                    lazyTranslationService.loadTranslation(
                      verseData.surahNumber,
                      verseData.verseIndex
                    )
                  }
                  className="text-sm bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-colors"
                >
                  دوبارہ کوشش کریں
                </button>
              </div>
            ) : (
              translationState.text || "ترجمہ لوڈ ہو رہا ہے..."
            )}
          </div>
        </div>

        {/* Notification CTA */}
        {!isEnabled && !showNotificationPrompt && (
          <div className="text-center mt-6">
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-sm opacity-90 mb-3">
                🔔 کیا آپ روزانہ نئی آیت کی اطلاع چاہتے ہیں؟
              </p>
              <button
                onClick={handleEnableNotifications}
                className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
              >
                اطلاع فعال کریں
              </button>
            </div>
          </div>
        )}

        {isEnabled && (
          <div className="text-center mt-4">
            <div className="bg-white/20 rounded-lg px-4 py-2 inline-flex items-center gap-2">
              <span className="text-green-300">✅</span>
              <span className="text-sm opacity-90">
                روزانہ اطلاعات فعال ہیں - ہر دن 8 بجے صبح
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
