import { RegistryDetailLoading } from "@/app/dashboard/_components/detail-page";

export default function PurchasingDetailsLoading() {
  return (
    <RegistryDetailLoading
      title="Detalhes da necessidade de compra"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Necessidade de compra", isActive: true },
      ]}
      variant="extended"
    />
  );
}
