"use client";
import { useState, useEffect } from "react";
import {
  readingProgressService,
  ReadingSession,
} from "../../utils/readingProgressService";

export default function ReadingHistory() {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const recentSessions = readingProgressService.getRecentSessions(10);
    setSessions(recentSessions);
  }, []);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} منٹ`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} گھنٹہ ${remainingMinutes} منٹ`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "آج";
    if (diffInDays === 1) return "کل";
    if (diffInDays < 7) return `${diffInDays} دن پہلے`;

    return date.toLocaleDateString("ur-PK");
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          📚 پڑھائی کی تاریخ
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p>ابھی تک کوئی پڑھائی کا ریکارڈ نہیں ہے</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          📚 پڑھائی کی تاریخ
        </h3>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showHistory ? "چھپائیں" : "دکھائیں"}
        </button>
      </div>

      {showHistory && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">
                  {session.surahName || `سورہ ${session.surahId}`}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {session.versesRead.length} آیات پڑھیں
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(session.startTime)}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {formatDuration(session.duration)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
