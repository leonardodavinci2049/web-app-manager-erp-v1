import { Boxes, Eye, SearchX, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UIPtype } from "@/services/api-main/ptype";
import { buildPtypeDetailHref } from "./lib/search-params";
import { PtypeImage } from "./ptype-image";
import { PtypePagination } from "./ptype-pagination";
import type {
  PtypeSearchParams,
  PtypeViewMode,
} from "./types/ptype-dashboard-types";

interface PtypeCollectionProps {
  items: UIPtype[];
  total: number;
  searchState: PtypeSearchParams;
  viewMode: PtypeViewMode;
  hasLoadError: boolean;
}

export function PtypeCollection({
  items,
  total,
  searchState,
  viewMode,
  hasLoadError,
}: PtypeCollectionProps) {
  const detailHref = (ptypeId: number) =>
    buildPtypeDetailHref(ptypeId, searchState);

  if (hasLoadError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <TriangleAlert className="text-destructive mb-4 size-14" />
        <h2 className="text-lg font-semibold">
          Não foi possível carregar os tipos de produtos
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Atualize a página para tentar novamente. Os filtros atuais foram
          preservados na URL.
        </p>
      </div>
    );
  }

  if (total === 0) {
    const hasFilters =
      searchState.search !== "" || searchState.status !== "all";
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {hasFilters ? (
          <SearchX className="text-muted-foreground mb-4 size-14" />
        ) : (
          <Boxes className="text-muted-foreground mb-4 size-14" />
        )}
        <h2 className="text-lg font-semibold">
          {hasFilters
            ? "Nenhum tipo de produto encontrado"
            : "Nenhum tipo de produto cadastrado"}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          {hasFilters
            ? "Revise a pesquisa ou os filtros e tente novamente."
            : "Use a ação “Adicionar tipo” para criar o primeiro cadastro."}
        </p>
      </div>
    );
  }

  const pageStart = searchState.page * searchState.limit + 1;
  const pageEnd = Math.min((searchState.page + 1) * searchState.limit, total);

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <SearchX className="text-muted-foreground mx-auto mb-3 size-10" />
          <p className="font-medium">Esta página não possui registros.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Retorne a uma página anterior usando a paginação.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-3 lg:gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group h-full gap-3 py-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardContent className="flex h-full flex-col gap-3 px-3 text-center">
                <PtypeImage
                  name={item.name}
                  imagePath={item.imagePath}
                  viewMode="grid"
                />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium">
                    {item.name}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                    ID: {item.id}
                  </p>
                </div>
                <Button asChild size="sm" className="mt-auto w-full gap-1">
                  <Link href={detailHref(item.id)}>
                    <Eye className="size-3.5" />
                    <span className="sm:hidden">Detalhes</span>
                    <span className="hidden sm:inline">Ver detalhes</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2 lg:hidden">
            {items.map((item) => (
              <Card
                key={item.id}
                className="gap-0 py-0 transition-shadow hover:shadow-md"
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <PtypeImage
                    name={item.name}
                    imagePath={item.imagePath}
                    viewMode="list"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      ID: {item.id}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="ml-auto gap-1 self-center"
                  >
                    <Link href={detailHref(item.id)}>
                      <Eye className="size-4" />
                      <span className="sm:hidden">Detalhes</span>
                      <span className="hidden sm:inline">Ver detalhes</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden min-w-0 max-w-full rounded-xl border lg:block">
            <Table aria-label="Lista de tipos de produtos">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-14">Imagem</TableHead>
                  <TableHead className="w-28">ID</TableHead>
                  <TableHead className="w-56 max-w-[300px] whitespace-normal">
                    Tipo de produto
                  </TableHead>
                  <TableHead className="w-20 text-right">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <PtypeImage
                        name={item.name}
                        imagePath={item.imagePath}
                        viewMode="list"
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {item.id}
                    </TableCell>
                    <TableCell className="max-w-[300px] whitespace-normal break-words font-medium">
                      <Link
                        href={detailHref(item.id)}
                        className="hover:text-primary focus-visible:underline focus-visible:outline-none"
                      >
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={detailHref(item.id)}>
                          <Eye className="size-4" />
                          <span className="sr-only">
                            Ver detalhes de {item.name}
                          </span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <div className="flex flex-col items-center gap-3 pt-2">
        <p className="text-muted-foreground text-xs tabular-nums">
          Exibindo {Math.min(pageStart, total)}–{pageEnd} de {total}{" "}
          {total === 1 ? "tipo" : "tipos"}
        </p>
        <PtypePagination
          currentPage={searchState.page}
          total={total}
          pageSize={searchState.limit}
        />
      </div>
    </div>
  );
}
