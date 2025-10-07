import { API_BASE_URL } from "./config";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

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
    
    throw new ApiError(res.status, msg);
  }

  return res.json();
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
