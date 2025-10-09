/**
 * Utilidades para formatear monedas
 */

/**
 * Formatea un monto con su moneda
 * @param amount - Monto numérico
 * @param currency - 'COP' o 'USD'
 * @param options - Opciones adicionales
 * @returns Monto formateado
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: 'COP' | 'USD' = 'COP',
  options: {
    showCurrencyName?: boolean;
    minimumFractionDigits?: number;
    locale?: string;
  } = {}
): string {
  if (!amount && amount !== 0) return 'No especificado';

  const {
    showCurrencyName = false,
    minimumFractionDigits = 0,
    locale = null
  } = options;

  // Determinar locale según moneda
  const currencyLocale = locale || (currency === 'USD' ? 'en-US' : 'es-CO');

  // Formatear monto
  const formatted = new Intl.NumberFormat(currencyLocale, {
    style: 'currency',
    currency: currency || 'COP',
    minimumFractionDigits
  }).format(amount);

  // Agregar nombre de moneda si se solicita
  if (showCurrencyName) {
    const currencyName = getCurrencyName(currency);
    return `${formatted} (${currencyName})`;
  }

  return formatted;
}

/**
 * Obtiene el nombre completo de la moneda
 * @param currency - 'COP' o 'USD'
 * @returns Nombre de la moneda
 */
export function getCurrencyName(currency: 'COP' | 'USD'): string {
  const names: Record<string, string> = {
    'COP': 'Pesos Colombianos',
    'USD': 'Dólares',
  };
  return names[currency] || currency;
}

/**
 * Obtiene el símbolo de la moneda
 * @param currency - 'COP' o 'USD'
 * @returns Símbolo
 */
export function getCurrencySymbol(currency: 'COP' | 'USD'): string {
  const symbols: Record<string, string> = {
    'COP': '$',
    'USD': '$',
  };
  return symbols[currency] || '$';
}

/**
 * Detecta si un monto está en formato COP o USD
 * basado en el tamaño del número
 * @param amount - Monto numérico
 * @returns 'COP' o 'USD'
 */
export function guessCurrency(amount: number): 'COP' | 'USD' {
  // Si es mayor a 100,000, probablemente es COP
  // Si es menor, probablemente es USD
  return amount >= 100000 ? 'COP' : 'USD';
}
