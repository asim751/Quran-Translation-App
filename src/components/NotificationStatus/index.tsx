"use client";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationStatus() {
  const { isEnabled, permission, isSupported } = useNotifications();

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isEnabled && (
        <div className="bg-green-500 text-white p-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔔</span>
            <strong className="text-sm">اطلاعات فعال ہیں</strong>
          </div>
          <p className="text-xs opacity-90">
            آپ کو ہر دن 8 بجے صبح نئی آیت کی اطلاع ملے گی
          </p>
        </div>
      )}

      {!isEnabled && permission === "denied" && (
        <div className="bg-red-500 text-white p-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔕</span>
            <strong className="text-sm">اطلاعات بند ہیں</strong>
          </div>
          <p className="text-xs opacity-90">
            براؤزر کی سیٹنگس سے اطلاعات کی اجازت دیں
          </p>
        </div>
      )}
    </div>
  );
}
