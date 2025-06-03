import { DailyVerseData } from "../types/quran";

interface TranslationState {
  loading: boolean;
  loaded: boolean;
  error: string | null;
  text: string;
}

interface UrduTranslationCache {
  [key: string]: string;
}

class LazyTranslationService {
  private cache: UrduTranslationCache = {};
  private loadingStates: Map<string, TranslationState> = new Map();
  private observers: Map<string, Set<(state: TranslationState) => void>> =
    new Map();

  constructor() {
    this.loadCache();
  }

  // Load cached translations from localStorage
  private loadCache() {
    try {
      const cached = localStorage.getItem("urdu_translations_cache");
      if (cached) {
        this.cache = JSON.parse(cached);
      }
    } catch (error) {
      console.error("Error loading translation cache:", error);
    }
  }

  // Save translations to localStorage
  private saveCache() {
    try {
      localStorage.setItem(
        "urdu_translations_cache",
        JSON.stringify(this.cache)
      );
    } catch (error) {
      console.error("Error saving translation cache:", error);
    }
  }

  // Get cache key for verse
  private getCacheKey(surahNumber: number, verseNumber: number): string {
    return `${surahNumber}:${verseNumber}`;
  }

  // Subscribe to translation state changes
  subscribe(
    surahNumber: number,
    verseNumber: number,
    callback: (state: TranslationState) => void
  ) {
    const key = this.getCacheKey(surahNumber, verseNumber);

    if (!this.observers.has(key)) {
      this.observers.set(key, new Set());
    }

    this.observers.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const observerSet = this.observers.get(key);
      if (observerSet) {
        observerSet.delete(callback);
        if (observerSet.size === 0) {
          this.observers.delete(key);
        }
      }
    };
  }

  // Notify observers of state changes
  private notifyObservers(key: string, state: TranslationState) {
    const observerSet = this.observers.get(key);
    if (observerSet) {
      observerSet.forEach((callback) => callback(state));
    }
  }

  // Get current translation state
  getTranslationState(
    surahNumber: number,
    verseNumber: number
  ): TranslationState {
    const key = this.getCacheKey(surahNumber, verseNumber);

    // If cached, return loaded state
    if (this.cache[key]) {
      return {
        loading: false,
        loaded: true,
        error: null,
        text: this.cache[key],
      };
    }

    // Return current loading state or default
    return (
      this.loadingStates.get(key) || {
        loading: false,
        loaded: false,
        error: null,
        text: "",
      }
    );
  }

  // Lazy load translation
  async loadTranslation(
    surahNumber: number,
    verseNumber: number
  ): Promise<string> {
    const key = this.getCacheKey(surahNumber, verseNumber);

    // Return cached translation if available
    if (this.cache[key]) {
      return this.cache[key];
    }

    // If already loading, wait for it
    if (this.loadingStates.get(key)?.loading) {
      return new Promise((resolve) => {
        const unsubscribe = this.subscribe(
          surahNumber,
          verseNumber,
          (state) => {
            if (!state.loading) {
              unsubscribe();
              resolve(
                state.text ||
                  this.getFallbackTranslation(surahNumber, verseNumber)
              );
            }
          }
        );
      });
    }

    // Start loading
    const loadingState: TranslationState = {
      loading: true,
      loaded: false,
      error: null,
      text: "",
    };

    this.loadingStates.set(key, loadingState);
    this.notifyObservers(key, loadingState);

    try {
      // Fetch from API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://api.alquran.cloud/v1/ayah/${surahNumber}:${verseNumber}/ur.jalandhry`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 200 && data.data && data.data.text) {
        const urduText = data.data.text;

        // Cache the translation
        this.cache[key] = urduText;
        this.saveCache();

        // Update state
        const successState: TranslationState = {
          loading: false,
          loaded: true,
          error: null,
          text: urduText,
        };

        this.loadingStates.set(key, successState);
        this.notifyObservers(key, successState);

        return urduText;
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      console.error(`Error loading translation for ${key}:`, error);

      const fallbackText = this.getFallbackTranslation(
        surahNumber,
        verseNumber
      );

      // Update state with error
      const errorState: TranslationState = {
        loading: false,
        loaded: false,
        error: error instanceof Error ? error.message : "Unknown error",
        text: fallbackText,
      };

      this.loadingStates.set(key, errorState);
      this.notifyObservers(key, errorState);

      return fallbackText;
    }
  }

  // Preload translations for visible verses
  async preloadTranslations(
    verses: Array<{ surahNumber: number; verseNumber: number }>
  ): Promise<void> {
    const promises = verses.map(async (verse, index) => {
      // Add staggered delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, index * 200));
      return this.loadTranslation(verse.surahNumber, verse.verseNumber);
    });

    await Promise.allSettled(promises);
  }

  // Fallback translations for common verses
  private getFallbackTranslation(
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

  // Clear cache
  clearCache() {
    this.cache = {};
    this.loadingStates.clear();
    localStorage.removeItem("urdu_translations_cache");
  }

  // Get cache statistics
  getCacheStats() {
    return {
      totalCached: Object.keys(this.cache).length,
      cacheSize: JSON.stringify(this.cache).length,
      activeObservers: this.observers.size,
    };
  }
}

export const lazyTranslationService = new LazyTranslationService();
