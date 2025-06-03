"use client";
import { useState, useEffect } from "react";
import { lazyTranslationService } from "@/utils/lazyTranslationService";

export default function CacheManager() {
  const [cacheStats, setCacheStats] = useState({
    totalCached: 0,
    cacheSize: 0,
    activeObservers: 0,
  });
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const stats = lazyTranslationService.getCacheStats();
      setCacheStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    if (confirm("کیا آپ واقعی تمام محفوظ شدہ ترجمے صاف کرنا چاہتے ہیں؟")) {
      lazyTranslationService.clearCache();
      setCacheStats({
        totalCached: 0,
        cacheSize: 0,
        activeObservers: 0,
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed bottom-4 left-4">
      <button
        onClick={() => setShowManager(!showManager)}
        className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="Cache Manager"
      >
        💾
      </button>

      {showManager && (
        <div className="absolute bottom-16 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80 border border-gray-200 dark:border-gray-600">
          <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white">
            ترجمہ کیش منیجر
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                محفوظ شدہ ترجمے:
              </span>
              <span className="font-semibold">{cacheStats.totalCached}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                کیش سائز:
              </span>
              <span className="font-semibold">
                {formatBytes(cacheStats.cacheSize)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                فعال لوڈر:
              </span>
              <span className="font-semibold">
                {cacheStats.activeObservers}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handleClearCache}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              کیش صاف کریں
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
