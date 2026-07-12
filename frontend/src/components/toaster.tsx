"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return <Toaster position="top-right" toastOptions={{ style: { background: "#0f172a", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.08)" } }} />;
}
