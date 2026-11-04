import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";
import "./index.css";

// Registro automático del Service Worker PWA con detección de actualizaciones
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("[PWA] Nueva versión disponible en el servidor.");
  },
  onOfflineReady() {
    console.log("[PWA] Sistema listo para operar offline en terminal.");
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
