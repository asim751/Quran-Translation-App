import quranData from "quran-json/dist/quran.json";
import { QuranSurah, QuranVerse, DailyVerseData } from "../types/quran";

interface UrduTranslationCache {
  [key: string]: string;
}

class QuranService {
  private surahs: QuranSurah[];
  private urduCache: UrduTranslationCache = {};

  constructor() {
    this.surahs = quranData as QuranSurah[];
    this.loadUrduCache();
  }

  // Load cached Urdu translations from localStorage
  private loadUrduCache() {
    try {
      const cached = localStorage.getItem("urdu_translations");
      if (cached) {
        this.urduCache = JSON.parse(cached);
      }
    } catch (error) {
      console.error("Error loading Urdu cache:", error);
    }
  }

  // Save Urdu translations to localStorage
  private saveUrduCache() {
    try {
      localStorage.setItem("urdu_translations", JSON.stringify(this.urduCache));
    } catch (error) {
      console.error("Error saving Urdu cache:", error);
    }
  }

  // Get Urdu translation from API
  private async fetchUrduTranslation(
    surahNumber: number,
    verseNumber: number
  ): Promise<string> {
    const cacheKey = `${surahNumber}:${verseNumber}`;

    // Return cached translation if available
    if (this.urduCache[cacheKey]) {
      return this.urduCache[cacheKey];
    }

    try {
      // Using Al-Quran Cloud API - Urdu translation by Fateh Muhammad Jalandhry
      const response = await fetch(
        `https://api.alquran.cloud/v1/ayah/${surahNumber}:${verseNumber}/ur.jalandhry`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 200 && data.data && data.data.text) {
        const urduText = data.data.text;
        this.urduCache[cacheKey] = urduText;
        this.saveUrduCache();
        return urduText;
      }
    } catch (error) {
      console.error("Error fetching Urdu translation:", error);
    }

    // Fallback translations for common verses
    return this.getFallbackUrduTranslation(surahNumber, verseNumber);
  }

  // Fallback Urdu translations for important verses
  private getFallbackUrduTranslation(
    surahNumber: number,
    verseNumber: number
  ): string {
    const fallbacks: { [key: string]: string } = {
      "1:1": "شروع اللہ کے نام سے جو بڑا مہربان اور نہایت رحم والا ہے",
      "1:2": "تمام تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا پروردگار ہے",
      "1:3": "بڑا مہربان اور نہایت رحم والا",
      "1:4": "روز جزا کا مالک",
      "1:5": "ہم صرف تیری عبادت کرتے ہیں اور صرف تجھ سے مدد مانگتے ہیں",
      "1:6": "ہمیں سیدھا راستہ دکھا",
      "1:7":
        "ان لوگوں کا راستہ جن پر تو نے انعام کیا ہے، نہ کہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا",
      "2:1": "الف لام میم",
      "2:2": "یہ وہ کتاب ہے جس میں کوئی شک نہیں، پرہیزگاروں کے لیے ہدایت ہے",
      "2:3":
        "جو غیب پر ایمان لاتے ہیں اور نماز قائم کرتے ہیں اور جو کچھ ہم نے انہیں دیا ہے اس میں سے خرچ کرتے ہیں",
    };

    const key = `${surahNumber}:${verseNumber}`;
    return fallbacks[key] || "اردو ترجمہ لوڈ ہو رہا ہے...";
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
            const urduTranslation = await this.fetchUrduTranslation(
              surah.id,
              i + 1
            );

            return {
              arabic: verse.text,
              urdu: urduTranslation,
              surahName: surah.transliteration,
              surahNameArabic: surah.name,
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
    const urduTranslation = await this.fetchUrduTranslation(
      surahNumber,
      verseNumber
    );

    return {
      arabic: verse.text,
      urdu: urduTranslation,
      surahName: surah.transliteration,
      surahNameArabic: surah.name,
      verseIndex: verseNumber,
      surahNumber: surah.id,
    };
  }

  // Get all verses for a surah with Urdu translations
  async getAllVersesForSurah(surahNumber: number): Promise<DailyVerseData[]> {
    const surah = this.getSurahById(surahNumber);
    if (!surah || !surah.verses) {
      return [];
    }

    const verses: DailyVerseData[] = [];

    // Process verses in batches to avoid overwhelming the API
    for (let i = 0; i < surah.verses.length; i++) {
      const verse = surah.verses[i];
      const urduTranslation = await this.fetchUrduTranslation(
        surahNumber,
        i + 1
      );

      verses.push({
        arabic: verse.text,
        urdu: urduTranslation,
        surahName: surah.transliteration,
        surahNameArabic: surah.name,
        verseIndex: i + 1,
        surahNumber: surah.id,
      });

      // Add small delay to respect API rate limits
      if (i % 5 === 0 && i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return verses;
  }

  // Search surahs by name
  searchSurahs(query: string): QuranSurah[] {
    const searchTerm = query.toLowerCase();
    return this.surahs.filter(
      (surah) =>
        surah.transliteration.toLowerCase().includes(searchTerm) ||
        surah.translation.toLowerCase().includes(searchTerm) ||
        surah.name.includes(searchTerm)
    );
  }

  // Preload Urdu translations for first Para (for better performance)
  async preloadFirstPara(): Promise<void> {
    try {
      // Load translations for Al-Fatiha and first 20 verses of Al-Baqarah
      for (let i = 1; i <= 7; i++) {
        await this.fetchUrduTranslation(1, i); // Al-Fatiha
      }
      for (let i = 1; i <= 20; i++) {
        await this.fetchUrduTranslation(2, i); // Al-Baqarah first 20 verses
      }
    } catch (error) {
      console.error("Error preloading translations:", error);
    }
  }
}

export const quranService = new QuranService();
