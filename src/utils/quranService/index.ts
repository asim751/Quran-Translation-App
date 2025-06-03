// utils/quranService.ts - FIXED
import quranData from "quran-json/dist/quran.json";
import { QuranSurah, QuranVerse, DailyVerseData } from "../types/quran";

class QuranService {
  private surahs: QuranSurah[];

  constructor() {
    this.surahs = quranData as QuranSurah[];
  }

  // Get all surahs
  getAllSurahs(): QuranSurah[] {
    return this.surahs;
  }

  // Get specific surah by ID
  getSurahById(id: number): QuranSurah | null {
    return this.surahs.find((surah) => surah.id === id) || null;
  }

  // Get total number of verses in the Quran
  getTotalVerses(): number {
    return this.surahs.reduce((total, surah) => total + surah.total_verses, 0);
  }

  // Get verse by sequential number (for daily verses)
  async getVerseBySequentialNumber(
    sequentialNumber: number
  ): Promise<DailyVerseData | null> {
    let currentCount = 0;

    for (const surah of this.surahs) {
      if (surah.verses) {
        for (let i = 0; i < surah.verses.length; i++) {
          currentCount++;

          if (currentCount === sequentialNumber) {
            const verse = surah.verses[i];

            return {
              arabic: verse.text,
              urdu: "اردو ترجمہ لوڈ ہو رہا ہے...", // Will be loaded by lazy service
              surahName: surah.transliteration || `Surah ${surah.id}`,
              surahNameArabic: surah.name || "",
              verseIndex: i + 1,
              surahNumber: surah.id,
            };
          }
        }
      }
    }

    return null;
  }

  // Get verse by surah and verse number
  async getVerse(
    surahNumber: number,
    verseNumber: number
  ): Promise<DailyVerseData | null> {
    const surah = this.getSurahById(surahNumber);
    if (!surah || !surah.verses || verseNumber > surah.verses.length) {
      return null;
    }

    const verse = surah.verses[verseNumber - 1];

    return {
      arabic: verse.text,
      urdu: "اردو ترجمہ لوڈ ہو رہا ہے...", // Will be loaded by lazy service
      surahName: surah.transliteration || `Surah ${surah.id}`,
      surahNameArabic: surah.name || "",
      verseIndex: verseNumber,
      surahNumber: surah.id,
    };
  }

  // FIXED: Safe search function with null checks
  searchSurahs(query: string): QuranSurah[] {
    if (!query || query.trim() === "") {
      return this.surahs;
    }

    const searchTerm = query.toLowerCase().trim();

    return this.surahs.filter((surah: any) => {
      // Safe check for transliteration
      const transliterationMatch = surah.transliteration
        ? surah.transliteration.toLowerCase().includes(searchTerm)
        : false;

      // Safe check for translation (this was causing the error)
      const translationMatch = surah.translation
        ? surah.translation.toLowerCase().includes(searchTerm)
        : false;

      // Safe check for Arabic name
      const arabicNameMatch = surah.name
        ? surah.name.includes(searchTerm)
        : false;

      // Safe check for English name if available
      const englishNameMatch = surah.nameEnglish
        ? surah.nameEnglish.toLowerCase().includes(searchTerm)
        : false;

      // Check if search term is a number (for surah ID)
      const idMatch =
        !isNaN(Number(searchTerm)) && surah.id === Number(searchTerm);

      return (
        transliterationMatch ||
        translationMatch ||
        arabicNameMatch ||
        englishNameMatch ||
        idMatch
      );
    });
  }

  // Alternative search with more comprehensive matching
  searchSurahsAdvanced(query: string): QuranSurah[] {
    if (!query || query.trim() === "") {
      return this.surahs;
    }

    const searchTerm = query.toLowerCase().trim();

    return this.surahs.filter((surah: any) => {
      // Create searchable text array with safe checks
      const searchableFields = [
        surah.transliteration || "",
        surah.translation || "",
        surah.name || "",
        surah.nameEnglish || "",
        surah.id.toString(),
        surah.type || "",
      ];

      // Join all fields and search
      const combinedText = searchableFields.join(" ").toLowerCase();

      return combinedText.includes(searchTerm);
    });
  }

  // Get surah suggestions based on partial input
  getSurahSuggestions(query: string, limit: number = 5): QuranSurah[] {
    if (!query || query.trim() === "") {
      return this.surahs.slice(0, limit);
    }

    const searchResults = this.searchSurahs(query);
    return searchResults.slice(0, limit);
  }

  // Get all verses for a surah (for VerseReader)
  getSurahVerses(surahId: number): Array<{
    arabic: string;
    verseNumber: number;
  }> {
    const surah = this.getSurahById(surahId);
    if (!surah || !surah.verses) {
      return [];
    }

    return surah.verses.map((verse, index) => ({
      arabic: verse.text,
      verseNumber: index + 1,
    }));
  }

  // Validate surah data structure (for debugging)
  validateSurahData(): {
    totalSurahs: number;
    missingFields: string[];
    surahsWithIssues: number[];
  } {
    const missingFields: string[] = [];
    const surahsWithIssues: number[] = [];

    this.surahs.forEach((surah) => {
      const issues: string[] = [];

      if (!surah.id) issues.push("id");
      if (!surah.name) issues.push("name");
      if (!surah.transliteration) issues.push("transliteration");
      if (!surah.translation) issues.push("translation");
      if (!surah.verses || surah.verses.length === 0) issues.push("verses");

      if (issues.length > 0) {
        surahsWithIssues.push(surah.id);
        issues.forEach((issue) => {
          if (!missingFields.includes(issue)) {
            missingFields.push(issue);
          }
        });
      }
    });

    return {
      totalSurahs: this.surahs.length,
      missingFields,
      surahsWithIssues,
    };
  }
}

export const quranService = new QuranService();

// Debug helper (remove in production)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).quranServiceDebug = {
    validateData: () => quranService.validateSurahData(),
    getSample: () => quranService.getAllSurahs().slice(0, 3),
    searchTest: (query: string) => quranService.searchSurahs(query),
  };
}
