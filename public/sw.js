self.addEventListener("install", function (event) {
  console.log("Service Worker installing.");
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  console.log("Service Worker activating.");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked:", event.notification);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (clientList) {
      // If a window is already open, focus it
      for (let client of clientList) {
        if (client.url.includes(location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});

self.addEventListener("push", function (event) {
  console.log("Push event received:", event);

  if (event.data) {
    try {
      const data = event.data.json();

      event.waitUntil(
        self.registration.showNotification(data.title || "قرآن ریڈر", {
          body: data.body || "آج کی نئی آیت پڑھنے کے لیے کلک کریں",
          icon: data.icon || "/icon-192x192.png",
          badge: "/icon-192x192.png",
          tag: "quran-daily-verse",
          requireInteraction: false,
          vibrate: [200, 100, 200],
          actions: [
            {
              action: "read",
              title: "آیت پڑھیں",
            },
            {
              action: "close",
              title: "بند کریں",
            },
          ],
        })
      );
    } catch (error) {
      console.error("Error processing push event:", error);
    }
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification action clicked:", event.action);

  event.notification.close();

  if (event.action === "read" || !event.action) {
    event.waitUntil(clients.openWindow("/"));
  }
});
