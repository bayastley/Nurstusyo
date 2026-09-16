import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initErrorReport } from "./utils/errorReport";

// Global hata izleme — Sentry'siz, kendi altyapımızda
initErrorReport();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
