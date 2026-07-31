import {
  CalendarClock,
  Eye,
  Mail,
  MapPin,
  Phone,
  SearchX,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
import type { UISellerListItem } from "@/services/api-main/seller";
import { buildSellerDetailHref } from "./lib/search-params";
import { SellerImage } from "./seller-image";
import { SellerPagination } from "./seller-pagination";
import type {
  SellerSearchParams,
  SellerViewMode,
} from "./types/seller-dashboard-types";

interface SellerCollectionProps {
  items: UISellerListItem[];
  total: number;
  searchState: SellerSearchParams;
  viewMode: SellerViewMode;
  hasLoadError: boolean;
}

function getDocument(seller: UISellerListItem): string {
  return seller.cnpj || seller.cpf || "Não informado";
}

function getPhone(seller: UISellerListItem): string {
  return seller.whatsapp || seller.phone || "Não informado";
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(timestamp);
}

function SellerCard({
  seller,
  href,
  viewMode,
}: {
  seller: UISellerListItem;
  href: string;
  viewMode: SellerViewMode;
}) {
  const horizontal = viewMode === "list";
  return (
    <Card className="group h-full gap-0 py-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent
        className={
          horizontal
            ? "flex items-start gap-3 p-3"
            : "flex h-full flex-col gap-3 p-3 sm:p-4"
        }
      >
        <SellerImage
          name={seller.name}
          imagePath={seller.imagePath}
          viewMode={viewMode}
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="line-clamp-2 font-semibold">{seller.name}</p>
            <p className="text-muted-foreground text-xs tabular-nums">
              ID: {seller.id} · {seller.personType || "Tipo não informado"}
            </p>
            {seller.legalName && (
              <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                {seller.legalName}
              </p>
            )}
          </div>
          <div
            className={
              horizontal
                ? "hidden gap-2 text-xs sm:grid sm:grid-cols-2"
                : "grid gap-2 text-xs [&>*:nth-child(n+3)]:hidden"
            }
          >
            <p className="flex items-center gap-2 truncate">
              <Phone className="text-muted-foreground size-3.5 shrink-0" />
              {getPhone(seller)}
            </p>
            <p className="flex items-center gap-2 truncate">
              <Mail className="text-muted-foreground size-3.5 shrink-0" />
              {seller.email || "E-mail não informado"}
            </p>
            <p className="flex items-center gap-2 truncate">
              <MapPin className="text-muted-foreground size-3.5 shrink-0" />
              {seller.city || "Cidade não informada"}
            </p>
            <p className="flex items-center gap-2 truncate">
              <CalendarClock className="text-muted-foreground size-3.5 shrink-0" />
              Última compra: {formatDate(seller.lastPurchaseAt)}
            </p>
          </div>
          {!horizontal && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {seller.customerType || "Categoria não informada"}
              </Badge>
              <Badge variant="outline">{getDocument(seller)}</Badge>
            </div>
          )}
        </div>
        <Button
          asChild
          size="sm"
          variant={horizontal ? "ghost" : undefined}
          className={
            horizontal ? "ml-auto gap-1 self-center" : "mt-0.5 w-full gap-1"
          }
        >
          <Link href={href}>
            <Eye className={horizontal ? "size-4" : "size-3.5"} />
            <span className="sm:hidden">Detalhes</span>
            <span className="hidden sm:inline">Ver detalhes</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function SellerCollection({
  items,
  total,
  searchState,
  viewMode,
  hasLoadError,
}: SellerCollectionProps) {
  if (hasLoadError) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <TriangleAlert className="text-destructive mb-4 size-14" />
        <h2 className="text-lg font-semibold">
          Não foi possível carregar os vendedores
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Atualize a página para tentar novamente. Os filtros foram preservados.
        </p>
      </div>
    );
  }

  if (total === 0) {
    const hasFilters =
      searchState.search !== "" ||
      searchState.category !== 0 ||
      searchState.noImage ||
      searchState.status !== "all";
    return (
      <div className="flex flex-col items-center py-16 text-center">
        {hasFilters ? (
          <SearchX className="text-muted-foreground mb-4 size-14" />
        ) : (
          <UserRound className="text-muted-foreground mb-4 size-14" />
        )}
        <h2 className="text-lg font-semibold">
          {hasFilters
            ? "Nenhum vendedor encontrado"
            : "Nenhum vendedor cadastrado"}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          {hasFilters
            ? "Revise a pesquisa ou os filtros e tente novamente."
            : "A criação de vendedores está pendente de suporte pela API."}
        </p>
      </div>
    );
  }

  const detailHref = (id: number) => buildSellerDetailHref(id, searchState);
  const pageStart = searchState.page * searchState.limit + 1;
  const pageEnd = Math.min((searchState.page + 1) * searchState.limit, total);

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <SearchX className="text-muted-foreground mx-auto mb-3 size-10" />
          <p className="font-medium">Esta página não possui registros.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-3 lg:gap-4">
          {items.map((seller) => (
            <SellerCard
              key={seller.id}
              seller={seller}
              href={detailHref(seller.id)}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2 lg:hidden">
            {items.map((seller) => (
              <SellerCard
                key={seller.id}
                seller={seller}
                href={detailHref(seller.id)}
                viewMode="list"
              />
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-xl border lg:block">
            <Table aria-label="Lista de vendedores">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-16">Imagem</TableHead>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead className="min-w-52">Vendedor</TableHead>
                  <TableHead className="min-w-36">Categoria</TableHead>
                  <TableHead className="min-w-40">Documento</TableHead>
                  <TableHead className="min-w-40">Telefone/WhatsApp</TableHead>
                  <TableHead className="min-w-40">Cidade</TableHead>
                  <TableHead className="min-w-36">Última compra</TableHead>
                  <TableHead className="w-16">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell>
                      <SellerImage
                        name={seller.name}
                        imagePath={seller.imagePath}
                        viewMode="list"
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {seller.id}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={detailHref(seller.id)}
                        className="font-medium hover:text-primary focus-visible:underline focus-visible:outline-none"
                      >
                        {seller.name}
                      </Link>
                      <p className="text-muted-foreground max-w-64 truncate text-xs">
                        {seller.email || seller.legalName || "Sem complemento"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {seller.customerType || "Não informada"}
                    </TableCell>
                    <TableCell>{getDocument(seller)}</TableCell>
                    <TableCell>{getPhone(seller)}</TableCell>
                    <TableCell>{seller.city || "Não informada"}</TableCell>
                    <TableCell>{formatDate(seller.lastPurchaseAt)}</TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon">
                        <Link href={detailHref(seller.id)}>
                          <Eye className="size-4" />
                          <span className="sr-only">
                            Ver detalhes de {seller.name}
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
          {total === 1 ? "vendedor" : "vendedores"}
        </p>
        <SellerPagination
          currentPage={searchState.page}
          total={total}
          pageSize={searchState.limit}
        />
      </div>
    </div>
  );
}
