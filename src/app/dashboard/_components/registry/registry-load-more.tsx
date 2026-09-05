"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  ACCUM_PARAM_NAME,
  MAX_REGISTRY_EXTRA_BATCHES,
} from "./registry-page-limits";

interface RegistryLoadMoreProps {
  /** Records currently rendered on the listing. */
  displayed: number;
  /** Total records reported by the service for the current query. */
  total: number;
  /** Visible button label while more batches are available. */
  label?: string;
}

/**
 * Client island that appends the next fixed-size batch of the current query by
 * incrementing the `accum` URL parameter. The server refetches pages
 * `page..page+accum` and re-renders the accumulated collection, so previously
 * displayed records are preserved. Numbered pagination resets `accum` to zero.
 */
export function RegistryLoadMore({
  displayed,
  total,
  label = "Carregar mais registros",
}: RegistryLoadMoreProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const rawAccum = Number(searchParams.get(ACCUM_PARAM_NAME));
  const accum = Number.isSafeInteger(rawAccum) && rawAccum > 0 ? rawAccum : 0;

  if (displayed >= total) return null;

  const atBatchCap = accum >= MAX_REGISTRY_EXTRA_BATCHES;

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(ACCUM_PARAM_NAME, String(accum + 1));
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="outline"
        size="lg"
        onClick={handleClick}
        disabled={isPending || atBatchCap}
        className="min-w-[200px]"
        aria-live="polite"
      >
        {isPending
          ? "Carregando..."
          : atBatchCap
            ? "Limite de registros carregados"
            : label}
      </Button>
      {atBatchCap && (
        <p className="text-muted-foreground text-xs">
          Use a paginação para navegar pelos demais registros.
        </p>
      )}
    </div>
  );
}
