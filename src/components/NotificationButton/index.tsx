"use client";

import { useNotifications } from "@/hooks/useNotifications";

interface NotificationButtonProps {
  className?: string;
  showText?: boolean;
}

export default function NotificationButton({
  className = "",
  showText = true,
}: NotificationButtonProps) {
  const {
    isEnabled,
    permission,
    isSupported,
    enableNotifications,
    disableNotifications,
    testNotification,
  } = useNotifications();

  const handleToggle = async () => {
    if (isEnabled) {
      disableNotifications();
      alert("روزانہ آیات کی اطلاع بند ہو گئی");
    } else {
      const success = await enableNotifications();
      if (!success) {
        if (permission === "denied") {
          alert(
            "اطلاعات کی اجازت مسترد کر دی گئی ہے۔ براؤزر کی سیٹنگس سے اطلاعات کی اجازت دیں۔"
          );
        } else {
          alert("اطلاعات فعال کرنے میں خرابی ہوئی۔");
        }
      }
    }
  };

  if (!isSupported) {
    return (
      <button
        className={`px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed ${className}`}
        disabled
        title="آپ کا برائوزر اطلاعات کو سپورٹ نہیں کرتا"
      >
        {showText ? "🔕 اطلاع غیر فعال" : "🔕"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        className={`px-4 py-2 rounded-lg transition-colors ${
          isEnabled
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-blue-500 text-white hover:bg-blue-600"
        } ${className}`}
      >
        {isEnabled
          ? showText
            ? "🔕 اطلاع بند کریں"
            : "🔕"
          : showText
          ? "🔔 اطلاع فعال کریں"
          : "🔔"}
      </button>

      {/* Test button in development */}
      {process.env.NODE_ENV === "development" && isEnabled && (
        <button
          onClick={testNotification}
          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          title="ٹیسٹ اطلاع"
        >
          ٹیسٹ
        </button>
      )}
    </div>
  );
}
