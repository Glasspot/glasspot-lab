"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Registra page_view una vez por pantalla montada. */
export function PageViewTracker({ page, product }: { page: string; product?: string }) {
  useEffect(() => {
    track("page_view", { page, product });
  }, [page, product]);
  return null;
}
