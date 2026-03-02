import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { envs } from "@/core/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(envs.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: `${envs.NEXT_PUBLIC_COMPANY_META_TITLE_MAIN} | ${envs.NEXT_PUBLIC_COMPANY_META_TITLE_CAPTION}`,
  description: envs.NEXT_PUBLIC_COMPANY_META_DESCRIPTION,
  keywords: [
    "informática",
    "eletrônicos",
    "perfumes importados",
    "notebooks",
    "computadores",
    "periféricos",
    "hardware",
    "software",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: envs.NEXT_PUBLIC_APP_URL,
    siteName: envs.NEXT_PUBLIC_COMPANY_NAME,
    title: `${envs.NEXT_PUBLIC_COMPANY_META_TITLE_MAIN} | ${envs.NEXT_PUBLIC_COMPANY_META_TITLE_CAPTION}`,
    description: envs.NEXT_PUBLIC_COMPANY_META_DESCRIPTION,
    images: [
      {
        url: "/images/logo/logo-horizontal-header1.png",
        width: 1200,
        height: 630,
        alt: envs.NEXT_PUBLIC_COMPANY_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${envs.NEXT_PUBLIC_COMPANY_META_TITLE_MAIN} | ${envs.NEXT_PUBLIC_COMPANY_META_TITLE_CAPTION}`,
    description: envs.NEXT_PUBLIC_COMPANY_META_DESCRIPTION,
    images: ["/images/logo/logo-horizontal-header1.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div>{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
