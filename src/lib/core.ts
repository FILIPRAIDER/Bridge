export const CORE =
  process.env.NEXT_PUBLIC_CORE_API_BASE_URL ||
  process.env.CORE_API_BASE_URL ||
  "http://localhost:4001";

export async function coreFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = `${CORE}${path}`;
  
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      // si llamas desde server actions y tu core exige CORS, puedes agregar: cache: "no-store"
    });
    
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      let errorData = null;
      
      try {
        const text = await res.text();
        if (text) {
          try {
            errorData = JSON.parse(text);
            // Intentar extraer mensaje en diferentes formatos
            msg = errorData?.message || errorData?.error || errorData?.details || msg;
          } catch {
            // No es JSON, usar texto directamente
            msg = text;
          }
        }
      } catch (e) {
        console.error("Error parsing response:", e);
      }
      
      // Mejorar mensajes comunes
      const msgStr = String(msg || ""); // Asegurar que sea string
      
      if (res.status === 401) {
        msg = msgStr.includes("Invalid") || msgStr.includes("incorrect") 
          ? "Email o contraseña incorrectos" 
          : "No autorizado";
      } else if (res.status === 404 && path.includes("/auth/login")) {
        msg = "El usuario no existe";
      } else if (res.status === 500) {
        msg = "Error del servidor. Intenta nuevamente.";
      }
      
      console.error(`coreFetch error [${res.status}] ${url}:`, msg, errorData);
      throw new Error(msg);
    }
    
    return res.json();
  } catch (error) {
    // Si es un error de red (no de respuesta HTTP)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("Network error:", error);
      throw new Error("No se pudo conectar al servidor. Verifica tu conexión.");
    }
    throw error;
  }
}
