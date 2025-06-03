import { useState, useEffect } from "react";
import { notificationService } from "@/utils/notificationService";

export function useNotifications() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(notificationService.isSupported());
    setIsEnabled(notificationService.isEnabled());
    setPermission(notificationService.getPermission());
  }, []);

  const enableNotifications = async (): Promise<boolean> => {
    try {
      const success = await notificationService.enableNotifications();
      if (success) {
        setIsEnabled(true);
        setPermission("granted");
      }
      return success;
    } catch (error) {
      console.error("Error enabling notifications:", error);
      return false;
    }
  };

  const disableNotifications = (): void => {
    notificationService.disableNotifications();
    setIsEnabled(false);
  };

  const testNotification = (): void => {
    notificationService.testNotification();
  };

  return {
    isEnabled,
    permission,
    isSupported,
    enableNotifications,
    disableNotifications,
    testNotification,
  };
}
