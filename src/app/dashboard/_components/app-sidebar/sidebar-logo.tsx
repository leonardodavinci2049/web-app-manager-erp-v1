"use client";

import Image from "next/image";
import Link from "next/link";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function SidebarLogo() {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="!h-auto !py-3" asChild>
          <Link
            href="/dashboard"
            onClick={() => setOpenMobile(false)}
            className="!flex-col !items-start !gap-1"
          >
            <Image
              src="/images/logo/logo-sidebar.png"
              alt="Logo da Empresa"
              width={140}
              height={40}
              className="h-10 w-auto object-contain"
            />
            <span className="text-sidebar-foreground/70 truncate text-xs">
              PDV - Sistema de Vendas
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
