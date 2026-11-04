"use client";

import { useEffect } from "react";

export function RegistrasiSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((e) => console.error("[sw] gagal mendaftar", e));
  }, []);
  return null;
}
