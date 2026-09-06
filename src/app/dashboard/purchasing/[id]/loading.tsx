import { RegistryDetailLoading } from "@/app/dashboard/_components/detail-page";

export default function PurchasingDetailsLoading() {
  return (
    <RegistryDetailLoading
      title="Detalhes da compra"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Compras", isActive: true },
      ]}
      variant="extended"
    />
  );
}
