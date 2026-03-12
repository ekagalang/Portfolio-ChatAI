"use client";

import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const media = window.matchMedia(query);
      const listener = () => onStoreChange();

      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)");
}
