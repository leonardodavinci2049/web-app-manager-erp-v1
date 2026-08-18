import type { Metadata } from "next";
import { Suspense } from "react";
import { publicEnvs } from "@/core/config";

export const metadata: Metadata = {
  title: `Empresa - ${publicEnvs.NEXT_PUBLIC_COMPANY_NAME}`,
};

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <div className="grow">{children}</div>
      <Suspense fallback={<div>Loading...</div>}></Suspense>
    </div>
  );
}
