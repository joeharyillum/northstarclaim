"use client";

import { useEffect } from "react";

export default function CopyProtection() {
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();

    document.addEventListener("contextmenu", prevent);
    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+U (view source), Ctrl+S (save), Ctrl+Shift+I (devtools), Ctrl+Shift+J (console)
      if (
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "s") ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        e.key === "F12"
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
