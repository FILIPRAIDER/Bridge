import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import AuthProvider from "@/components/providers/session-provider";
import UIProvider from "@/components/providers/ui-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bridgeapp.vercel.app'),
  title: {
    default: "Bridge - Conecta empresas con equipos",
    template: "%s | Bridge",
  },
  description: "Plataforma colaborativa para conectar empresas con equipos de trabajo. Gestiona proyectos, invita miembros y colabora eficientemente.",
  keywords: ["bridge", "equipos", "colaboración", "empresas", "gestión de proyectos", "trabajo en equipo"],
  authors: [{ name: "Bridge Team" }],
  creator: "Bridge",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://bridgeapp.vercel.app",
    title: "Bridge - Conecta empresas con equipos",
    description: "Plataforma colaborativa para conectar empresas con equipos de trabajo. Gestiona proyectos, invita miembros y colabora eficientemente.",
    siteName: "Bridge",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Bridge - Conecta empresas con equipos",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bridge - Conecta empresas con equipos",
    description: "Plataforma colaborativa para conectar empresas con equipos de trabajo.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <UIProvider>
            {children}
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
