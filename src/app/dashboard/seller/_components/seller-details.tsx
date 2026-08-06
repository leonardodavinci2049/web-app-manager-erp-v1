import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Contact,
  FileText,
  LockKeyhole,
  Mail,
  Pencil,
  Phone,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UISellerDetail } from "@/services/api-main/seller";
import { SellerImage } from "./seller-image";

interface SellerDetailsProps {
  seller: UISellerDetail;
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

export function SellerDetails({
  seller,
  returnTo,
  imageGallery,
  imageContent,
}: SellerDetailsProps) {
  const fullPersonalName = [seller.firstName, seller.lastName]
    .filter(Boolean)
    .join(" ");
  const isBusiness = Boolean(
    seller.cnpj || seller.legalName || seller.tradeName,
  );

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
            Voltar aos vendedores
          </Link>
        </Button>

        <aside className="lg:row-span-2 lg:row-start-2 lg:self-start lg:sticky lg:top-6">
          {imageGallery}
        </aside>

        <div className="flex min-w-0 items-start gap-3">
          <SellerImage
            name={seller.name}
            imagePath={seller.imagePath}
            viewMode="list"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-2xl font-bold">{seller.name}</h1>
              <Badge variant="secondary">
                {seller.accountStatus || "Status não informado"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm tabular-nums">
              Vendedor ID {seller.id}
            </p>
            <p className="text-muted-foreground text-sm">
              {seller.accountType || "Tipo de conta não informado"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Contact className="size-5" />
                  Identificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField label="ID do vendedor" value={seller.id} />
                  <DetailField label="ID da loja" value={seller.storeId} />
                  <DetailField
                    label="ID do tipo de cliente"
                    value={seller.customerTypeId}
                  />
                  <DetailField
                    label="ID do tipo de pessoa"
                    value={seller.personTypeId}
                  />
                  <DetailField
                    label="Tipo de conta"
                    value={seller.accountType}
                  />
                  <DetailField
                    label="Marcado como vendedor"
                    value={seller.isSeller ? "Sim" : "Não"}
                  />
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5" />
                  {isBusiness ? "Dados empresariais" : "Dados pessoais"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-5 sm:grid-cols-2">
                  <DetailField label="Nome de cadastro" value={seller.name} />
                  {isBusiness ? (
                    <>
                      <DetailField
                        label="Razão social"
                        value={seller.legalName}
                      />
                      <DetailField
                        label="Nome fantasia"
                        value={seller.tradeName}
                      />
                      <DetailField label="CNPJ" value={seller.cnpj} />
                    </>
                  ) : (
                    <>
                      <DetailField
                        label="Nome pessoal"
                        value={fullPersonalName}
                      />
                      <DetailField label="CPF" value={seller.cpf} />
                      <DetailField
                        label="Data de nascimento"
                        value={formatDate(seller.birthDate)}
                      />
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="size-5" />
                  Contatos e documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-5 sm:grid-cols-2">
                  <DetailField label="Telefone" value={seller.phone} />
                  <DetailField label="WhatsApp" value={seller.whatsapp} />
                  <DetailField label="E-mail" value={seller.email} />
                  <DetailField label="CPF" value={seller.cpf} />
                  <DetailField label="CNPJ" value={seller.cnpj} />
                </dl>
                <div className="text-muted-foreground mt-5 flex flex-wrap gap-4 text-xs">
                  {seller.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      Contato eletrônico informado
                    </span>
                  )}
                  {(seller.cpf || seller.cnpj) && (
                    <span className="flex items-center gap-1.5">
                      <FileText className="size-3.5" />
                      Documento informado
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LockKeyhole className="size-4" />
                  Operações
                </CardTitle>
                <Badge variant="secondary">Pendente de API</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-xs">
                  Os contratos disponíveis permitem apenas consultar vendedores.
                  Nenhuma destas ações envia dados à API.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  <Pencil className="size-4" />
                  Editar — Pendente de API
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  <Power className="size-4" />
                  Ativar — Pendente de API
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  <PowerOff className="size-4" />
                  Inativar — Pendente de API
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
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
                  value={formatDate(seller.createdAt)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Tabs defaultValue="deletion" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2">
          <TabsTrigger value="image">Imagem</TabsTrigger>
          <TabsTrigger value="deletion">Exclusão</TabsTrigger>
        </TabsList>

        <TabsContent value="image">{imageContent}</TabsContent>

        <TabsContent value="deletion">
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
                Os contratos disponíveis permitem apenas consultar vendedores. A
                exclusão permanece indisponível e não envia dados à API.
              </p>
              <Button type="button" variant="destructive" disabled>
                <Trash2 className="size-4" />
                Excluir — Pendente de API
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
