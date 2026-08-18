import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  FileText,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { publicEnvs } from "@/core/config";

/**
 * Centralized landing page content for WinERP Gestor.
 * Illustrative data (testimonials, address) is explicitly marked as
 * provisional and must be replaced with real information before going live.
 */

export type NavLinkItem = {
  href: string;
  label: string;
};

export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type ProblemItem = {
  title: string;
  description: string;
};

export type BenefitItem = {
  title: string;
  description: string;
};

export type StepItem = {
  step: string;
  title: string;
  description: string;
};

export type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const company = {
  name: publicEnvs.NEXT_PUBLIC_COMPANY_NAME,
  phone: publicEnvs.NEXT_PUBLIC_COMPANY_PHONE,
  phoneHref: `tel:${publicEnvs.NEXT_PUBLIC_COMPANY_PHONE.replace(/\D/g, "")}`,
  email: publicEnvs.NEXT_PUBLIC_COMPANY_EMAIL,
  emailHref: `mailto:${publicEnvs.NEXT_PUBLIC_COMPANY_EMAIL}`,
  whatsapp: publicEnvs.NEXT_PUBLIC_COMPANY_WHATSAPP,
} as const;

const WHATSAPP_DEFAULT_MESSAGE =
  "Olá, gostaria de saber mais sobre o WinERP Gestor.";

export function buildWhatsappUrl(message: string = WHATSAPP_DEFAULT_MESSAGE) {
  const phone = company.whatsapp.replace(/\D/g, "");

  return `https://api.whatsapp.com/send/?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
}

export const landingNavigation: NavLinkItem[] = [
  { href: "#recursos", label: "Recursos" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#faq", label: "Dúvidas" },
  { href: "#contato", label: "Contato" },
  { href: "#localizacao", label: "Localização" },
];

export const hero = {
  badge: "Sistema de gestão on-line",
  titleStart: "Gestão completa para o seu negócio com o",
  titleHighlight: "WinERP Gestor",
  description:
    "Cadastre produtos, clientes, vendedores, fornecedores, marcas e transportadoras, controle compras, entradas e saídas e acompanhe relatórios administrativos do estoque ao financeiro.",
  primaryCta: {
    label: "Falar com um consultor",
    href: buildWhatsappUrl(),
  },
  secondaryCta: {
    label: "Área do Cliente",
    href: "/sign-in",
  },
} as const;

export const problems: ProblemItem[] = [
  {
    title: "Cadastros espalhados em planilhas",
    description:
      "Produtos, clientes, fornecedores e transportadoras reunidos em um cadastro único, organizado e sempre disponível on-line.",
  },
  {
    title: "Controle manual de estoque",
    description:
      "Registre compras, entradas e saídas em uma rotina padronizada e reduza divergências de inventário.",
  },
  {
    title: "Falta de visão dos resultados",
    description:
      "Relatórios administrativos que ajudam a acompanhar a operação e a tomar decisões com mais segurança.",
  },
  {
    title: "Informação presa em um computador",
    description:
      "Sistema on-line acessível de diferentes dispositivos, para consultar o que precisa de onde estiver.",
  },
];

export const modules: FeatureItem[] = [
  {
    icon: Package,
    title: "Produtos",
    description:
      "Cadastro completo de produtos com marcas, imagens e dados de identificação.",
  },
  {
    icon: Users,
    title: "Clientes e vendedores",
    description:
      "Gerenciamento de clientes, vendedores e fornecedores em um só cadastro.",
  },
  {
    icon: Truck,
    title: "Transportadoras",
    description:
      "Cadastro de transportadoras para organizar a logística das suas entregas.",
  },
  {
    icon: ShoppingCart,
    title: "Compras",
    description:
      "Registro de compras com acompanhamento das entradas de mercadorias.",
  },
  {
    icon: Warehouse,
    title: "Entradas e saídas",
    description:
      "Controle de movimentação de estoque com histórico de operações.",
  },
  {
    icon: BarChart3,
    title: "Relatórios",
    description:
      "Relatórios administrativos de cadastros, estoque e movimentações.",
  },
];

export const benefits: BenefitItem[] = [
  {
    title: "Operação organizada",
    description:
      "Cadastros padronizados evitam retrabalho e mantêm a informação consistente.",
  },
  {
    title: "Estoque sob controle",
    description:
      "Compras, entradas e saídas registradas em uma rotina clara e auditável.",
  },
  {
    title: "Decisões com dados",
    description:
      "Relatórios administrativos para acompanhar a operação do dia a dia.",
  },
  {
    title: "Acesso on-line",
    description:
      "Utilize o sistema pelo navegador, sem instalação local, em diferentes telas.",
  },
];

export const howItWorks: StepItem[] = [
  {
    step: "1",
    title: "Fale com nossa equipe",
    description:
      "Entre em contato pelo WhatsApp, telefone, e-mail ou formulário para entender como o WinERP Gestor se aplica ao seu negócio.",
  },
  {
    step: "2",
    title: "Estruture seus cadastros",
    description:
      "Cadastre produtos, clientes, vendedores, fornecedores, marcas e transportadoras e organize a base da sua operação.",
  },
  {
    step: "3",
    title: "Controle a movimentação",
    description:
      "Registre compras, entradas e saídas e mantenha o estoque atualizado com histórico completo.",
  },
  {
    step: "4",
    title: "Acompanhe os resultados",
    description:
      "Consulte relatórios administrativos para acompanhar a operação e planejar os próximos passos.",
  },
];

/**
 * Provisional illustrative testimonials. Replace with real customer
 * statements authorized for publication before going live.
 */
export const testimonials: TestimonialItem[] = [
  {
    quote:
      "Depoimento ilustrativo: conseguimos organizar os cadastros que antes estavam espalhados em planilhas.",
    author: "Nome do cliente",
    role: "Cargo ilustrativo",
  },
  {
    quote:
      "Depoimento ilustrativo: o controle de entradas e saídas deixou o estoque muito mais confiável.",
    author: "Nome do cliente",
    role: "Cargo ilustrativo",
  },
  {
    quote:
      "Depoimento ilustrativo: os relatórios ajudam a enxergar a operação inteira em um só lugar.",
    author: "Nome do cliente",
    role: "Cargo ilustrativo",
  },
];

export const faq: FaqItem[] = [
  {
    question: "O que é o WinERP Gestor?",
    answer:
      "É um sistema de gestão on-line para cadastro de produtos, clientes, vendedores, fornecedores, marcas e transportadoras, além de compras, entradas, saídas e relatórios administrativos.",
  },
  {
    question: "Preciso instalar algum programa?",
    answer:
      "Não. O WinERP Gestor é acessado pelo navegador, de diferentes tipos de tela, sem instalação local.",
  },
  {
    question: "Como contratar o sistema?",
    answer:
      "Use os canais de contato desta página (WhatsApp, telefone, e-mail ou formulário) e fale com um consultor para receber a proposta adequada ao seu negócio.",
  },
  {
    question: "Como acesso a área do sistema?",
    answer:
      'Clientes com acesso cadastrado podem entrar pelo botão "Área do Cliente", na parte superior da página, informando suas credenciais.',
  },
  {
    question: "Quais relatórios o sistema oferece?",
    answer:
      "Relatórios administrativos de cadastros, estoque e movimentações de entradas e saídas para acompanhamento da operação.",
  },
];

export const cta = {
  title: "Pronto para organizar a gestão do seu negócio?",
  description:
    "Fale com um consultor e descubra como o WinERP Gestor pode ajudar no seu dia a dia.",
} as const;

/**
 * Provisional illustrative address and map. Replace with real company data
 * before going live. The embed uses a plain Google Maps query URL and does
 * not require an API key.
 */
export const location = {
  address: "Av. Paulista, 1000 - Bela Vista",
  city: "São Paulo - SP, 01310-100",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Av.+Paulista,+1000+-+Bela+Vista,+S%C3%A3o+Paulo+-+SP,+01310-100&output=embed",
  mapsExternalUrl:
    "https://www.google.com/maps/search/?api=1&query=Av.+Paulista,+1000+-+Bela+Vista,+S%C3%A3o+Paulo+-+SP,+01310-100",
} as const;

export const contactChannels = {
  whatsapp: {
    label: "WhatsApp",
    message: WHATSAPP_DEFAULT_MESSAGE,
    href: buildWhatsappUrl(),
  },
  phone: {
    label: "Telefone",
    href: company.phoneHref,
  },
  email: {
    label: "E-mail",
    href: company.emailHref,
  },
} as const;

export const highlights: FeatureItem[] = [
  {
    icon: Boxes,
    title: "Cadastro único",
    description: "Produtos, clientes e parceiros em uma base organizada.",
  },
  {
    icon: ClipboardList,
    title: "Movimentação registrada",
    description: "Compras, entradas e saídas com histórico completo.",
  },
  {
    icon: FileText,
    title: "Relatórios administrativos",
    description: "Acompanhe a operação sem depender de planilhas manual.",
  },
];
