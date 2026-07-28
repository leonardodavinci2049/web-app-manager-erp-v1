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
 * Colunas: Imagem, ID, Marca e Acoes. A acao abre o painel de detalhes.
 */
export function BrandTable({ brands, buildDetailHref }: BrandTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-16">Imagem</TableHead>
            <TableHead className="w-24">ID</TableHead>
            <TableHead className="min-w-48">Marca</TableHead>
            <TableHead className="w-16 text-right">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand, index) => (
            <TableRow key={brand.id}>
              <TableCell>
                <BrandImage
                  name={brand.name}
                  imagePath={brand.imagePath}
                  size="sm"
                  eager={index === 0}
                />
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {brand.id}
              </TableCell>
              <TableCell className="font-medium">
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
