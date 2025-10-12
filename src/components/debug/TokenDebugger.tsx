"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function TokenDebugger() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const token = (session as any)?.accessToken;
      
      console.log("=== 🔍 TOKEN DEBUG INFO ===");
      console.log("Session exists:", !!session);
      console.log("Has accessToken:", !!token);
      console.log("Token length:", token?.length || 0);
      console.log("Token preview:", token ? token.substring(0, 30) + "..." : "NO TOKEN");
      console.log("User:", session.user);
      console.log("=========================");

      if (!token) {
        console.error("❌ NO TOKEN FOUND!");
        console.error("🔴 SOLUCIÓN: Debes hacer LOGOUT y LOGIN nuevamente");
        console.error("👉 Instrucciones: Ver SOLUCION_ERROR_401_AREAS.md");
      } else {
        console.log("✅ Token encontrado - Endpoints deberían funcionar");
      }
    }
  }, [session]);

  return null; // No renderiza nada, solo debug
}
