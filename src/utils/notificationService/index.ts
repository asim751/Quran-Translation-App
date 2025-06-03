class NotificationService {
  private readonly NOTIFICATION_KEY = "quran_notifications_enabled";
  private readonly PERMISSION_KEY = "quran_notification_permission";

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    // Register service worker if available
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      this.registerServiceWorker();
    }
  }

  private async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered successfully:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  // Get current notification permission
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  }

  // Check if notifications are enabled by user
  isEnabled(): boolean {
    return localStorage.getItem(this.NOTIFICATION_KEY) === "true";
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error("Notifications are not supported in this browser");
    }

    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem(this.PERMISSION_KEY, permission);
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }

  // Enable notifications
  async enableNotifications(): Promise<boolean> {
    try {
      const permission = await this.requestPermission();

      if (permission === "granted") {
        localStorage.setItem(this.NOTIFICATION_KEY, "true");
        this.scheduleNotifications();

        // Show confirmation notification
        this.showNotification(
          "قرآن ریڈر",
          "روزانہ آیات کی اطلاع فعال ہو گئی! آپ کو ہر دن 8 بجے صبح نئی آیت کی اطلاع ملے گی۔",
          "/icon-192x192.png"
        );

        return true;
      } else {
        throw new Error("Permission denied");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      return false;
    }
  }

  // Disable notifications
  disableNotifications(): void {
    localStorage.setItem(this.NOTIFICATION_KEY, "false");
    this.cancelScheduledNotifications();
  }

  // Show immediate notification
  showNotification(title: string, body: string, icon?: string): void {
    if (!this.isSupported() || this.getPermission() !== "granted") {
      return;
    }

    try {
      new Notification(title, {
        body,
        icon: icon || "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "quran-daily-verse",
        requireInteraction: false,
        silent: false,
      });
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }

  // Schedule daily notifications
  private scheduleNotifications(): void {
    if (!this.isEnabled()) return;

    // Clear any existing timers
    this.cancelScheduledNotifications();

    // Schedule for 8 AM every day
    this.scheduleNextNotification();
  }

  private scheduleNextNotification(): void {
    const now = new Date();
    const tomorrow = new Date(now);

    // Set to 8 AM tomorrow
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    const timeUntilNotification = tomorrow.getTime() - now.getTime();

    // Set timeout for next notification
    const timeoutId = setTimeout(() => {
      this.sendDailyNotification();
      this.scheduleNextNotification(); // Schedule the next one
    }, timeUntilNotification);

    // Store timeout ID for cancellation
    localStorage.setItem("notification_timeout_id", timeoutId.toString());
  }

  private sendDailyNotification(): void {
    if (!this.isEnabled() || this.getPermission() !== "granted") {
      return;
    }

    const currentVerseNumber = parseInt(
      localStorage.getItem("currentVerseNumber") || "1"
    );

    this.showNotification(
      "آج کی آیت - قرآن مجید",
      `آج کی نئی آیت پڑھنے کے لیے ایپ کھولیں (آیت نمبر ${currentVerseNumber})`,
      "/icon-192x192.png"
    );
  }

  private cancelScheduledNotifications(): void {
    const timeoutId = localStorage.getItem("notification_timeout_id");
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId));
      localStorage.removeItem("notification_timeout_id");
    }
  }

  // Test notification (for debugging)
  testNotification(): void {
    this.showNotification(
      "ٹیسٹ اطلاع",
      "یہ ایک ٹیسٹ اطلاع ہے - آپ کی اطلاعات کام کر رہی ہیں!",
      "/icon-192x192.png"
    );
  }
}

export const notificationService = new NotificationService();
