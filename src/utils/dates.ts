/**
 * Utility para formatear fechas relativas
 * Ej: "hace 5 minutos", "hace 2 horas", "hace 1 día"
 */

export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return "hace unos segundos";
  } else if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`;
  } else if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
  } else if (diffInDays < 7) {
    return `hace ${diffInDays} ${diffInDays === 1 ? "día" : "días"}`;
  } else if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} ${diffInWeeks === 1 ? "semana" : "semanas"}`;
  } else if (diffInMonths < 12) {
    return `hace ${diffInMonths} ${diffInMonths === 1 ? "mes" : "meses"}`;
  } else {
    return `hace ${diffInYears} ${diffInYears === 1 ? "año" : "años"}`;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
