"use client";

import {
  ChartColumn,
  Frame,
  GalleryVerticalEnd,
  House,
  LayoutDashboard,
  PieChart,
  Settings,
  ShoppingCart,
  Truck,
} from "lucide-react";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { SidebarLogo } from "./sidebar-logo";

// This is sample data.
const data = {
  teams: [
    {
      name: "WinERP",
      logo: GalleryVerticalEnd,
      plan: "Sistema de Gestão",
    },
  ],
  navMain: [
    {
      title: "Painel ",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Produtos",
          url: "/dashboard/product",
        },
        {
          title: "Categorias",
          url: "/dashboard/category",
        },
        {
          title: "Clientes",
          url: "/dashboard/customer",
        },
        {
          title: "Vendedores",
          url: "/dashboard/seller",
        },
        {
          title: "Marcas",
          url: "/dashboard/brand",
        },

        {
          title: "Tipos de produtos",
          url: "/dashboard/ptype",
        },
        {
          title: "Fornecedores",
          url: "/dashboard/suppliers",
        },
        {
          title: "Transportadoras",
          url: "/dashboard/carriers",
        },
      ],
    },

    {
      title: "Compras",
      url: "#",
      icon: ShoppingCart,
      items: [
        {
          title: "Lista de Compras",
          url: "/dashboard/development",
        },
        {
          title: "Necessidade de Compras",
          url: "/dashboard/development",
        },
        {
          title: "Nova Compra",
          url: "/dashboard/development",
        },
      ],
    },

    {
      title: "Entrada",
      url: "/dashboard/entry",
      icon: Truck,
    },

    {
      title: "Relatórios",
      url: "#",
      icon: ChartColumn,
      items: [
        {
          title: "Painel geral",
          url: "/dashboard/report/panel",
        },
        {
          title: "Vendas",
          url: "/dashboard/report/sales",
        },
        {
          title: "Clientes",
          url: "/dashboard/report/customers",
        },
        {
          title: "Produtos",
          url: "/dashboard/report/products",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Home",
      url: "/dashboard",
      icon: House,
    },
    {
      name: "Agenda",
      url: "/dashboard/development",
      icon: Frame,
    },
    {
      name: "CRM",
      url: "/dashboard/development",
      icon: PieChart,
    },
    {
      name: "Welcome",
      url: "/dashboard/welcome",
      icon: House,
    },

    {
      name: "Configurações",
      url: "/dashboard/settings/",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
