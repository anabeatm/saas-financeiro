// PWA wiring: service worker registration and the browser's "install app" prompt.

// The prompt event can fire before any component is mounted, so it is kept here.
let installPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());

export function setUpPwa() {
  window.addEventListener("beforeinstallprompt", (event) => {
    // Keep the browser from showing its own banner; the app offers an "Install app" button instead.
    event.preventDefault();
    installPrompt = event;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    notify();
  });

  // Only in production builds: in development the worker would cache files that Vite reloads.
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

// Shows the browser's install dialog; resolves to true when the user accepts.
export async function promptInstall() {
  if (!installPrompt) return false;
  const event = installPrompt;
  installPrompt = null;
  notify();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === "accepted";
}
