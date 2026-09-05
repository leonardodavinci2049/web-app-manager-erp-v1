interface ExtractedPage<Item> {
  items: Item[];
  total: number;
}

interface AccumulatedPagesResult<Item> extends ExtractedPage<Item> {
  /** True when the base page batch itself failed (route shows its error state). */
  hasBaseFailure: boolean;
}

/**
 * Server-side orchestration for "load more" accumulation. Fetches
 * `extraBatches + 1` fixed-size pages (`page..page+extraBatches`) in parallel,
 * concatenates them in order, and deduplicates records through `getId` so
 * ordering stays stable. A failed extra batch is skipped without discarding
 * the valid ones; clicking "Carregar mais" again refetches it. The base page
 * failure is reported through `hasBaseFailure` so the route can keep its
 * existing error state behavior. Never throws.
 */
export async function fetchAccumulatedPages<Page, Item>(
  fetchPage: (page: number) => Promise<Page>,
  page: number,
  extraBatches: number,
  extract: (pageResult: Page) => ExtractedPage<Item>,
  getId: (item: Item) => string | number,
  onBatchError?: (page: number, error: unknown) => void,
): Promise<AccumulatedPagesResult<Item>> {
  const settled = await Promise.allSettled(
    Array.from({ length: extraBatches + 1 }, (_, index) =>
      fetchPage(page + index),
    ),
  );

  const items: Item[] = [];
  const seenIds = new Set<string | number>();
  let total = 0;
  let hasTotal = false;

  settled.forEach((result, index) => {
    if (result.status === "rejected") {
      onBatchError?.(page + index, result.reason);
    }
  });

  for (const result of settled) {
    if (result.status === "rejected") continue;
    const extracted = extract(result.value);
    if (!hasTotal) {
      total = extracted.total;
      hasTotal = true;
    }
    for (const item of extracted.items) {
      const id = getId(item);
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      items.push(item);
    }
  }

  return {
    items,
    total,
    hasBaseFailure: settled[0]?.status === "rejected",
  };
}
