import {
  Building2,
  CalendarDays,
  Contact,
  MapPin,
  UserRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UIOrdersManagerCustomer } from "@/services/api-main/order_manager";
import { OrderDetailField } from "../detail-field";
import { formatOrderDateTime } from "../lib/format";

function EmptyCustomerState() {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        <UserRound
          className="text-muted-foreground mx-auto size-9"
          aria-hidden="true"
        />
        <p className="mt-3 font-medium">Cliente não informado.</p>
        <p className="text-muted-foreground mt-1 text-sm">
          O endpoint não retornou os dados do cliente deste pedido.
        </p>
      </CardContent>
    </Card>
  );
}

export function OrderCustomerSection({
  customer,
}: {
  customer: UIOrdersManagerCustomer | null;
}) {
  if (!customer) return <EmptyCustomerState />;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="size-4" aria-hidden="true" />
            Identificação
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <OrderDetailField label="ID do cliente">
              {customer.customerId}
            </OrderDetailField>
            <OrderDetailField label="Nome" className="sm:col-span-2">
              {customer.name}
            </OrderDetailField>
            <OrderDetailField label="Razão social" className="sm:col-span-2">
              {customer.legalName}
            </OrderDetailField>
            <OrderDetailField label="Nome fantasia" className="sm:col-span-2">
              {customer.tradeName}
            </OrderDetailField>
            <OrderDetailField label="CPF">{customer.cpf}</OrderDetailField>
            <OrderDetailField label="RG">{customer.rg}</OrderDetailField>
            <OrderDetailField label="CNPJ">{customer.cnpj}</OrderDetailField>
            <OrderDetailField label="Inscrição estadual">
              {customer.stateRegistration}
            </OrderDetailField>
            <OrderDetailField label="Inscrição municipal">
              {customer.municipalRegistration}
            </OrderDetailField>
          </dl>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <Contact className="size-4" aria-hidden="true" />
              Contato e situação
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <OrderDetailField label="Telefone">
                {customer.phone}
              </OrderDetailField>
              <OrderDetailField label="WhatsApp">
                {customer.whatsapp}
              </OrderDetailField>
              <OrderDetailField label="E-mail" className="sm:col-span-2">
                {customer.email}
              </OrderDetailField>
              <OrderDetailField label="Tipo de conta">
                {customer.accountType}
              </OrderDetailField>
              <OrderDetailField label="Situação da conta">
                {customer.accountStatus}
              </OrderDetailField>
              <OrderDetailField label="ID do tipo de pessoa">
                {customer.personTypeId}
              </OrderDetailField>
              <OrderDetailField label="ID do tipo de cliente">
                {customer.customerTypeId}
              </OrderDetailField>
            </dl>
          </CardContent>
        </Card>

        <Card className="gap-4 py-4 sm:gap-6 sm:py-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4" aria-hidden="true" />
              Datas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <OrderDetailField label="Cadastro">
                {formatOrderDateTime(customer.createdAt)}
              </OrderDetailField>
              <OrderDetailField label="Última compra">
                {formatOrderDateTime(customer.lastPurchaseAt)}
              </OrderDetailField>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-4 py-4 sm:gap-6 sm:py-6 lg:col-span-2">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="size-4" aria-hidden="true" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <OrderDetailField label="CEP">
              {customer.postalCode}
            </OrderDetailField>
            <OrderDetailField label="País">{customer.country}</OrderDetailField>
            <OrderDetailField label="Endereço" className="sm:col-span-2">
              {customer.address}
            </OrderDetailField>
            <OrderDetailField label="Número">
              {customer.addressNumber}
            </OrderDetailField>
            <OrderDetailField label="Complemento">
              {customer.complement}
            </OrderDetailField>
            <OrderDetailField label="Bairro">
              {customer.neighborhood}
            </OrderDetailField>
            <OrderDetailField label="Cidade">{customer.city}</OrderDetailField>
            <OrderDetailField label="UF">{customer.state}</OrderDetailField>
            <OrderDetailField label="Código do município">
              {customer.municipalityCode || undefined}
            </OrderDetailField>
            <OrderDetailField label="Código da UF">
              {customer.stateCode || undefined}
            </OrderDetailField>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
