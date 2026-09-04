"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

export type MerchantClickSurface = "hero" | "mobile_tray" | "comparison";

type TrackedMerchantLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  trackingToken?: string;
  trackingSurface: MerchantClickSurface;
};

export function TrackedMerchantLink({
  trackingToken,
  trackingSurface,
  onClick,
  ...props
}: TrackedMerchantLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || !trackingToken) return;

    void fetch("/api/analytics/merchant-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: trackingToken, surface: trackingSurface }),
      keepalive: true,
    }).catch(() => undefined);
  }

  return <a {...props} onClick={handleClick} />;
}
