"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { BridgeLoader } from "@/components/ui/BridgeLoader";

function LoginForm() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const { show: toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  // Mostrar mensaje si viene desde registro
  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      toast({
        variant: "success",
        title: "¡Registro exitoso!",
        message: "Ahora inicia sesión con tus credenciales",
      });
    }
  }, [searchParams, toast]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");

    try {
      const res = await signIn("credentials", { redirect: false, email, password });
      
      if (res?.error) {
        // Mapear errores comunes de NextAuth
        let errorMessage = "Error al iniciar sesión";
        
        if (res.error === "CredentialsSignin") {
          errorMessage = "Email o contraseña incorrectos";
        } else if (res.error.includes("Email") || res.error.includes("email")) {
          errorMessage = "El email no existe";
        } else if (res.error.includes("password") || res.error.includes("contraseña")) {
          errorMessage = "Contraseña incorrecta";
        } else if (res.error.includes("bloqueado") || res.error.includes("blocked")) {
          errorMessage = "Tu cuenta está bloqueada";
        } else {
          // Usar el mensaje del backend si existe
          errorMessage = res.error;
        }
        
        console.error("❌ Login failed:", errorMessage);
        throw new Error(errorMessage);
      }
      
      if (!res?.ok) {
        throw new Error("Error al iniciar sesión. Intenta nuevamente.");
      }
      
      // Obtener la sesión actualizada para saber el rol
      const response = await fetch("/api/auth/session");
      const sessionData = await response.json();
      const role = sessionData?.user?.role;
      
      // Determinar el destino según el rol
      let destination = "/dashboard/miembro"; // Default
      
      if (role === "LIDER" || role === "ADMIN") {
        destination = "/dashboard/lider";
      } else if (role === "EMPRESARIO") {
        destination = "/empresa";
      } else if (role === "ESTUDIANTE") {
        destination = "/dashboard/miembro";
      }
      
      toast({ variant: "success", title: "¡Bienvenido!", message: "Accediendo a tu espacio..." });
      
      // Redirigir directamente al dashboard correcto (sin pasar por /dashboard)
      window.location.href = destination;
    } catch (e: any) {
      console.error("Login error:", e);
      
      // Extraer mensaje del error
      let errorMessage = "Error al iniciar sesión";
      
      if (typeof e === 'string') {
        errorMessage = e;
      } else if (e?.message && typeof e.message === 'string') {
        errorMessage = e.message;
      } else if (e?.error && typeof e.error === 'string') {
        errorMessage = e.error;
      } else if (e?.toString && e.toString() !== '[object Object]') {
        errorMessage = e.toString();
      }
      
      setErr(errorMessage);
      toast({ 
        variant: "error", 
        title: "No se pudo iniciar sesión", 
        message: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  }

  // Mostrar loader cuando está haciendo login o verificando sesión
  if (status === "loading" || (status === "authenticated" && session) || loading) {
    return (
      <BridgeLoader
        message={loading ? "Iniciando sesión" : "Verificando credenciales"}
        submessage={loading ? "Accediendo a tu espacio de trabajo" : "Un momento por favor"}
      />
    );
  }

  return (
    <main className="min-h-[80dvh] grid place-items-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Ingresar</h1>
        <p className="text-gray-600 mb-6">Usa tu email y contraseña.</p>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="input" placeholder="tucorreo@dominio.com" required />
          </div>

          <div>
            <label className="label">Contraseña</label>
            <div className="relative">
              <input
                name="password"
                type={show ? "text" : "password"}
                className="input pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute inset-y-0 right-3 my-auto h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100"
                aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {show ? (
                  <svg viewBox="0 0 24 24" className="mx-auto h-5 w-5"><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0-3C7 4 2.73 7.11 1 12c1.73 4.89 6 8 11 8s9.27-3.11 11-8c-1.73-4.89-6-8-11-8Z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="mx-auto h-5 w-5"><path fill="currentColor" d="M3.28 2.22 2.22 3.28l3.05 3.05C3.99 7.42 2.78 8.6 2 10c1.73 4.89 6 8 11 8 1.9 0 3.67-.47 5.25-1.3l2.47 2.47 1.06-1.06-18.5-18.9ZM12 6c4.85 0 9.1 3.06 10.83 8-1.05 2.95-3.2 5.1-5.83 6.15l-2.1-2.1c.69-.49 1.1-1.27 1.1-2.15a3 3 0 0 0-3-3c-.88 0-1.66.41-2.15 1.1L8 10.1A5 5 0 0 1 12 6Z"/></svg>
                )}
              </button>
            </div>
          </div>

          {err && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              <strong className="font-medium">Error:</strong> {err}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-dark w-full disabled:opacity-60">
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          ¿No tienes cuenta? <Link href="/auth/register" className="underline">Crear cuenta</Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-[80dvh] grid place-items-center px-4">
        <div className="w-full max-w-md">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
