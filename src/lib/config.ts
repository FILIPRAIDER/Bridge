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
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(10000), // 10 segundos
    });
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      online: true,
      ...data,
    };
  } catch (error) {
    console.error("Backend health check failed:", error);
    return {
      online: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
