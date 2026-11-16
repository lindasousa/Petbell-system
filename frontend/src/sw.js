/**
 * Service Worker Leve do Petbell PWA
 * Gerencia cache de recursos estaticos para carregamento ultra-rapido (sub-3s)
 * e suporte basico a funcionamento offline.
 */

const CACHE_NAME = "petbell-cache-v1";
const RECURSOS_ESTATICOS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/styles.css"
];

// Instalacao do Service Worker
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(RECURSOS_ESTATICOS);
    })
  );
  self.skipWaiting();
});

// Ativacao e limpeza de caches antigos
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((chaves) => {
      return Promise.all(
        chaves
          .filter((chave) => chave !== CACHE_NAME)
          .map((chave) => caches.delete(chave))
      );
    })
  );
  self.clients.claim();
});

// Estrategia Network-First com fallback para Cache para dados da API
self.addEventListener("fetch", (evento) => {
  // Ignora requisicoes nao-GET
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    fetch(evento.request)
      .then((respostaRede) => {
        // Clona e salva em cache se for requisicao bem sucedida
        if (respostaRede && respostaRede.status === 200) {
          const respostaClone = respostaRede.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(evento.request, respostaClone);
          });
        }
        return respostaRede;
      })
      .catch(() => {
        // Fallback para cache quando sem conexao
        return caches.match(evento.request);
      })
  );
});
