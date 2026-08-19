import { Eye, Mail, Phone, SearchX, TriangleAlert, Truck } from "lucide-react";
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
import type { UICarrier } from "@/services/api-main/carrier";
import { CarrierImage } from "./carrier-image";
import { CarrierPagination } from "./carrier-pagination";
import { buildCarrierDetailHref } from "./lib/search-params";
import type {
  CarrierSearchParams,
  CarrierViewMode,
} from "./types/carrier-dashboard-types";

interface CarrierCollectionProps {
  items: UICarrier[];
  total: number;
  searchState: CarrierSearchParams;
  viewMode: CarrierViewMode;
  hasLoadError: boolean;
}

function getDocument(carrier: UICarrier): string {
  return carrier.cnpj || carrier.cpf || "Não informado";
}

function getPhone(carrier: UICarrier): string {
  return carrier.whatsapp || carrier.phone || "Não informado";
}

function CarrierCard({
  carrier,
  href,
  viewMode,
}: {
  carrier: UICarrier;
  href: string;
  viewMode: CarrierViewMode;
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
        <CarrierImage
          name={carrier.name}
          imagePath={carrier.imagePath}
          carrierId={carrier.id}
          viewMode={viewMode}
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="line-clamp-2 font-semibold">{carrier.name}</p>
            <p className="text-muted-foreground text-xs tabular-nums">
              ID: {carrier.id} · {carrier.typePerson || "Tipo não informado"}
            </p>
            {carrier.companyName && (
              <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                {carrier.companyName}
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
            <p className="truncate">Documento: {getDocument(carrier)}</p>
            <p className="flex items-center gap-2 truncate">
              <Phone className="text-muted-foreground size-3.5 shrink-0" />
              {getPhone(carrier)}
            </p>
            <p className="flex items-center gap-2 truncate">
              <Mail className="text-muted-foreground size-3.5 shrink-0" />
              {carrier.email || "E-mail não informado"}
            </p>
          </div>
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

export function CarrierCollection({
  items,
  total,
  searchState,
  viewMode,
  hasLoadError,
}: CarrierCollectionProps) {
  if (hasLoadError) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <TriangleAlert className="text-destructive mb-4 size-14" />
        <h2 className="text-lg font-semibold">
          Não foi possível carregar as transportadoras
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
          <Truck className="text-muted-foreground mb-4 size-14" />
        )}
        <h2 className="text-lg font-semibold">
          {hasFilters
            ? "Nenhuma transportadora encontrada"
            : "Nenhuma transportadora cadastrada"}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          {hasFilters
            ? "Revise a pesquisa ou os filtros e tente novamente."
            : "Use a ação “Adicionar transportadora” para iniciar o cadastro."}
        </p>
      </div>
    );
  }

  const detailHref = (id: number) => buildCarrierDetailHref(id, searchState);
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
          {items.map((carrier) => (
            <CarrierCard
              key={carrier.id}
              carrier={carrier}
              href={detailHref(carrier.id)}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2 lg:hidden">
            {items.map((carrier) => (
              <CarrierCard
                key={carrier.id}
                carrier={carrier}
                href={detailHref(carrier.id)}
                viewMode="list"
              />
            ))}
          </div>
          <div className="hidden min-w-0 max-w-full rounded-xl border lg:block">
            <Table aria-label="Lista de transportadoras">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-14">Imagem</TableHead>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead className="w-56 max-w-[300px] whitespace-normal">
                    Transportadora
                  </TableHead>
                  <TableHead className="w-24">Tipo</TableHead>
                  <TableHead className="w-32">Documento</TableHead>
                  <TableHead className="w-36">Telefone/WhatsApp</TableHead>
                  <TableHead className="w-48">E-mail</TableHead>
                  <TableHead className="w-16">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
                {items.map((carrier) => (
                  <TableRow key={carrier.id}>
                    <TableCell>
                      <CarrierImage
                        name={carrier.name}
                        imagePath={carrier.imagePath}
                        carrierId={carrier.id}
                        viewMode="list"
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {carrier.id}
                    </TableCell>
                    <TableCell className="max-w-[300px] whitespace-normal break-words">
                      <Link
                        href={detailHref(carrier.id)}
                        className="font-medium hover:text-primary focus-visible:underline focus-visible:outline-none"
                      >
                        {carrier.name}
                      </Link>
                      {carrier.companyName && (
                        <p className="text-muted-foreground max-w-[300px] truncate text-xs">
                          {carrier.companyName}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{carrier.typePerson || "—"}</TableCell>
                    <TableCell>{getDocument(carrier)}</TableCell>
                    <TableCell>{getPhone(carrier)}</TableCell>
                    <TableCell>
                      <p className="max-w-52 truncate">
                        {carrier.email || "Não informado"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon">
                        <Link href={detailHref(carrier.id)}>
                          <Eye className="size-4" />
                          <span className="sr-only">
                            Ver detalhes de {carrier.name}
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
          {total === 1 ? "transportadora" : "transportadoras"}
        </p>
        <CarrierPagination
          currentPage={searchState.page}
          total={total}
          pageSize={searchState.limit}
        />
      </div>
    </div>
  );
}
