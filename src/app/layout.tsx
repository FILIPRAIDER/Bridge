import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import AuthProvider from "@/components/providers/session-provider";
import UIProvider from "@/components/providers/ui-provider";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://cresia-app.vercel.app'),
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
    url: "https://cresia-app.vercel.app",
    title: "Bridge - Conecta empresas con equipos",
    description: "Plataforma colaborativa para conectar empresas con equipos de trabajo. Gestiona proyectos, invita miembros y colabora eficientemente.",
    siteName: "Bridge",
    images: [
      {
        url: "https://cresia-app.vercel.app/api/og",
        width: 1200,
        height: 630,
        alt: "Bridge - Conecta empresas con equipos",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bridge - Conecta empresas con equipos",
    description: "Plataforma colaborativa para conectar empresas con equipos de trabajo.",
    images: ["https://cresia-app.vercel.app/api/og"],
    creator: "@Bridge",
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
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors`}
      >
        <ThemeProvider>
          <AuthProvider>
            <UIProvider>
              {children}
            </UIProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
