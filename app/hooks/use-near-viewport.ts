"use client";

import { useEffect, useRef, useState } from "react";

export function useNearViewport<T extends Element>() {
  const elementRef = useRef<T>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || isNearViewport) return;

    if (!("IntersectionObserver" in window)) {
      const timer = setTimeout(() => setIsNearViewport(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isNearViewport]);

  return { elementRef, isNearViewport };
}
