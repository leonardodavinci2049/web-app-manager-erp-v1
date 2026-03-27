"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useOrganizationMeta } from "@/components/common/organization-meta-provider";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const FALLBACK_LOGO_SRC = "/images/logo/logo-sidebar.png";

function resolveLogoSrc(
  imageBaseUrl: string,
  logoPath: string | null | undefined,
) {
  if (!logoPath) {
    return FALLBACK_LOGO_SRC;
  }

  const trimmedPath = logoPath.trim();

  if (!trimmedPath) {
    return FALLBACK_LOGO_SRC;
  }

  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    return trimmedPath;
  }

  try {
    return new URL(trimmedPath, imageBaseUrl).toString();
  } catch {
    return FALLBACK_LOGO_SRC;
  }
}

export function SidebarLogo() {
  const { setOpenMobile } = useSidebar();
  const { meta, imageBaseUrl } = useOrganizationMeta();

  const resolvedLogoSrc = resolveLogoSrc(imageBaseUrl, meta.IMAGE1);
  const [logoSrc, setLogoSrc] = useState(resolvedLogoSrc);

  useEffect(() => {
    setLogoSrc(resolvedLogoSrc);
  }, [resolvedLogoSrc]);

  const isExternalUrl = logoSrc.startsWith("http");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="h-auto! px-1! py-1!" asChild>
          <Link
            href="/dashboard"
            onClick={() => setOpenMobile(false)}
            className="flex-col! items-start! w-full!"
          >
            <Image
              src={logoSrc}
              alt="Logo da Empresa"
              width={300}
              height={80}
              priority
              unoptimized={isExternalUrl}
              onError={() => {
                if (logoSrc !== FALLBACK_LOGO_SRC) {
                  setLogoSrc(FALLBACK_LOGO_SRC);
                }
              }}
              className="h-auto w-[88%] max-w-[88%] object-contain object-left"
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
