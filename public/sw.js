/* SIPAP service worker: khusus Web Push.
 * SENGAJA tidak menyimpan cache halaman, agar data agenda tidak pernah
 * tampil basi atau terbawa antar-pengguna pada perangkat bersama. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "SIPAP", {
      body: data.body || "",
      icon: "/pwa-icon?size=192",
      badge: "/pwa-icon?size=192",
      tag: data.tag,
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(
    (event.notification.data && event.notification.data.url) || "/",
    self.location.origin,
  ).href;

  event.waitUntil(
    (async () => {
      const jendela = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const w of jendela) {
        if ("focus" in w) {
          try {
            await w.navigate(url);
          } catch {
            /* abaikan */
          }
          return w.focus();
        }
      }
      return self.clients.openWindow(url);
    })(),
  );
});
