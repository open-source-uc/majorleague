"use client";

import { useImagePreloader } from "@/hooks/useImagePreloader";

interface ImagePreloaderProps {
  /** Team logos that are commonly visited */
  teamLogos?: string[];
  /** Hero images or other priority images */
  heroImages?: string[];
}

/**
 * Component to preload important images for better performance
 */
export default function ImagePreloader({ 
  teamLogos = [],
  heroImages = []
}: ImagePreloaderProps) {
  useImagePreloader({
    priority: heroImages,
    deferred: teamLogos,
    delay: 1500
  });

  return null; // This component doesn't render anything
}
