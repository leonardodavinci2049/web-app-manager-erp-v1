import type { Metadata } from "next";
import { publicEnvs } from "@/core/config";
import { HomeMobileBottomBar } from "./_components/mobile/home-mobile-bottom-bar";
import { BenefitsSection } from "./_components/sections/benefits-section";
import { ContactSection } from "./_components/sections/contact-section";
import { CtaSection } from "./_components/sections/cta-section";
import { FaqSection } from "./_components/sections/faq-section";
import { HeroSection } from "./_components/sections/hero-section";
import { HowItWorksSection } from "./_components/sections/how-it-works-section";
import { LocationSection } from "./_components/sections/location-section";
import { ModulesSection } from "./_components/sections/modules-section";
import { ProblemsSection } from "./_components/sections/problems-section";
import { TestimonialsSection } from "./_components/sections/testimonials-section";
import { LandingStructuredData } from "./_components/seo/landing-structured-data";

const PAGE_TITLE =
  "WinERP Gestor | Sistema de gestão on-line para o seu negócio";

const PAGE_DESCRIPTION =
  "Sistema ERP on-line para cadastro de produtos, clientes, vendedores, fornecedores, marcas e transportadoras, com controle de compras, entradas, saídas e relatórios administrativos.";

const PAGE_KEYWORDS = [
  "ERP on-line",
  "sistema de gestão",
  "gestão de estoque",
  "controle de estoque",
  "cadastro de produtos",
  "controle de entradas e saídas",
  "relatórios administrativos",
  "gestão para pequenas e médias empresas",
  "WinERP Gestor",
];

const OG_IMAGE = {
  url: "/images/logo/logo-header.png",
  width: 800,
  height: 288,
  alt: publicEnvs.NEXT_PUBLIC_COMPANY_NAME,
};

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: publicEnvs.NEXT_PUBLIC_APP_URL,
    siteName: publicEnvs.NEXT_PUBLIC_COMPANY_NAME,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function HomePage() {
  return (
    <main className="bg-background pb-[calc(env(safe-area-inset-bottom)+4.25rem)] md:pb-0">
      <LandingStructuredData />
      <HeroSection />
      <ProblemsSection />
      <ModulesSection />
      <BenefitsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <ContactSection />
      <LocationSection />
      <HomeMobileBottomBar />
    </main>
  );
}
