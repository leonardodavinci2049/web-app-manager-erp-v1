import { RegistryDetailLoading } from "@/app/dashboard/_components/detail-page";

export default function OrderDetailsLoading() {
  return (
    <RegistryDetailLoading
      title="Detalhes da Order"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "pedido", isActive: true },
      ]}
      variant="extended"
    />
  );
}
