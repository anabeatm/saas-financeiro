// registra o service worker e guarda o prompt de instalar

// evento do prompt de instalar (pode disparar antes dos componentes montarem)
let installPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());

export function setUpPwa() {
  window.addEventListener("beforeinstallprompt", (event) => {
    // esconde o banner do navegador, a gente usa o nosso botão
    event.preventDefault();
    installPrompt = event;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    notify();
  });

  // só em produção (no dev ia cachear os arquivos do vite)
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("Service worker registration failed", err));
    });
  }
}

export const subscribeInstallPrompt = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getInstallPrompt = () => installPrompt;

// mostra o popup de instalar; true se aceitar
export async function promptInstall() {
  if (!installPrompt) return false;
  const event = installPrompt;
  installPrompt = null;
  notify();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === "accepted";
}
