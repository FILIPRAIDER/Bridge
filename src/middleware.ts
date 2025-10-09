// middleware.ts (en la raíz del repo de Next)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = [
  "/", "/empresa-info", "/equipos-info",
  "/auth/login", 
  "/auth/register",
  "/auth/register/select",
  "/auth/register/empresario",
  "/auth/register/estudiante",
  "/auth/register/lider",
  "/auth/register/miembro",
  "/join", // Para invitaciones
  // agrega otras públicas si hace falta
];

// Mapa de permisos por prefijo de ruta
const ACCESS: Record<string, Array<"EMPRESARIO" | "ESTUDIANTE" | "LIDER" | "ADMIN">> = {
  "/dashboard/empresario": ["EMPRESARIO", "ADMIN"],
  "/dashboard/lider": ["LIDER", "ADMIN"],
  "/dashboard/miembro": ["ESTUDIANTE", "ADMIN"],
  "/dashboard": ["ESTUDIANTE", "LIDER", "EMPRESARIO", "ADMIN"], // Dashboard general
};

function matchPrefix(pathname: string) {
  // devuelve el prefijo que coincide, por ejemplo "/empresa" para "/empresa/proyectos"
  const keys = Object.keys(ACCESS).sort((a, b) => b.length - a.length);
  return keys.find((k) => pathname === k || pathname.startsWith(k + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  // Rutas públicas → permitir
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  // ¿Alguna sección protegida?
  const section = matchPrefix(pathname);
  if (!section) return NextResponse.next(); // si no está en ACCESS, dejamos pasar (o añade más prefijos)

  // Lee token de NextAuth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("🔍 [MIDDLEWARE]", {
    pathname,
    section,
    tokenRole: token?.role,
    tokenEmail: token?.email,
    tokenSub: token?.sub,
  });

  // Si no hay sesión → ir a login
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + (search || ""));
    return NextResponse.redirect(loginUrl);
  }

  // Chequeo de rol
  const role = (token.role as string) || "ESTUDIANTE";
  const allowed = ACCESS[section];
  
  console.log("🔍 [MIDDLEWARE] Checking access:", {
    role,
    allowed,
    isAllowed: allowed.includes(role as any)
  });
  
  if (!allowed.includes(role as any)) {
    // Redirecciones por rol según tipo de usuario
    let redirectTo = "/dashboard";
    
    if (role === "EMPRESARIO") {
      redirectTo = "/dashboard/empresario";
    } else if (role === "LIDER") {
      redirectTo = "/dashboard/lider";
    } else if (role === "ESTUDIANTE") {
      redirectTo = "/dashboard/miembro";
    } else if (role === "ADMIN") {
      redirectTo = "/dashboard/lider"; // o una ruta específica de admin
    }
    
    console.log("❌ [MIDDLEWARE] Not allowed, redirecting to:", redirectTo);
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  console.log("✅ [MIDDLEWARE] Access granted");
  return NextResponse.next();
}

export const config = {
  // protege estas rutas con el middleware
  matcher: [
    "/dashboard/:path*",
  ],
};
