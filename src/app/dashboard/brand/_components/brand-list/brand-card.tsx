import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { BrandViewMode } from "../types/brand-dashboard-types";
import { BrandImage } from "./brand-image";

interface BrandCardProps {
  brandId: number;
  brandName: string;
  imagePath?: string;
  viewMode: BrandViewMode;
  detailHref: string;
  eager?: boolean;
}

/**
 * Card de marca (Server Component). Apresenta imagem/fallback, nome e ID. No
 * modo lista e' um card horizontal; no modo grid e' um card vertical. Toda a
 * area e' um link acessivel para o painel de detalhes.
 */
export function BrandCard({
  brandId,
  brandName,
  imagePath,
  viewMode,
  detailHref,
  eager = false,
}: BrandCardProps) {
  if (viewMode === "list") {
    return (
      <Link href={detailHref} className="block focus-visible:outline-none">
        <Card className="gap-0 py-0 transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring">
          <CardContent className="flex items-center gap-3 p-2 sm:p-2.5">
            <BrandImage
              name={brandName}
              imagePath={imagePath}
              size="md"
              eager={eager}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{brandName}</span>
              <span className="text-muted-foreground text-xs">
                ID: {brandId}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={detailHref} className="block focus-visible:outline-none">
      <Card className="group h-full gap-2 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring">
        <CardContent className="flex h-full flex-col items-center gap-2 p-2 text-center">
          <BrandImage
            name={brandName}
            imagePath={imagePath}
            size="lg"
            className="h-20 w-20 rounded-lg text-lg"
            eager={eager}
          />
          <div className="flex min-h-0 flex-1 flex-col gap-0.5">
            <span className="line-clamp-2 text-sm font-medium">
              {brandName}
            </span>
            <span className="text-muted-foreground text-xs">ID: {brandId}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
