"use client";

import { useState, useEffect } from "react";
import { useCountries } from "@/hooks/useCountries";
import { Phone } from "lucide-react";

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  defaultCountryCode?: string; // Ej: "CO"
}

/**
 * Componente mejorado de input telefónico con selector de prefijo por país
 */
export function PhoneInputWithCountry({
  value,
  onChange,
  error,
  defaultCountryCode = "CO", // Colombia por defecto
}: PhoneInputWithCountryProps) {
  const { data: countries, loading: countriesLoading } = useCountries();
  const [selectedCountry, setSelectedCountry] = useState(defaultCountryCode);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Parsear el valor inicial si viene con prefijo
  useEffect(() => {
    if (value && countries) {
      // Buscar si el valor tiene un prefijo conocido
      const matchedCountry = countries.find((c) =>
        value.startsWith(c.dialCode)
      );

      if (matchedCountry) {
        setSelectedCountry(matchedCountry.code);
        setPhoneNumber(value.replace(matchedCountry.dialCode, "").trim());
      } else {
        // Si no tiene prefijo, asumir que es solo el número
        setPhoneNumber(value);
      }
    }
  }, [value, countries]);

  // Actualizar el valor completo cuando cambie el país o el número
  const updateFullValue = (countryCode: string, number: string) => {
    const country = countries?.find((c) => c.code === countryCode);
    if (country) {
      // Formato: +57 300 123 4567
      const cleanNumber = number.replace(/\s+/g, ""); // Remover espacios
      const fullValue = `${country.dialCode} ${cleanNumber}`;
      onChange(fullValue);
    } else {
      onChange(number);
    }
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    updateFullValue(countryCode, phoneNumber);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;
    // Permitir solo números y espacios
    const cleaned = newNumber.replace(/[^\d\s]/g, "");
    setPhoneNumber(cleaned);
    updateFullValue(selectedCountry, cleaned);
  };

  const selectedCountryData = countries?.find((c) => c.code === selectedCountry);

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        {/* Selector de país/prefijo */}
        <div className="w-32">
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            disabled={countriesLoading}
            className="input h-full py-2.5 text-sm appearance-none cursor-pointer"
          >
            {countriesLoading ? (
              <option value="">Cargando...</option>
            ) : (
              countries?.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.dialCode}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Input del número */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Phone className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="300 123 4567"
            className={`input pl-10 ${error ? "border-red-500 focus:ring-red-500" : ""}`}
            disabled={countriesLoading}
          />
        </div>
      </div>

      {/* Preview del número completo */}
      {selectedCountryData && phoneNumber && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <span>📱</span>
          <span>
            Formato completo: <strong>{selectedCountryData.dialCode} {phoneNumber}</strong>
          </span>
        </p>
      )}

      {/* Mensaje de error */}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
