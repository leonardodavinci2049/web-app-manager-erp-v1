import { ArrowLeft, CalendarDays, LockKeyhole, Trash2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  UICustomerDetail,
  UISellerInfo,
} from "@/services/api-main/customer-general";
import { CustomerDetailForms } from "./customer-detail-forms";
import { CustomerPurchases } from "./customer-purchases";
import { CustomerHeadDataSection } from "./sections/customer-head-data-section";
import { CustomerIdentitySection } from "./sections/customer-identity-section";
import { CustomerPersonBusinessSections } from "./sections/customer-person-business-sections";
import { CustomerTypeSections } from "./sections/customer-type-sections";
import { RelatedSellerSection } from "./sections/related-seller-section";

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
      <dd className="mt-1 wrap-break-word text-sm font-medium">
        {value === undefined || value === "" ? "Não informado" : value}
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
        <CustomerHeadDataSection customer={customer} />

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
            <RelatedSellerSection seller={seller} />
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
