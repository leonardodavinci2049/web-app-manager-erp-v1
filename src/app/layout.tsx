import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { publicEnvs } from "@/core/config/envs.client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    publicEnvs.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: `${publicEnvs.NEXT_PUBLIC_COMPANY_META_TITLE_MAIN} | ${publicEnvs.NEXT_PUBLIC_COMPANY_META_TITLE_CAPTION}`,
  description: publicEnvs.NEXT_PUBLIC_COMPANY_META_DESCRIPTION,
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
    url: publicEnvs.NEXT_PUBLIC_APP_URL,
    siteName: publicEnvs.NEXT_PUBLIC_COMPANY_NAME,
    title: `${publicEnvs.NEXT_PUBLIC_COMPANY_META_TITLE_MAIN} | ${publicEnvs.NEXT_PUBLIC_COMPANY_META_TITLE_CAPTION}`,
    description: publicEnvs.NEXT_PUBLIC_COMPANY_META_DESCRIPTION,
    images: [
      {
        url: "/images/logo/logo-header.png",
        width: 800,
        height: 288,
        alt: publicEnvs.NEXT_PUBLIC_COMPANY_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${publicEnvs.NEXT_PUBLIC_COMPANY_META_TITLE_MAIN} | ${publicEnvs.NEXT_PUBLIC_COMPANY_META_TITLE_CAPTION}`,
    description: publicEnvs.NEXT_PUBLIC_COMPANY_META_DESCRIPTION,
    images: ["/images/logo/logo-header.png"],
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
