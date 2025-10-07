import type { Metadata } from "next";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Bridge",
  description: "Conecta empresas con equipos",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // OJO: aquí ya NO envuelvas con providers; ya están en el layout raíz.
  return (
    <>
      <Header />
      {children}
    </>
  );
}
