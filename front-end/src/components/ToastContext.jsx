import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = "info", title, description, duration = 4000 }) => {
      const id = Math.random().toString(36).substring(2, 9); //id aleatório 

      setToasts((prev) => [...prev, { id, type, title, description }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
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

function ToastItem({ toast, onClose }) {
  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div
      className={`flex w-80 max-w-full items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 bg-white
      ${isSuccess ? "border-green-500" : ""}
      ${isError ? "border-red-500" : ""}
    `}
    >
      {isSuccess && (
        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
      )}
      {isError && (
        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
      )}

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
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
