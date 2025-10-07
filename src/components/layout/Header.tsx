"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

/** Tipos de rol manejados en UI */
type UserRole = "EMPRESARIO" | "ESTUDIANTE" | "LIDER" | "ADMIN" | "ANON";

type CenterLink = {
  href: string;
  label: string;
  showFor: UserRole[];
};

const centerLinks: CenterLink[] = [
  { href: "/",        label: "Inicio",  showFor: ["EMPRESARIO", "ESTUDIANTE", "LIDER", "ADMIN", "ANON"] },
  { href: "/empresa", label: "Empresa", showFor: ["EMPRESARIO", "ADMIN"] },
  { href: "/chat",    label: "Chat",    showFor: ["EMPRESARIO", "ADMIN"] },
  { href: "/equipos", label: "Equipos", showFor: ["ESTUDIANTE", "LIDER", "ADMIN", "ANON"] },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // 🔑 Evita mismatch: solo renderiza el contenido real cuando ya montó en cliente.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Rol seguro
  const role: UserRole = (session?.user?.role ?? "ANON") as UserRole;

  const navBtn =
    "inline-flex items-center justify-center rounded-full " +
    "border border-gray-300 bg-white text-black px-5 py-2.5 font-semibold shadow-sm " +
    "transition-transform duration-150 transform-gpu hover:scale-105 active:scale-95 hover:border-gray-400";

  const navBtnDark =
    "inline-flex items-center justify-center rounded-full " +
    "bg-[#0b0f19] text-white px-5 py-2.5 font-semibold shadow-sm " +
    "transition-transform duration-150 transform-gpu hover:scale-105 active:scale-95 hover:bg-[#111827]";

  const itemBase = "px-3 py-2 rounded-lg text-sm transition-colors";
  const itemIdle = "text-gray-600 hover:bg-gray-100";
  const itemActive = "text-[--color-brand-600] bg-[--color-brand-500]/10";

  // ⏳ Mientras no montó, renderiza un placeholder con la misma altura para no mover la página
  if (!mounted) {
    return (
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4">
          <div className="h-14 md:h-16" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        {/* Grid: md 3 columnas -> marca | nav centrado | acciones */}
        <div className="h-14 md:h-16 grid grid-cols-2 md:grid-cols-3 items-center">
          {/* Marca */}
          <Link href="/" className="inline-flex items-center gap-2 justify-self-start">
            <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
              <rect x="2" y="2" width="28" height="28" rx="6" className="fill-[--color-brand-500]/15" />
              <path
                d="M10 16.5l4 4 8-9"
                className="stroke-[--color-brand-600] fill-none"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-base md:text-lg font-semibold tracking-tight">Bridge</span>
          </Link>

          {/* Nav centrado (solo desktop) */}
          <nav className="hidden md:flex items-center gap-1 justify-self-center">
            {centerLinks
              .filter((l) => l.showFor.includes(role))
              .map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${itemBase} ${active ? itemActive : itemIdle}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </nav>

          {/* Acciones (derecha) */}
          <div className="flex items-center gap-2 justify-self-end col-start-2 md:col-start-3">
            {session?.user ? (
              <>
                {(role === "ESTUDIANTE" || role === "LIDER" || role === "ADMIN") && (
                  <Link href="/dashboard" className={navBtn}>
                    Dashboard
                  </Link>
                )}
                {(role === "EMPRESARIO" || role === "ADMIN") && (
                  <Link href="/empresa" className={navBtn}>
                    Empresa
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className={navBtnDark}
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={navBtn}>
                  Ingresar
                </Link>
                <Link href="/auth/register" className={navBtnDark}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
