"use client";

import { useEffect } from "react";
import { ErrorState } from "./components/error-state";
import "./globals.css";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("MishBaby root rendering failed", error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <title>MishBaby is temporarily unavailable</title>
        <main>
          <ErrorState onRetry={retry} fullPage />
        </main>
      </body>
    </html>
  );
}
