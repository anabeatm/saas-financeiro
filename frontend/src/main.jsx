import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ToastProvider } from "./components/ToastContext.jsx";
import "./index.css";
import OfflineBanner from "./pwa/OfflineBanner.jsx";
import { setUpPwa } from "./pwa/pwa.js";

setUpPwa();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <OfflineBanner />
      <App />
    </ToastProvider>
  </StrictMode>,
);
