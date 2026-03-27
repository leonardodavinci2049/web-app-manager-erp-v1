"use client";

import {
  AudioWaveform,
  Boxes,
  ChartColumn,
  Command,
  Frame,
  GalleryVerticalEnd,
  Handshake,
  LayoutDashboard,
  Map as MapIcon,
  Package,
  PieChart,
  ShoppingCart,
  Tags,
  Truck,
  Users,
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
  user: {
    name: "Comsuporte",
    email: "mauro@comsuporte.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "WinERP",
      logo: GalleryVerticalEnd,
      plan: "Distribuidora",
    },
    {
      name: "Mundial Megastore",
      logo: AudioWaveform,
      plan: "Enterprise",
    },
    {
      name: "Atacadão Eletrônico",
      logo: Command,
      plan: "Revenda",
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
          title: "Visão Geral",
          url: "/dashboard",
        },
        {
          title: "Últimas Vendas",
          url: "#",
        },
      ],
    },
    {
      title: "Produtos",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Catálogo",
          url: "/dashboard/product/catalog",
        },
        {
          title: "Novos Produtos",
          url: "/dashboard/product/new-product",
        },
        {
          title: "Mais vendidos",
          url: "#",
        },
      ],
    },
    {
      title: "Categorias",
      url: "#",
      icon: Tags,
      items: [
        {
          title: "Visão Geral de Categorias",
          url: "/dashboard/category/category-overviews",
        },
        {
          title: "Lista de Categorias",
          url: "/dashboard/category/category-list",
        },

        {
          title: "Nova Categoria",
          url: "/dashboard/category/new-category",
        },
      ],
    },
    {
      title: "Clientes",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Lista de Clientes",
          url: "/dashboard/customer/customer-list",
        },

        {
          title: "Novo Cadastro",
          url: "/dashboard/customer/add-customer",
        },

        {
          title: "Clientes Premium",
          url: "/dashboard/customer/premium-customers",
        },

        {
          title: "Clientes Inativos",
          url: "/dashboard/customer/inactive-customers",
        },
        {
          title: "Cadastro Pendente",
          url: "/dashboard/customer/pending-registrations",
        },
      ],
    },
    {
      title: "Marcas",
      url: "#",
      icon: Tags,
      items: [
        {
          title: "Lista de Marcas",
          url: "/dashboard/development",
        },

        {
          title: "Nova Marca",
          url: "/dashboard/development",
        },
      ],
    },
    {
      title: "Fornecedores",
      url: "#",
      icon: Handshake,
      items: [
        {
          title: "Lista de Fornecedores",
          url: "/dashboard/development",
        },

        {
          title: "Nova Fornecedor",
          url: "/dashboard/development",
        },
      ],
    },
    {
      title: "Transportadoras",
      url: "#",
      icon: Truck,
      items: [
        {
          title: "Lista de Transportadoras",
          url: "/dashboard/development",
        },

        {
          title: "Nova Transportadora",
          url: "/dashboard/development",
        },
      ],
    },
    {
      title: "Entradas de Produtos",
      url: "#",
      icon: Boxes,
      items: [
        {
          title: "Lista Entradas",
          url: "/dashboard/development",
        },

        {
          title: "Nova Entrada",
          url: "/dashboard/development",
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
      name: "Configurações",
      url: "/dashboard/development",
      icon: MapIcon,
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
