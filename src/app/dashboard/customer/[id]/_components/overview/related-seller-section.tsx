import { BadgeCheck, Mail, MessageCircle, Phone, Store } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { UISellerInfo } from "@/services/api-main/customer-general";
import { RelatedSellerImage } from "./related-seller-image";

interface RelatedSellerSectionProps {
  seller?: UISellerInfo;
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

export function RelatedSellerSection({ seller }: RelatedSellerSectionProps) {
  return (
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
                icon={<MessageCircle className="size-4" aria-hidden="true" />}
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
  );
}
