export interface QuranVerse {
  id: number;
  text: string;
  translation_en?: string;
  translation_ur?: string;
}

export interface QuranSurah {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: "meccan" | "medinan";
  total_verses: number;
  verses: QuranVerse[];
}

export interface DailyVerseData {
  arabic: string;
  urdu: string;
  surahName: string;
  surahNameArabic: string;
  verseIndex: number;
  surahNumber: number;
}
