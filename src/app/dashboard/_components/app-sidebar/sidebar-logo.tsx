"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useOrganizationMeta } from "@/components/common/organization-meta-provider";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { publicEnvs } from "@/core/config/envs";

const LOGO_FALLBACK = "/images/logo/logo-sidebar.png";

export function SidebarLogo() {
  const { setOpenMobile } = useSidebar();
  const { meta, imageBaseUrl } = useOrganizationMeta();
  const [hasImageError, setHasImageError] = useState(false);

  const imagePath = meta.IMAGE1;
  const isRemoteLogo = !!imagePath && !hasImageError;
  const logoSrc = isRemoteLogo ? `${imageBaseUrl}/${imagePath}` : LOGO_FALLBACK;
  const companyName =
    meta.COMMERCIAL_NAME || publicEnvs.NEXT_PUBLIC_COMPANY_NAME;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="!h-auto !py-3" asChild>
          <Link
            href="/dashboard"
            onClick={() => setOpenMobile(false)}
            className="!flex-col !items-start !gap-1"
          >
            {isRemoteLogo ? (
              // biome-ignore lint/performance/noImgElement: Using native img to avoid Node.js url.parse() deprecation warning (DEP0169) triggered by Next.js Image optimizer on remote URLs
              <img
                src={logoSrc}
                alt="Logo da Empresa"
                width={140}
                height={40}
                onError={() => setHasImageError(true)}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <Image
                src={LOGO_FALLBACK}
                alt="Logo da Empresa"
                width={140}
                height={40}
                priority
                style={{ width: "auto", height: "auto" }}
                className="h-10 w-auto object-contain"
              />
            )}
            <span className="text-sidebar-foreground/70 truncate text-xs">
              {companyName}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
