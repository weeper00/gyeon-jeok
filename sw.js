// 견적 원장 오프라인 캐시. 앱을 고친 뒤에는 CACHE 버전 숫자를 올린다.
const CACHE = "gyeonjeok-v1.0.0";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  // 화면(HTML)은 네트워크 우선: 온라인이면 최신 버전, 오프라인이면 저장본
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(res => {
      const cp = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); return res;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  // 나머지(아이콘, 글꼴 등)는 캐시 우선
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return res;
  }).catch(() => hit)));
});
