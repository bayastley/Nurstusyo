import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initErrorReport } from "./utils/errorReport";
import { dilSaukle } from "./i18n";

// Global hata izleme — Sentry'siz, kendi altyapımızda
initErrorReport();

// ★ 16.10 MOBİL HIZ: 5 dilli i18n sözlükleri (~380KB) ana chunk'tan çıkartıldı.
//   Yalnız TR eager'dır; kullanıcı dil localStorage'da tr değilse mount'tan ÖNCE
//   tek JSON chunk'ı paralel yüklenir (TR'de 0 gecikme; diğer dillerde bir istek).
const ilkDil = (() => { try { return localStorage.getItem("nur_lang") || "tr"; } catch { return "tr"; } })();

dilSaukle(ilkDil).finally(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
