"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { buildCategoryQuery } from "../_utils/category-query";

export function useCategoryQueryNavigation() {
  const router = useRouter();
  return useCallback(
    (updates: Record<string, string | undefined>) => {
      const query = buildCategoryQuery(updates, window.location.search);
      router.push(
        query
          ? `${window.location.pathname}?${query}`
          : window.location.pathname,
      );
    },
    [router],
  );
}
