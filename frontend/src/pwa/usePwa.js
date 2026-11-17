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

// false while the device has no network connection.
export const useOnline = () =>
  useSyncExternalStore(subscribeOnline, () => navigator.onLine);

// true when the browser allows installing the app (and it is not installed yet).
export const useCanInstall = () =>
  useSyncExternalStore(subscribeInstallPrompt, () => getInstallPrompt() !== null);
