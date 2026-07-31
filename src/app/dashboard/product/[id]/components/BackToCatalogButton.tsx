"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const CATALOG_HREF = "/dashboard/catalog";
const VALID_RETURN_PATHNAMES = ["/dashboard/catalog", "/dashboard"];

function getSafeCatalogHref(returnTo: string | null): string {
  if (!returnTo) {
    return CATALOG_HREF;
  }

  try {
    const url = new URL(returnTo, window.location.origin);

    if (
      url.origin !== window.location.origin ||
      !VALID_RETURN_PATHNAMES.includes(url.pathname)
    ) {
      return CATALOG_HREF;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return CATALOG_HREF;
  }
}

/**
 * BackToCatalogButton Component (Client Component)
 *
 * Navigates back to the product catalog while preserving URL filters when the
 * user came from a filtered catalog listing.
 */
export function BackToCatalogButton() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBackToCatalog = () => {
    router.push(getSafeCatalogHref(searchParams.get("returnTo")));
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
      onClick={handleBackToCatalog}
    >
      <ArrowLeft className="size-4" />
      Voltar ao Catálogo
    </Button>
  );
}
