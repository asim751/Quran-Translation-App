export interface ReadingProgress {
  currentSurah: number;
  currentVerse: number;
  lastReadAt: string;
  totalVersesRead: number;
  completedSurahs: number[];
  readingHistory: ReadingSession[];
  dailyStreak: number;
  lastStreakDate: string;
}

export interface ReadingSession {
  surahId: number;
  surahName: string;
  versesRead: number[];
  startTime: string;
  endTime: string;
  duration: number; // in minutes
}

export interface BookmarkData {
  id: string;
  surahId: number;
  verseId: number;
  surahName: string;
  verseText: string;
  note?: string;
  createdAt: string;
}

class ReadingProgressService {
  private readonly PROGRESS_KEY = "quran_reading_progress";
  private readonly BOOKMARKS_KEY = "quran_bookmarks";
  private readonly SESSION_KEY = "current_reading_session";

  private currentSession: ReadingSession | null = null;

  constructor() {
    this.initializeProgress();
    this.startNewSession();
  }

  // Initialize default progress if not exists
  private initializeProgress(): void {
    const existing = this.getProgress();
    if (!existing) {
      const defaultProgress: ReadingProgress = {
        currentSurah: 1,
        currentVerse: 1,
        lastReadAt: new Date().toISOString(),
        totalVersesRead: 0,
        completedSurahs: [],
        readingHistory: [],
        dailyStreak: 0,
        lastStreakDate: "",
      };
      this.saveProgress(defaultProgress);
    }
  }

  // Get current reading progress
  getProgress(): ReadingProgress | null {
    try {
      const stored = localStorage.getItem(this.PROGRESS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error getting reading progress:", error);
      return null;
    }
  }

  // Save reading progress
  private saveProgress(progress: ReadingProgress): void {
    try {
      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Error saving reading progress:", error);
    }
  }

  // Update reading position
  updateReadingPosition(surahId: number, verseId: number): void {
    const progress = this.getProgress();
    if (!progress) return;

    const now = new Date().toISOString();

    // Update current position
    progress.currentSurah = surahId;
    progress.currentVerse = verseId;
    progress.lastReadAt = now;

    // Update daily streak
    this.updateDailyStreak(progress);

    // Track verse as read in current session
    if (this.currentSession) {
      if (!this.currentSession.versesRead.includes(verseId)) {
        this.currentSession.versesRead.push(verseId);
        progress.totalVersesRead++;
      }
    }

    this.saveProgress(progress);
    this.saveCurrentSession();
  }

  // Mark surah as completed
  markSurahCompleted(surahId: number): void {
    const progress = this.getProgress();
    if (!progress) return;

    if (!progress.completedSurahs.includes(surahId)) {
      progress.completedSurahs.push(surahId);
      this.saveProgress(progress);
    }
  }

  // Get reading statistics
  getReadingStats(): {
    totalVersesRead: number;
    completedSurahs: number;
    dailyStreak: number;
    percentageComplete: number;
    averageVersesPerDay: number;
    totalReadingTime: number;
  } {
    const progress = this.getProgress();
    if (!progress) {
      return {
        totalVersesRead: 0,
        completedSurahs: 0,
        dailyStreak: 0,
        percentageComplete: 0,
        averageVersesPerDay: 0,
        totalReadingTime: 0,
      };
    }

    const totalQuranVerses = 6236;
    const totalReadingTime = progress.readingHistory.reduce(
      (sum, session) => sum + session.duration,
      0
    );

    // Calculate average verses per day
    const daysActive =
      progress.readingHistory.length > 0
        ? Math.max(1, progress.readingHistory.length)
        : 1;

    const averageVersesPerDay = progress.totalVersesRead / daysActive;

    return {
      totalVersesRead: progress.totalVersesRead,
      completedSurahs: progress.completedSurahs.length,
      dailyStreak: progress.dailyStreak,
      percentageComplete: (progress.totalVersesRead / totalQuranVerses) * 100,
      averageVersesPerDay: Math.round(averageVersesPerDay * 10) / 10,
      totalReadingTime: Math.round(totalReadingTime),
    };
  }

  // Start new reading session
  startNewSession(): void {
    const progress = this.getProgress();
    if (!progress) return;

    this.currentSession = {
      surahId: progress.currentSurah,
      surahName: "",
      versesRead: [],
      startTime: new Date().toISOString(),
      endTime: "",
      duration: 0,
    };

    this.saveCurrentSession();
  }

  // End current reading session
  endCurrentSession(): void {
    if (!this.currentSession) return;

    const now = new Date();
    const startTime = new Date(this.currentSession.startTime);
    const duration = Math.round(
      (now.getTime() - startTime.getTime()) / (1000 * 60)
    ); // minutes

    this.currentSession.endTime = now.toISOString();
    this.currentSession.duration = duration;

    // Save to history if session was longer than 1 minute
    if (duration > 1) {
      const progress = this.getProgress();
      if (progress) {
        progress.readingHistory.push({ ...this.currentSession });

        // Keep only last 30 sessions
        if (progress.readingHistory.length > 30) {
          progress.readingHistory = progress.readingHistory.slice(-30);
        }

        this.saveProgress(progress);
      }
    }

    this.currentSession = null;
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Save current session
  private saveCurrentSession(): void {
    if (this.currentSession) {
      try {
        localStorage.setItem(
          this.SESSION_KEY,
          JSON.stringify(this.currentSession)
        );
      } catch (error) {
        console.error("Error saving current session:", error);
      }
    }
  }

  // Update daily streak
  private updateDailyStreak(progress: ReadingProgress): void {
    const today = new Date().toDateString();
    const lastStreakDate = progress.lastStreakDate;

    if (lastStreakDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastStreakDate === yesterday.toDateString()) {
        // Continue streak
        progress.dailyStreak++;
      } else if (lastStreakDate === "") {
        // First day
        progress.dailyStreak = 1;
      } else {
        // Streak broken
        progress.dailyStreak = 1;
      }

      progress.lastStreakDate = today;
    }
  }

  // Bookmark management
  addBookmark(
    surahId: number,
    verseId: number,
    surahName: string,
    verseText: string,
    note?: string
  ): void {
    const bookmarks = this.getBookmarks();
    const bookmark: BookmarkData = {
      id: `${surahId}_${verseId}_${Date.now()}`,
      surahId,
      verseId,
      surahName,
      verseText,
      note,
      createdAt: new Date().toISOString(),
    };

    bookmarks.push(bookmark);
    this.saveBookmarks(bookmarks);
  }

  removeBookmark(bookmarkId: string): void {
    const bookmarks = this.getBookmarks();
    const filtered = bookmarks.filter((b) => b.id !== bookmarkId);
    this.saveBookmarks(filtered);
  }

  getBookmarks(): BookmarkData[] {
    try {
      const stored = localStorage.getItem(this.BOOKMARKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting bookmarks:", error);
      return [];
    }
  }

  private saveBookmarks(bookmarks: BookmarkData[]): void {
    try {
      localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error("Error saving bookmarks:", error);
    }
  }

  // Reset progress (for testing or user choice)
  resetProgress(): void {
    localStorage.removeItem(this.PROGRESS_KEY);
    localStorage.removeItem(this.BOOKMARKS_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    this.initializeProgress();
  }

  // Get recent reading history
  getRecentSessions(limit: number = 10): ReadingSession[] {
    const progress = this.getProgress();
    if (!progress) return [];

    return progress.readingHistory
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
      .slice(0, limit);
  }

  // Export progress data
  exportProgress(): string {
    const progress = this.getProgress();
    const bookmarks = this.getBookmarks();

    return JSON.stringify(
      {
        progress,
        bookmarks,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  // Import progress data
  importProgress(data: string): boolean {
    try {
      const parsed = JSON.parse(data);

      if (parsed.progress) {
        this.saveProgress(parsed.progress);
      }

      if (parsed.bookmarks) {
        this.saveBookmarks(parsed.bookmarks);
      }

      return true;
    } catch (error) {
      console.error("Error importing progress:", error);
      return false;
    }
  }
}

export const readingProgressService = new ReadingProgressService();
