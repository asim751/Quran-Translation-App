"use client";
import { useEffect } from "react";

interface NotificationProviderProps {
  children: React.ReactNode;
}

export default function NotificationProvider({
  children,
}: NotificationProviderProps) {
  useEffect(() => {
    // Register service worker and set up daily notifications
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    }

    // Set up daily notification schedule
    const scheduleNotification = () => {
      const enabled = localStorage.getItem("notificationsEnabled") === "true";
      if (!enabled) return;

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0); // 8 AM next day

      const timeUntilNotification = tomorrow.getTime() - now.getTime();

      setTimeout(() => {
        if (Notification.permission === "granted") {
          const verseNumber = parseInt(
            localStorage.getItem("currentVerseNumber") || "1"
          );

          // Update verse number for next day
          const totalVerses = 6236; // Total verses in Quran
          const nextVerseNumber =
            verseNumber < totalVerses ? verseNumber + 1 : 1;
          localStorage.setItem(
            "currentVerseNumber",
            nextVerseNumber.toString()
          );
          localStorage.setItem("lastVerseUpdate", new Date().toDateString());

          new Notification("آج کی آیت - قرآن مجید", {
            body: `آج کی نئی آیت پڑھنے کے لیے ایپ کھولیں (آیت نمبر ${nextVerseNumber})`,
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            tag: "daily-verse",
            requireInteraction: false,
          });
        }

        // Schedule next notification
        scheduleNotification();
      }, timeUntilNotification);
    };

    scheduleNotification();
  }, []);

  return <>{children}</>;
}
