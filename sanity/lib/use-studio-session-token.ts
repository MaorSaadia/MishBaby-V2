"use client";

import { useEffect, useState } from "react";
import { useSource } from "sanity";

export type StudioSessionToken = string | null | undefined;

/**
 * Subscribes to the active Studio user's token.
 * `undefined` means authentication is initializing; `null` means no token exists.
 */
export function useStudioSessionToken(): StudioSessionToken {
  const tokenStream = useSource().auth.token;
  const [token, setToken] = useState<StudioSessionToken>(() =>
    tokenStream ? undefined : null,
  );

  useEffect(() => {
    if (!tokenStream) return;

    const subscription = tokenStream.subscribe({
      next: (nextToken) => setToken(nextToken),
      error: () => setToken(null),
    });

    return () => subscription.unsubscribe();
  }, [tokenStream]);

  return token;
}
