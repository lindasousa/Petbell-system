// Registro do Service Worker para PWA
// (arquivo externo para respeitar a Content-Security-Policy, que bloqueia scripts inline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('Registro de Service Worker nao ativado no ambiente atual:', err);
    });
  });
}
