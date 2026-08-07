import {
  ArrowLeft,
  CalendarDays,
  Contact,
  History,
  LockKeyhole,
  Store,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  UICustomerDetail,
  UICustomerLatestProduct,
  UISellerInfo,
} from "@/services/api-main/customer-general";
import { CustomerDetailForms } from "./customer-detail-forms";
import { CustomerImage } from "./customer-image";
import { CustomerTypeSections } from "./customer-type-sections";

interface CustomerDetailsProps {
  customer: UICustomerDetail;
  seller?: UISellerInfo;
  products: UICustomerLatestProduct[];
  hasProductsError: boolean;
  returnTo: string;
  imageGallery: ReactNode;
  imageContent: ReactNode;
}

function formatDate(value?: string): string {
  if (!value) return "Não informada";
  const timestamp = Date.parse(value.replace(" ", "T"));
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(timestamp);
}

function formatCurrency(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium">
        {value === undefined || value === "" ? "Não informado" : value}
      </dd>
    </div>
  );
}

export function CustomerDetails({
  customer,
  seller,
  products,
  hasProductsError,
  returnTo,
  imageGallery,
  imageContent,
}: CustomerDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm lg:col-span-2 lg:justify-self-start"
        >
          <Link href={returnTo}>
            <ArrowLeft className="size-4" />
            Voltar aos clientes
          </Link>
        </Button>

        <aside className="lg:row-span-2 lg:row-start-2 lg:self-start lg:sticky lg:top-6">
          {imageGallery}
        </aside>
        <div className="flex min-w-0 items-start gap-3">
          <CustomerImage
            name={customer.name}
            imagePath={customer.imagePath}
            viewMode="list"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-2xl font-bold">
                {customer.name}
              </h1>
              <Badge variant="secondary">
                {customer.accountStatus || "Status não informado"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm tabular-nums">
              Cliente ID {customer.id}
            </p>
            <p className="text-muted-foreground text-sm">
              {customer.accountType || "Tipo de conta não informado"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Contact className="size-5" />
                  Conta e identificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField label="ID do cliente" value={customer.id} />
                  <DetailField label="ID da loja" value={customer.storeId} />
                  <DetailField
                    label="ID do tipo de cliente"
                    value={customer.customerTypeId}
                  />
                  <DetailField
                    label="ID do tipo de pessoa"
                    value={customer.personTypeId}
                  />
                  <DetailField
                    label="Tipo de conta"
                    value={customer.accountType}
                  />
                  <DetailField
                    label="Também é vendedor"
                    value={customer.sellerFlag === 1 ? "Sim" : "Não"}
                  />
                  <DetailField label="CPF" value={customer.cpf} />
                  <DetailField label="CNPJ" value={customer.cnpj} />
                  <DetailField
                    label="Nome fantasia"
                    value={customer.tradeName}
                  />
                  <DetailField
                    label="Cargo do responsável"
                    value={customer.responsibleRole}
                  />
                  <DetailField
                    label="Data de cadastro"
                    value={formatDate(customer.createdAt)}
                  />
                </dl>
              </CardContent>
            </Card>

            <CustomerTypeSections
              customerId={customer.id}
              personTypeId={customer.personTypeId}
              customerTypeId={customer.customerTypeId}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="size-5" />
                  Produtos recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasProductsError ? (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="font-medium">
                      Não foi possível carregar os produtos recentes.
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Os demais dados do cliente permanecem disponíveis.
                    </p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="font-medium">Nenhum produto recente.</p>
                  </div>
                ) : (
                  <div className="divide-y rounded-lg border">
                    {products.map((product) => (
                      <div
                        key={`${product.movementId}-${product.productId}`}
                        className="flex flex-wrap items-start justify-between gap-3 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{product.product}</p>
                          <p className="text-muted-foreground text-xs">
                            Pedido {product.orderId} · Produto{" "}
                            {product.productId}
                            {product.sku ? ` · SKU ${product.sku}` : ""}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatDate(product.createdAt)}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">
                            {formatCurrency(product.total)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Quantidade: {product.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LockKeyhole className="size-4" />
                  Status do cadastro
                </CardTitle>
                <Badge variant="secondary">Pendente de API</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-xs">
                  A API atual não oferece contratos seguros para ativar ou
                  inativar clientes.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Ativar — Pendente de API
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Inativar — Pendente de API
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Store className="size-4" />
                  Vendedor relacionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {seller ? (
                  <div className="flex items-start gap-3">
                    <CustomerImage
                      name={seller.name}
                      imagePath={seller.imagePath}
                      viewMode="list"
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-medium">{seller.name}</p>
                      <p className="text-muted-foreground text-xs tabular-nums">
                        ID {seller.id}
                      </p>
                      <p className="text-muted-foreground break-all text-xs">
                        {seller.email || seller.whatsapp || seller.phone}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nenhum vendedor relacionado.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="size-4" />
                  Cadastro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DetailField
                  label="Data de cadastro"
                  value={formatDate(customer.createdAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Editar cadastro por seção</h2>
        <p className="text-muted-foreground text-sm">
          Selecione uma seção para consultar e atualizar os dados do cliente.
        </p>
      </div>

      <CustomerDetailForms
        customer={customer}
        imageContent={imageContent}
        addressSummary={
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="size-4" />
                Localização resumida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {[customer.address, customer.addressNumber]
                  .filter(Boolean)
                  .join(", ") || "Endereço não informado"}
              </p>
              <p className="text-muted-foreground text-xs">
                {[customer.neighborhood, customer.city, customer.state]
                  .filter(Boolean)
                  .join(" · ") || "Localidade não informada"}
              </p>
            </CardContent>
          </Card>
        }
        deletionContent={
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-destructive flex items-center gap-2 text-base">
                <LockKeyhole className="size-4" />
                Zona de exclusão
              </CardTitle>
              <Badge variant="secondary">Pendente de API</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                A API atual não oferece um contrato seguro para excluir
                clientes.
              </p>
              <Button type="button" variant="destructive" disabled>
                <Trash2 className="size-4" />
                Excluir — Pendente de API
              </Button>
            </CardContent>
          </Card>
        }
      />
    </div>
  );
}
