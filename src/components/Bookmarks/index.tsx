"use client";
import { useState, useEffect } from "react";
import {
  readingProgressService,
  BookmarkData,
} from "../../utils/readingProgressService";

interface BookmarksProps {
  onNavigateToVerse?: (surahId: number, verseId: number) => void;
}

export default function Bookmarks({ onNavigateToVerse }: BookmarksProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

  useEffect(() => {
    refreshBookmarks();
  }, []);

  const refreshBookmarks = () => {
    const allBookmarks = readingProgressService.getBookmarks();
    setBookmarks(allBookmarks);
  };

  const handleRemoveBookmark = (bookmarkId: string) => {
    if (confirm("کیا آپ واقعی یہ بک مارک ہٹانا چاہتے ہیں؟")) {
      readingProgressService.removeBookmark(bookmarkId);
      refreshBookmarks();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ur-PK");
  };

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          📌 بک مارکس
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p className="mb-2">ابھی تک کوئی بک مارک نہیں ہے</p>
          <p className="text-sm">
            آیات پڑھتے وقت 📌 آئکن پر کلک کرکے بک مارک کریں
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          📌 بک مارکس ({bookmarks.length})
        </h3>
        <button
          onClick={() => setShowBookmarks(!showBookmarks)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showBookmarks ? "چھپائیں" : "دکھائیں"}
        </button>
      </div>

      {showBookmarks && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-white">
                    {bookmark.surahName} - آیت {bookmark.verseId}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(bookmark.createdAt)}
                  </p>
                </div>

                <div className="flex gap-2">
                  {onNavigateToVerse && (
                    <button
                      onClick={() =>
                        onNavigateToVerse(bookmark.surahId, bookmark.verseId)
                      }
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      جائیں
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                    className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    ❌
                  </button>
                </div>
              </div>

              <div
                className="text-sm text-gray-700 dark:text-gray-300 mb-2 p-2 bg-gray-100 dark:bg-gray-600 rounded"
                style={{ direction: "rtl", textAlign: "right" }}
              >
                {bookmark.verseText.length > 100
                  ? `${bookmark.verseText.substring(0, 100)}...`
                  : bookmark.verseText}
              </div>

              {bookmark.note && (
                <div className="text-sm text-blue-600 dark:text-blue-400 italic">
                  نوٹ: {bookmark.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
