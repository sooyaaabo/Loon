const CACHE_NAME = 'loon-plugin-lab-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  '../Icon/PluginLab/LoonPluginLab.png',
  '../Icon/PluginLab/Telegram.svg',
  '../Icon/PluginLab/GitHub.svg'
];

// 安装 Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 激活并清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// 拦截请求：网络优先，失败则使用缓存
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // 如果是有效响应，克隆并存入缓存
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // 网络请求失败，尝试从缓存读取
        return caches.match(e.request);
      })
  );
});