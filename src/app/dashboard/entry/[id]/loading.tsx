import { RegistryDetailLoading } from "@/app/dashboard/_components/detail-page";

export default function EntryDetailsLoading() {
  return (
    <RegistryDetailLoading
      title="Detalhes da entrada"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Entradas", isActive: true },
      ]}
      variant="extended"
    />
  );
}
