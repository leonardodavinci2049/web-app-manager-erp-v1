import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UIBrand } from "@/services/api-main/brand/transformers/transformers";
import { BrandImage } from "./brand-image";

interface BrandTableProps {
  brands: UIBrand[];
  buildDetailHref: (brandId: number) => string;
}

/**
 * Tabela de marcas para o modo lista em telas desktop (Server Component).
 * Colunas: Imagem, ID, Marca e Acoes. A acao abre a pagina de detalhes.
 */
export function BrandTable({ brands, buildDetailHref }: BrandTableProps) {
  return (
    <div className="min-w-0 max-w-full rounded-lg border">
      <Table aria-label="Lista de marcas">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-16">Imagem</TableHead>
            <TableHead className="w-24">ID</TableHead>
            <TableHead className="w-56 max-w-[300px] whitespace-normal">
              Marca
            </TableHead>
            <TableHead className="w-16 text-right">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
          {brands.map((brand, index) => (
            <TableRow key={brand.id}>
              <TableCell>
                <BrandImage
                  name={brand.name}
                  imagePath={brand.imagePath}
                  brandId={brand.id}
                  viewMode="list"
                  size="sm"
                  eager={index === 0}
                />
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {brand.id}
              </TableCell>
              <TableCell className="max-w-[300px] whitespace-normal break-words font-medium">
                <Link
                  href={buildDetailHref(brand.id)}
                  className="hover:text-primary focus-visible:outline-none focus-visible:underline"
                >
                  {brand.name}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="icon" variant="ghost">
                  <Link href={buildDetailHref(brand.id)}>
                    <Eye className="size-4" />
                    <span className="sr-only">
                      Ver detalhes da marca {brand.name}
                    </span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
