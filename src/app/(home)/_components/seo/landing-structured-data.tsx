import { publicEnvs } from "@/core/config/envs.client";
import { faq } from "../landing-content";

/**
 * Structured data for the landing page.
 *
 * Only factual data is published: company identity from public environment
 * variables and product capabilities confirmed in the repository. Provisional
 * information (address, ratings, review counts) is intentionally omitted.
 */

/**
 * Safely serializes a JSON-LD object for injection into a `<script>` tag.
 *
 * Escapes characters that could break out of the `<script>` context:
 * - `</script>` -> `<\/script>` (prevents premature tag close)
 * - `<` -> `\u003c`, `>` -> `\u003e`, `&` -> `\u0026`
 */
function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML; content is safely escaped via serializeJsonLd
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export function LandingStructuredData() {
  const appUrl = publicEnvs.NEXT_PUBLIC_APP_URL;
  const companyName = publicEnvs.NEXT_PUBLIC_COMPANY_NAME;

  const organization: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: companyName,
    url: appUrl,
    logo: `${appUrl}/images/logo/logo-header.png`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: publicEnvs.NEXT_PUBLIC_COMPANY_PHONE,
        email: publicEnvs.NEXT_PUBLIC_COMPANY_EMAIL,
        availableLanguage: ["pt-BR"],
      },
    ],
  };

  const softwareApplication: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WinERP Gestor",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: appUrl,
    description:
      "Sistema de gestão on-line para cadastro de produtos, clientes, vendedores, fornecedores, marcas e transportadoras, com controle de compras, entradas, saídas e relatórios administrativos.",
    publisher: {
      "@type": "Organization",
      name: companyName,
      url: appUrl,
    },
  };

  const faqPage: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <JsonLdScript data={organization} />
      <JsonLdScript data={softwareApplication} />
      <JsonLdScript data={faqPage} />
    </>
  );
}
