"use client";

/**
 * Componente de Card para exibir uma categoria
 *
 * Exibe informações da categoria em formato de card
 */

import { ChevronRight, FolderOpen, Layers, Package, Tag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TaxonomyData } from "@/services/api/taxonomy/types/taxonomy-types";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";

interface CategoryCardProps {
  category: TaxonomyData;
  onDelete?: () => void;
}

export function CategoryCardGrid({ category, onDelete }: CategoryCardProps) {
  const router = useRouter();

  // Determinar se é categoria raiz
  const isRoot = category.PARENT_ID === 0 || category.PARENT_ID === null;

  // Formatar informações da categoria
  const categoryLevel = category.LEVEL || 1;
  const productCount = category.QT_RECORDS || 0;

  const handleViewDetails = () => {
    router.push(
      `/dashboard/category/category-details?id=${category.ID_TAXONOMY}`,
    );
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      {/* Imagem da Categoria */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {category.PATH_IMAGEM ? (
          <Image
            src={category.PATH_IMAGEM}
            alt={category.TAXONOMIA}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {/* Badge de Nível no canto superior direito */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="gap-1">
            <Layers className="h-3 w-3" />
            Nível {categoryLevel}
          </Badge>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <CardHeader className="space-y-2">
        {/* Nome da Categoria */}
        <CardTitle className="line-clamp-2 text-lg">
          {category.TAXONOMIA}
        </CardTitle>

        {/* ID da Categoria e Quantidade de Produtos */}
        <CardDescription className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            ID: {category.ID_TAXONOMY}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Informações adicionais */}
        <div className="space-y-2 text-sm">
          {/* Categoria Pai */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Categoria Pai:</span>
            <span className="font-medium">
              {isRoot ? "Raiz" : `ID ${category.PARENT_ID}`}
            </span>
          </div>

          {/* Quantidade de Produtos */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Package className="h-3 w-3" />
              Produtos:
            </span>
            <Badge variant={productCount > 0 ? "default" : "secondary"}>
              {productCount}
            </Badge>
          </div>
        </div>

        {/* Anotações (se houver) */}
        {category.ANOTACOES && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {category.ANOTACOES}
          </p>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1 gap-2"
            onClick={handleViewDetails}
          >
            <ChevronRight className="h-4 w-4" />
            Detalhe
          </Button>
          <DeleteCategoryDialog
            categoryId={category.ID_TAXONOMY}
            categoryName={category.TAXONOMIA}
            onSuccess={onDelete}
            variant="outline"
            size="sm"
            showLabel={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
