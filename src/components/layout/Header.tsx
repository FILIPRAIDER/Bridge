"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => setMounted(true), []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Rol seguro
  const role: UserRole = (session?.user?.role ?? "ANON") as UserRole;

  const navBtn =
    "inline-flex items-center justify-center rounded-xl " +
    "bg-gray-100 text-gray-900 px-5 py-2.5 font-semibold " +
    "transition-all duration-150 hover:bg-gray-200";

  const navBtnDark =
    "inline-flex items-center justify-center rounded-xl cursor-pointer " +
    "bg-[#0b0f19] text-white px-5 py-2.5 font-semibold shadow-sm " +
    "transition-all duration-150 hover:bg-[#111827]";

  const itemBase = "px-3 py-2 rounded-lg text-sm transition-colors";
  const itemIdle = "text-gray-600 hover:bg-gray-100";
  const itemActive = "text-[--color-brand-600] bg-[--color-brand-500]/10";

  // ⏳ Mientras no montó, renderiza un placeholder con la misma altura para no mover la página
  if (!mounted) {
    return (
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 md:px-4">
          <div className="h-12 md:h-16" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 md:px-4">
          {/* Grid: mobile 2 columnas (hamburguesa | logo), desktop 3 columnas (logo | nav | acciones) */}
          <div className="h-12 md:h-16 flex md:grid md:grid-cols-3 items-center justify-between md:gap-2">
            {/* Mobile: Hamburger a la izquierda */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>

            {/* Logo - Mobile derecha, Desktop izquierda */}
            <Link href="/" className="inline-flex items-center gap-2 md:justify-self-start">
              <svg viewBox="0 0 32 32" className="h-6 w-6 md:h-7 md:w-7" aria-hidden="true">
                <rect x="2" y="2" width="28" height="28" rx="6" className="fill-[--color-brand-500]/15" />
                <path
                  d="M10 16.5l4 4 8-9"
                  className="stroke-[--color-brand-600] fill-none"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm md:text-lg font-semibold tracking-tight">Bridge</span>
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

            {/* Acciones (derecha) - Solo visible en Desktop */}
            <div className="hidden md:flex items-center gap-2 justify-self-end col-start-3">
              {session?.user ? (
                <>
                  <Link href="/dashboard" className={navBtn}>
                    Dashboard
                  </Link>
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

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* Sidebar */}
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header de la Sidebar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
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
                <span className="text-lg font-semibold tracking-tight">Bridge</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>

            {/* User Info (si está logueado) */}
            {session?.user && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center">
                    {session.user.avatarUrl ? (
                      <img
                        src={session.user.avatarUrl}
                        alt={session.user.name || "Usuario"}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user.name || "Usuario"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="p-4 space-y-1">
              {centerLinks
                .filter((l) => l.showFor.includes(role))
                .map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? "bg-gray-900 text-white font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
            </nav>

            {/* Action Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white space-y-2">
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="w-full inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2.5 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-[#0b0f19] text-white px-4 py-2.5 font-semibold hover:bg-[#111827] transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="w-full inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2.5 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/auth/register"
                    className="w-full inline-flex items-center justify-center rounded-lg bg-[#0b0f19] text-white px-4 py-2.5 font-semibold hover:bg-[#111827] transition-colors"
                  >
                    Crear Cuenta
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
