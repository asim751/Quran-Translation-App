"use client";
import { useState, useEffect } from "react";
import { readingProgressService } from "@/utils/readingProgressService";
import { quranService } from "@/utils/quranService";

interface ContinueReadingProps {
  onContinue: (surahId: number, verseId: number) => void;
}

export default function ContinueReading({ onContinue }: ContinueReadingProps) {
  const [lastPosition, setLastPosition] = useState<{
    surahId: number;
    verseId: number;
    surahName: string;
    lastReadAt: string;
  } | null>(null);

  useEffect(() => {
    const progress: any = readingProgressService.getProgress();
    if ((progress && progress.currentSurah > 1) || progress.currentVerse > 1) {
      const surah = quranService.getSurahById(progress.currentSurah);
      if (surah) {
        setLastPosition({
          surahId: progress.currentSurah,
          verseId: progress.currentVerse,
          surahName: surah.transliteration,
          lastReadAt: progress.lastReadAt,
        });
      }
    }
  }, []);

  if (!lastPosition) return null;

  const formatLastRead = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "ابھی ابھی";
    if (diffInHours < 24) return `${diffInHours} گھنٹے پہلے`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "کل";
    if (diffInDays < 7) return `${diffInDays} دن پہلے`;

    return date.toLocaleDateString("ur-PK");
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            📖 وہاں سے جاری رکھیں جہاں آپ نے چھوڑا تھا
          </h3>
          <p className="text-sm opacity-90 mb-1">
            {lastPosition.surahName} - آیت {lastPosition.verseId}
          </p>
          <p className="text-xs opacity-75">
            آخری بار پڑھا: {formatLastRead(lastPosition.lastReadAt)}
          </p>
        </div>

        <button
          onClick={() => onContinue(lastPosition.surahId, lastPosition.verseId)}
          className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-colors font-semibold"
        >
          جاری رکھیں →
        </button>
      </div>
    </div>
  );
}
