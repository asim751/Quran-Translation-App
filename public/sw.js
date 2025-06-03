self.addEventListener("install", function (event) {
  console.log("Service Worker installing.");
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  console.log("Service Worker activating.");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (clientList) {
      // If a window is already open, focus it
      for (let client of clientList) {
        if (client.url === "/" && "focus" in client) {
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
  if (event.data) {
    const data = event.data.json();

    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "daily-verse",
        requireInteraction: false,
      })
    );
  }
});
