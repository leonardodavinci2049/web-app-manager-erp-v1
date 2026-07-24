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
    <Button variant="outline" onClick={handleBackToCatalog}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Voltar ao Catálogo
    </Button>
  );
}
