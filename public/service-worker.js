
self.addEventListener('push', function(event) {
  if (!event.data) return;

  const notification = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: notification.data
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
