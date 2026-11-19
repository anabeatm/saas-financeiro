import { useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { ToastContext } from "./useToast";
import PixelSprite from "./gamification/PixelSprite";
import { COIN, TIER_PALETTES } from "./gamification/sprites";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // type: info | success | error | warning | reward
  const addToast = useCallback(
    ({ type = "info", title, description, icon, duration = 4000 }) => {
      const id = Math.random().toString(36).substring(2, 9);

      setToasts((prev) => [...prev, { id, type, title, description, icon }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-3 md:bottom-4">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const BORDERS = {
  success: "border-green-500",
  error: "border-red-500",
  warning: "border-amber-500",
  reward: "border-[#a88d6f]",
};

const defaultIcon = (type) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />;
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />;
    case "reward":
      return <PixelSprite grid={COIN} palette={TIER_PALETTES.Saver} size={24} />;
    default:
      return null;
  }
};

function ToastItem({ toast, onClose }) {
  const icon = toast.icon ?? defaultIcon(toast.type);

  return (
    <div
      role="status"
      className={`flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 bg-white ${BORDERS[toast.type] ?? ""}`}
    >
      {icon}

      <div className="flex-1 flex flex-col gap-1">
        {toast.title && (
          <h3 className="text-sm font-semibold text-gray-900">{toast.title}</h3>
        )}
        {toast.description && (
          <p className="text-sm text-gray-500">{toast.description}</p>
        )}
      </div>

      <button
        onClick={onClose}
        aria-label="Close notification"
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
