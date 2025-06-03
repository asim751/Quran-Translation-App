import { useState, useEffect } from "react";
import {
  readingProgressService,
  ReadingProgress,
} from "../../utils/readingProgressService";

export function useReadingProgress() {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [stats, setStats] = useState({
    totalVersesRead: 0,
    completedSurahs: 0,
    dailyStreak: 0,
    percentageComplete: 0,
    averageVersesPerDay: 0,
    totalReadingTime: 0,
  });

  const refreshProgress = () => {
    const currentProgress = readingProgressService.getProgress();
    const currentStats = readingProgressService.getReadingStats();
    setProgress(currentProgress);
    setStats(currentStats);
  };

  useEffect(() => {
    refreshProgress();
  }, []);

  const updatePosition = (surahId: number, verseId: number) => {
    readingProgressService.updateReadingPosition(surahId, verseId);
    refreshProgress();
  };

  const markSurahComplete = (surahId: number) => {
    readingProgressService.markSurahCompleted(surahId);
    refreshProgress();
  };

  return {
    progress,
    stats,
    updatePosition,
    markSurahComplete,
    refreshProgress,
  };
}
