"use client";

import { useState, useEffect } from "react";
import { useCountries } from "@/hooks/useCountries";
import { useCities } from "@/hooks/useCities";

interface LocationSelectorProps {
  countryValue?: string;
  cityValue?: string;
  addressValue?: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
  onAddressChange?: (address: string) => void;
  required?: boolean;
  disabled?: boolean;
}

/**
 * LocationSelector
 * 
 * Componente reutilizable para seleccionar ubicación con cascada País → Ciudad
 * 
 * @example
 * ```tsx
 * <LocationSelector
 *   countryValue={formData.country}
 *   cityValue={formData.city}
 *   onCountryChange={(country) => setFormData({...formData, country})}
 *   onCityChange={(city) => setFormData({...formData, city})}
 *   required
 * />
 * ```
 */
export function LocationSelector({
  countryValue = "",
  cityValue = "",
  addressValue = "",
  onCountryChange,
  onCityChange,
  onAddressChange,
  required = false,
  disabled = false,
}: LocationSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState(countryValue);

  const { data: countries, loading: countriesLoading } = useCountries();
  const { data: citiesData, loading: citiesLoading } = useCities(selectedCountry);

  // Sincronizar con props cuando cambien externamente
  useEffect(() => {
    if (countryValue !== selectedCountry) {
      setSelectedCountry(countryValue);
    }
  }, [countryValue]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCountry(value);
    onCountryChange(value);
    // Reset ciudad cuando cambia el país
    onCityChange("");
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCityChange(e.target.value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAddressChange?.(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* País */}
      <div>
        <label htmlFor="country" className="label">
          País {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="country"
          value={countryValue}
          onChange={handleCountryChange}
          className="input appearance-none cursor-pointer"
          disabled={countriesLoading || disabled}
          required={required}
        >
          <option value="">
            {countriesLoading ? "Cargando países..." : "Selecciona un país"}
          </option>
          {countries?.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ciudad */}
      <div>
        <label htmlFor="city" className="label">
          Ciudad {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="city"
          value={cityValue}
          onChange={handleCityChange}
          className="input appearance-none cursor-pointer"
          disabled={!selectedCountry || citiesLoading || disabled}
          required={required}
        >
          <option value="">
            {!selectedCountry
              ? "Primero selecciona un país"
              : citiesLoading
              ? "Cargando ciudades..."
              : "Selecciona una ciudad"}
          </option>
          {citiesData?.cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {!selectedCountry && (
          <p className="mt-1 text-xs text-gray-500">
            💡 Primero selecciona un país para ver las ciudades disponibles
          </p>
        )}
      </div>

      {/* Dirección (opcional) */}
      {onAddressChange && (
        <div>
          <label htmlFor="address" className="label">
            Dirección <span className="text-gray-400 text-sm">(Opcional)</span>
          </label>
          <input
            id="address"
            type="text"
            value={addressValue}
            onChange={handleAddressChange}
            className="input"
            placeholder="Ej: Calle 123 #45-67, Apartamento 102"
            disabled={disabled}
          />
          <p className="mt-1 text-xs text-gray-500">
            Agrega más detalles de tu ubicación si lo deseas
          </p>
        </div>
      )}
    </div>
  );
}
