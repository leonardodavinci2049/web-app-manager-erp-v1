import { RegistryDetailLoading } from "@/app/dashboard/_components/detail-page";

export default function CarrierDetailsLoading() {
  return (
    <RegistryDetailLoading
      title="Detalhes da transportadora"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Transportadoras", isActive: true },
      ]}
      variant="extended"
    />
  );
}
