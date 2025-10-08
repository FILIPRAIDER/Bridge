import { API_BASE_URL, API_TIMEOUT } from "./config";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  // Timeout por defecto de 30 segundos (puede ser cold start)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      credentials: 'include', // Incluir cookies de autenticación
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });

    clearTimeout(timeoutId);
    
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      let errorDetails = null;
      
      try {
        const text = await res.text();
        console.error("Raw error response:", text);
        
        if (text) {
          try {
            errorDetails = JSON.parse(text);
            // Extraer mensaje anidado: { error: { message: "..." } }
            msg = errorDetails?.error?.message || errorDetails?.message || errorDetails?.error || errorDetails?.details || msg;
            console.error("API Error Details:", { status: res.status, url, response: errorDetails });
          } catch {
            // No es JSON válido, usar el texto directamente
            msg = text || msg;
            console.error("Non-JSON error:", text);
          }
        }
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
      }
      
      throw new ApiError(res.status, msg, errorDetails);
    }

    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Manejar timeout
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(
        408,
        "La solicitud tardó demasiado. El servidor puede estar iniciando (cold start). Intenta de nuevo en un momento."
      );
    }
    
    // Manejar errores de red
    if (error instanceof TypeError) {
      const isDev = process.env.NODE_ENV === 'development';
      const message = isDev
        ? `No se pudo conectar al servidor en ${API_BASE_URL}. ¿Está corriendo el backend? Error: ${error.message}`
        : "No se pudo conectar al servidor. Verifica tu conexión a internet.";
      
      console.error("🔴 Network Error:", {
        url,
        apiBaseUrl: API_BASE_URL,
        error: error.message,
        tip: isDev ? "Asegúrate de que el backend esté corriendo (npm run dev en el proyecto backend)" : "Verifica tu conexión"
      });
      
      throw new ApiError(0, message);
    }
    
    // Re-lanzar otros errores
    throw error;
  }
}

export const api = {
  get: <T = any>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "GET" }),

  post: <T = any>(path: string, body?: any, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(path: string, body?: any, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "DELETE" }),
};

export { ApiError };
