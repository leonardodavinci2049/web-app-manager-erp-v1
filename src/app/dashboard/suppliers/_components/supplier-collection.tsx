import {
  Building2,
  CalendarDays,
  Eye,
  Hash,
  Mail,
  MapPin,
  Phone,
  SearchX,
  TriangleAlert,
} from "lucide-react";
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
import type { UISupplier } from "@/services/api-main/supplier";
import { buildSupplierDetailHref } from "./lib/search-params";
import { SupplierImage } from "./supplier-image";
import { SupplierPagination } from "./supplier-pagination";
import type {
  SupplierSearchParams,
  SupplierViewMode,
} from "./types/supplier-dashboard-types";

interface SupplierCollectionProps {
  items: UISupplier[];
  total: number;
  searchState: SupplierSearchParams;
  viewMode: SupplierViewMode;
  hasLoadError: boolean;
}

function formatDate(value?: string): string {
  if (!value) return "Sem compras";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR").format(timestamp);
}

function getDocument(supplier: UISupplier): string {
  return supplier.cnpj || supplier.cpf || "Não informado";
}

function getLocation(supplier: UISupplier): string {
  if (supplier.city && supplier.state)
    return `${supplier.city}/${supplier.state}`;
  return supplier.city || supplier.state || "Não informada";
}

function getContact(supplier: UISupplier): string {
  return (
    supplier.whatsapp || supplier.phone || supplier.email || "Não informado"
  );
}

function SupplierCard({
  supplier,
  href,
  viewMode,
}: {
  supplier: UISupplier;
  href: string;
  viewMode: SupplierViewMode;
}) {
  const horizontal = viewMode === "list";
  return (
    <Link href={href} className="block h-full focus-visible:outline-none">
      <Card className="h-full gap-0 py-0 transition-all hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-ring">
        <CardContent
          className={
            horizontal
              ? "flex items-start gap-3 p-3"
              : "flex h-full flex-col gap-3 p-3 sm:p-4"
          }
        >
          <SupplierImage name={supplier.name} size="sm" />
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="line-clamp-2 font-semibold">{supplier.name}</p>
              <p className="text-muted-foreground text-xs tabular-nums">
                ID: {supplier.id}
              </p>
              {supplier.legalName && (
                <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                  {supplier.legalName}
                </p>
              )}
            </div>
            <dl
              className={
                horizontal
                  ? "hidden text-xs sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2"
                  : "grid gap-2 text-xs [&>*:nth-child(n+3)]:hidden"
              }
            >
              <div className="flex min-w-0 items-center gap-2">
                <Hash className="text-muted-foreground size-3.5 shrink-0" />
                <dd className="truncate">{getDocument(supplier)}</dd>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <MapPin className="text-muted-foreground size-3.5 shrink-0" />
                <dd className="truncate">{getLocation(supplier)}</dd>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                {supplier.email && !supplier.whatsapp && !supplier.phone ? (
                  <Mail className="text-muted-foreground size-3.5 shrink-0" />
                ) : (
                  <Phone className="text-muted-foreground size-3.5 shrink-0" />
                )}
                <dd className="truncate">{getContact(supplier)}</dd>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <CalendarDays className="text-muted-foreground size-3.5 shrink-0" />
                <dd className="truncate">
                  Última compra: {formatDate(supplier.lastPurchaseAt)}
                </dd>
              </div>
            </dl>
          </div>
          {horizontal && (
            <Eye className="text-muted-foreground mt-3 size-4 shrink-0" />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function SupplierCollection({
  items,
  total,
  searchState,
  viewMode,
  hasLoadError,
}: SupplierCollectionProps) {
  if (hasLoadError) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <TriangleAlert className="text-destructive mb-4 size-14" />
        <h2 className="text-lg font-semibold">
          Não foi possível carregar os fornecedores
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Atualize a página para tentar novamente. Os filtros foram preservados.
        </p>
      </div>
    );
  }

  if (total === 0) {
    const hasFilters =
      searchState.search !== "" || searchState.status !== "all";
    return (
      <div className="flex flex-col items-center py-16 text-center">
        {hasFilters ? (
          <SearchX className="text-muted-foreground mb-4 size-14" />
        ) : (
          <Building2 className="text-muted-foreground mb-4 size-14" />
        )}
        <h2 className="text-lg font-semibold">
          {hasFilters
            ? "Nenhum fornecedor encontrado"
            : "Nenhum fornecedor cadastrado"}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          {hasFilters
            ? "Revise a pesquisa ou os filtros e tente novamente."
            : "Use a ação “Adicionar fornecedor” para iniciar o cadastro."}
        </p>
      </div>
    );
  }

  const detailHref = (supplierId: number) =>
    buildSupplierDetailHref(supplierId, searchState);
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
          {items.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              href={detailHref(supplier.id)}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2 lg:hidden">
            {items.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                href={detailHref(supplier.id)}
                viewMode="list"
              />
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-xl border lg:block">
            <Table aria-label="Lista de fornecedores">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead className="min-w-56">Fornecedor</TableHead>
                  <TableHead className="min-w-40">Documento</TableHead>
                  <TableHead className="min-w-40">Cidade/UF</TableHead>
                  <TableHead className="min-w-48">Contato</TableHead>
                  <TableHead className="min-w-36">Última compra</TableHead>
                  <TableHead className="w-16">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {supplier.id}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={detailHref(supplier.id)}
                        className="font-medium hover:text-primary focus-visible:underline focus-visible:outline-none"
                      >
                        {supplier.name}
                      </Link>
                      {supplier.legalName && (
                        <p className="text-muted-foreground max-w-64 truncate text-xs">
                          {supplier.legalName}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{getDocument(supplier)}</TableCell>
                    <TableCell>{getLocation(supplier)}</TableCell>
                    <TableCell>
                      <p className="max-w-52 truncate">
                        {getContact(supplier)}
                      </p>
                    </TableCell>
                    <TableCell>{formatDate(supplier.lastPurchaseAt)}</TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon">
                        <Link href={detailHref(supplier.id)}>
                          <Eye className="size-4" />
                          <span className="sr-only">
                            Ver detalhes de {supplier.name}
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
          {total === 1 ? "fornecedor" : "fornecedores"}
        </p>
        <SupplierPagination
          currentPage={searchState.page}
          total={total}
          pageSize={searchState.limit}
        />
      </div>
    </div>
  );
}
