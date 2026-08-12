import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  LockKeyhole,
  Mail,
  MessageCircle,
  Phone,
  Store,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  UICustomerDetail,
  UISellerInfo,
} from "@/services/api-main/customer-general";
import { CustomerImage } from "../../_components/customer-image";
import { CustomerDetailForms } from "./customer-detail-forms";
import { CustomerIdentitySection } from "./customer-identity-section";
import { CustomerPersonBusinessSections } from "./customer-person-business-sections";
import { CustomerPurchases } from "./customer-purchases";
import { CustomerTypeSections } from "./customer-type-sections";
import { RelatedSellerImage } from "./related-seller-image";

interface CustomerDetailsProps {
  customer: UICustomerDetail;
  seller?: UISellerInfo;
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

function RelatedSellerContact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
}) {
  const normalizedValue = value?.trim();

  return (
    <div className="min-w-0 rounded-xl border bg-card p-3">
      <dt className="text-muted-foreground flex items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.16em] uppercase">
        <span className="text-sky-600 dark:text-sky-400">{icon}</span>
        {label}
      </dt>
      <dd
        className={`mt-2 break-words text-sm ${normalizedValue ? "text-foreground" : "text-muted-foreground italic"}`}
      >
        {normalizedValue || "Não informado"}
      </dd>
    </div>
  );
}

export function CustomerDetails({
  customer,
  seller,
  returnTo,
  imageGallery,
  imageContent,
}: CustomerDetailsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(280px,500px)_minmax(0,1fr)]">
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

        <aside className="hidden lg:sticky lg:top-6 lg:row-span-2 lg:row-start-2 lg:block lg:self-start">
          {imageGallery}
        </aside>
        <div className="flex min-w-0 items-start gap-3">
          <CustomerImage
            name={customer.name}
            imagePath={customer.imagePath}
            viewMode="list"
          />
          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold sm:text-2xl">
              {customer.name}
            </h1>
            <div className="text-muted-foreground flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap text-sm">
              <span className="tabular-nums">ID: #{customer.id}</span>
              <Badge variant="secondary">
                {customer.accountStatus || "Status não informado"}
              </Badge>
              <span aria-hidden="true">·</span>
              <span>{customer.accountType || "Tipo Não Informado"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-3 sm:space-y-4">
            <CustomerIdentitySection customer={customer} />

            <CustomerTypeSections
              customerId={customer.id}
              personTypeId={customer.personTypeId}
              customerTypeId={customer.customerTypeId}
              showCustomerType={false}
            />

            <CustomerPersonBusinessSections
              customer={customer}
              personTypeId={customer.personTypeId}
            />

            <CustomerTypeSections
              customerId={customer.id}
              personTypeId={customer.personTypeId}
              customerTypeId={customer.customerTypeId}
              showPersonType={false}
            />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Card className="gap-0 border-muted bg-muted/50 py-0 shadow-none">
              <CardContent className="space-y-3 p-3 sm:p-4">
                {seller ? (
                  <>
                    <div className="rounded-xl border bg-card p-3 sm:p-4">
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <RelatedSellerImage
                          sellerName={seller.name}
                          imagePath={seller.imagePath}
                        />
                        <div className="min-w-0">
                          <p className="text-muted-foreground flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.18em] uppercase">
                            <Store className="size-3.5" aria-hidden="true" />
                            Vendedor #{seller.id}
                          </p>
                          <h3 className="mt-1 break-words text-lg font-semibold sm:text-xl">
                            {seller.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="mt-2 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            <BadgeCheck aria-hidden="true" />
                            Vendedor do cliente
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <dl className="grid gap-2 sm:grid-cols-3">
                      <RelatedSellerContact
                        icon={<Phone className="size-4" aria-hidden="true" />}
                        label="Telefone"
                        value={seller.phone}
                      />
                      <RelatedSellerContact
                        icon={
                          <MessageCircle
                            className="size-4"
                            aria-hidden="true"
                          />
                        }
                        label="WhatsApp"
                        value={seller.whatsapp}
                      />
                      <RelatedSellerContact
                        icon={<Mail className="size-4" aria-hidden="true" />}
                        label="E-mail"
                        value={seller.email}
                      />
                    </dl>
                  </>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-dashed bg-card p-4">
                    <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
                      <Store className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-medium">Vendedor relacionado</h3>
                      <p className="text-muted-foreground text-sm">
                        Nenhum vendedor relacionado a este cliente.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <h2 className="text-base font-semibold sm:text-lg">
          Editar cadastro por seção
        </h2>
        <p className="text-muted-foreground hidden text-sm sm:block">
          Selecione uma seção para consultar e atualizar os dados do cliente.
        </p>
      </div>

      <CustomerDetailForms
        customer={customer}
        imageContent={imageContent}
        mobileImageGallery={imageGallery}
        miscellaneousContent={
          <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="size-4" />
                Cadastro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 sm:px-6">
              <DetailField
                label="Data da última compra"
                value={formatDate(customer.lastPurchase)}
              />
              <DetailField
                label="Data de cadastro"
                value={formatDate(customer.createdAt)}
              />
            </CardContent>
          </Card>
        }
        productsContent={<CustomerPurchases customerId={customer.id} />}
        deletionContent={
          <Card className="gap-4 border-destructive/40 bg-destructive/5 py-4 sm:gap-6 sm:py-6">
            <CardHeader className="flex-row items-center justify-between px-4 sm:px-6">
              <CardTitle className="text-destructive flex items-center gap-2 text-base">
                <LockKeyhole className="size-4" />
                Zona de exclusão
              </CardTitle>
              <Badge variant="secondary">Pendente de API</Badge>
            </CardHeader>
            <CardContent className="space-y-3 px-4 sm:px-6">
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
