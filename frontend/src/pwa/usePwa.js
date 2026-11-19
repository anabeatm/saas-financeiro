import { useSyncExternalStore } from "react";
import { getInstallPrompt, subscribeInstallPrompt } from "./pwa";

const subscribeOnline = (callback) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};

// tá online ou não
export const useOnline = () =>
  useSyncExternalStore(subscribeOnline, () => navigator.onLine);

// se dá pra instalar o app
export const useCanInstall = () =>
  useSyncExternalStore(subscribeInstallPrompt, () => getInstallPrompt() !== null);
