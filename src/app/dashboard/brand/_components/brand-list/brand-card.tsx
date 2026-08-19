import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
 * modo lista e' um card horizontal; no modo grid e' um card vertical. A
 * navegacao para os detalhes ocorre apenas pelo botao "Ver detalhes".
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
      <Card className="gap-0 py-0 transition-all duration-200 hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-2 sm:p-2.5">
          <BrandImage
            name={brandName}
            imagePath={imagePath}
            brandId={brandId}
            viewMode="list"
            eager={eager}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{brandName}</span>
            <span className="text-muted-foreground text-xs">ID: {brandId}</span>
          </div>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="ml-auto gap-1 self-center"
          >
            <Link href={detailHref}>
              <Eye className="size-4" />
              <span className="sm:hidden">Detalhes</span>
              <span className="hidden sm:inline">Ver detalhes</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group h-full gap-2 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-2 p-2 text-center">
        <BrandImage
          name={brandName}
          imagePath={imagePath}
          brandId={brandId}
          viewMode="grid"
          eager={eager}
        />
        <div className="flex min-h-0 flex-1 flex-col gap-0.5">
          <span className="line-clamp-2 text-sm font-medium">{brandName}</span>
          <span className="text-muted-foreground text-xs">ID: {brandId}</span>
        </div>
        <Button asChild size="sm" className="mt-0.5 w-full gap-1">
          <Link href={detailHref}>
            <Eye className="size-3.5" />
            <span className="sm:hidden">Detalhes</span>
            <span className="hidden sm:inline">Ver detalhes</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
