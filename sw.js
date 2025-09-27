// Версия кэша - меняйте это значение при каждом обновлении кода
const CACHE_NAME = 'uit-brain-v1.0.2';

// Файлы, которые нужно кэшировать сразу при установке
const STATIC_CACHE = [
    '/',
    '/index.html',
    '/Таблицы/Группы-ОРГ.html',
    '/Таблицы/Группы-Проектов.html',
    '/Таблицы/Бригады-Физика.html',
    '/Таблицы/Группы-Жизненного-цикла.html',
    '/Таблицы/Учебники.html',
    '/Таблицы/Ресурсы.html',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Установка Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker: Установлен');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Кэширование основных файлов');
                return cache.addAll(STATIC_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Активация Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker: Активирован');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Очистка старого кэша');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Перехват запросов
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                const fetchPromise = fetch(event.request)
                    .then(networkResponse => {
                        if (networkResponse.ok) {
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, networkResponse.clone());
                                });
                        }
                        return networkResponse;
                    })
                    .catch(error => {
                        console.log('Fetch failed; returning cached version.', error);
                    });

                return cachedResponse || fetchPromise;
            })
    );
});

// Обработка сообщений от главной страницы
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
