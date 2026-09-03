import { RegistryDetailLoading } from "@/app/dashboard/_components/detail-page";

export default function CustomerDetailsLoading() {
  return (
    <RegistryDetailLoading
      title="Detalhes do cliente"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Clientes", isActive: true },
      ]}
      variant="customer"
    />
  );
}
