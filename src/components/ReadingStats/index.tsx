"use client";
import { useReadingProgress } from "@/hooks/useReadingProgress";

export default function ReadingStats() {
  const { stats, progress } = useReadingProgress();

  if (!progress) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
        📊 آپ کی پڑھائی کی تفصیلات
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalVersesRead}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            آیات پڑھی گئیں
          </div>
        </div>

        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completedSurahs}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            مکمل سورے
          </div>
        </div>

        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.dailyStreak}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            روزانہ کی لڑی
          </div>
        </div>

        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.percentageComplete.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">مکمل</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            قرآن مجید کی پیش قدمی
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-white">
            {stats.totalVersesRead} / 6236
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(stats.percentageComplete, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="text-gray-600 dark:text-gray-400">
          <span>روزانہ اوسط:</span>
          <span className="font-semibold text-gray-800 dark:text-white ml-2">
            {stats.averageVersesPerDay} آیات
          </span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <span>کل وقت:</span>
          <span className="font-semibold text-gray-800 dark:text-white ml-2">
            {stats.totalReadingTime} منٹ
          </span>
        </div>
      </div>
    </div>
  );
}
