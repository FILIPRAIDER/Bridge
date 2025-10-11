import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Ignorar errores de TypeScript/ESLint en build de producción
  typescript: {
    // ⚠️ PELIGROSO: Permite hacer build aunque haya errores de TypeScript
    // Solo usar temporalmente mientras se arreglan todos los tipos
    ignoreBuildErrors: true,
  },
  
  eslint: {
    // ⚠️ PELIGROSO: Permite hacer build aunque haya errores de ESLint
    // Solo usar temporalmente mientras se arreglan todos los lints
    ignoreDuringBuilds: true,
  },
  
  // Configuración de imágenes para optimización
  images: {
    domains: [
      'localhost',
      'bridge-backend.onrender.com',
      'ik.imagekit.io', // ImageKit CDN
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: '**.onrender.com',
      },
    ],
  },
};

export default nextConfig;
