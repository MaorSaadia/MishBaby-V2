"use client";

import { useEffect } from "react";
import { ErrorState } from "./components/error-state";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("MishBaby page rendering failed", error);
  }, [error]);

  return <ErrorState onRetry={retry} />;
}
