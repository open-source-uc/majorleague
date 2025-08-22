"use client";

import { useEffect } from "react";

interface UseImagePreloaderOptions {
  /** Images to preload immediately */
  priority?: string[];
  /** Images to preload after a delay */
  deferred?: string[];
  /** Delay in milliseconds for deferred loading */
  delay?: number;
}

/**
 * Hook to intelligently preload images for better performance
 */
export function useImagePreloader({
  priority = [],
  deferred = [],
  delay = 2000
}: UseImagePreloaderOptions) {
  useEffect(() => {
    // Preload priority images immediately
    priority.forEach(src => {
      if (typeof window !== "undefined") {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        document.head.appendChild(link);
      }
    });

    // Preload deferred images after delay
    const timeoutId = setTimeout(() => {
      deferred.forEach(src => {
        if (typeof window !== "undefined") {
          const img = new Image();
          img.src = src;
        }
      });
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [priority, deferred, delay]);
}
