import type { Metadata } from "next";
import { publicEnvs } from "@/core/config";
import { SiteFooter } from "./_components/footer/site-footer";
import { SiteHeader } from "./_components/header/site-header";

export const metadata: Metadata = {
  title: `Empresa - ${publicEnvs.NEXT_PUBLIC_COMPANY_NAME}`,
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <SiteHeader />

      <div className="grow">{children}</div>

      <SiteFooter />
    </div>
  );
}
