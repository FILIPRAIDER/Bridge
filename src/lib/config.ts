// Backend API URL
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_CORE_API_BASE_URL ||
  "https://proyectoia-backend.onrender.com";



// Frontend App URL
export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL ||
  "http://localhost:3000";

// ImageKit URL (si se usa directamente desde el frontend)
export const IMAGEKIT_URL =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL ||
  "https://ik.imagekit.io";

// Timeouts
export const API_TIMEOUT = 30000; // 30 segundos
export const COLD_START_TIMEOUT = 60000; // 60 segundos para cold starts de Render

// Health Check
export async function checkBackendHealth() {
  try {
    // Intentar con /api/users/me o cualquier endpoint que exista
    // Si falla, asumimos que el backend está online (evita cold start issues)
    const response = await fetch(`${API_BASE_URL}/api/auth/check`, {
      method: "GET",
      signal: AbortSignal.timeout(10000), // 10 segundos
    });
    
    // Render puede tardar en iniciar (cold start)
    // Consideramos "online" si responde con cualquier código HTTP
    // incluso 401/404, porque significa que el servidor está activo
    return {
      online: true,
      status: response.status,
    };
  } catch (error) {
    console.error("Backend health check failed:", error);
    
    // Si es un error de red o timeout, asumimos cold start
    // y consideramos online de todas formas (Render puede tardar)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (error instanceof TypeError || errorMessage.includes("timeout")) {
      console.warn("Backend might be in cold start, proceeding anyway");
      return {
        online: true,
        coldStart: true,
      };
    }
    
    return {
      online: false,
      error: errorMessage,
    };
  }
}
