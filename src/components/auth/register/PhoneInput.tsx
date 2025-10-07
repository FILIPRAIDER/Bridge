"use client";

import { useEffect, useState } from "react";
import { parsePhoneNumber, getCountries, getCountryCallingCode } from "libphonenumber-js";
import { ChevronDown, Phone } from "lucide-react";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

const COUNTRY_DATA: Record<string, { name: string; flag: string }> = {
  CO: { name: "Colombia", flag: "🇨🇴" },
  US: { name: "Estados Unidos", flag: "🇺🇸" },
  MX: { name: "México", flag: "🇲🇽" },
  ES: { name: "España", flag: "🇪🇸" },
  AR: { name: "Argentina", flag: "🇦🇷" },
  CL: { name: "Chile", flag: "🇨🇱" },
  PE: { name: "Perú", flag: "🇵🇪" },
  VE: { name: "Venezuela", flag: "🇻🇪" },
  EC: { name: "Ecuador", flag: "🇪🇨" },
  GT: { name: "Guatemala", flag: "🇬🇹" },
  CU: { name: "Cuba", flag: "🇨🇺" },
  BO: { name: "Bolivia", flag: "🇧🇴" },
  DO: { name: "República Dominicana", flag: "🇩🇴" },
  HN: { name: "Honduras", flag: "🇭🇳" },
  PY: { name: "Paraguay", flag: "🇵🇾" },
  SV: { name: "El Salvador", flag: "🇸🇻" },
  NI: { name: "Nicaragua", flag: "🇳🇮" },
  CR: { name: "Costa Rica", flag: "🇨🇷" },
  PA: { name: "Panamá", flag: "🇵🇦" },
  UY: { name: "Uruguay", flag: "🇺🇾" },
};

export function PhoneInput({ value = "", onChange, error }: PhoneInputProps) {
  const [country, setCountry] = useState<string>("CO");
  const [number, setNumber] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");

  const countries = getCountries();
  const filteredCountries = countries
    .filter((code) => COUNTRY_DATA[code])
    .filter((code) => {
      const data = COUNTRY_DATA[code];
      return data.name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => COUNTRY_DATA[a].name.localeCompare(COUNTRY_DATA[b].name));

  useEffect(() => {
    if (value) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed) {
          setCountry(parsed.country || "CO");
          setNumber(parsed.nationalNumber);
        }
      } catch {
        // Si no se puede parsear, dejar valores por defecto
      }
    }
  }, [value]);

  const handleNumberChange = (newNumber: string) => {
    setNumber(newNumber);
    try {
      const callingCode = getCountryCallingCode(country as any);
      const fullNumber = `+${callingCode}${newNumber}`;
      onChange?.(fullNumber);
    } catch {
      onChange?.(newNumber);
    }
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setShowDropdown(false);
    if (number) {
      try {
        const callingCode = getCountryCallingCode(newCountry as any);
        const fullNumber = `+${callingCode}${number}`;
        onChange?.(fullNumber);
      } catch {
        onChange?.(number);
      }
    }
  };

  const callingCode = country ? `+${getCountryCallingCode(country as any)}` : "";
  const countryData = COUNTRY_DATA[country];

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        {/* Selector de país */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-3 rounded-xl border border-gray-300 hover:border-gray-400 transition-colors bg-white min-w-[120px]"
          >
            <span className="text-xl">{countryData?.flag || "🌍"}</span>
            <span className="text-sm font-medium text-gray-700">{callingCode}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-80 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Buscar país..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto">
                  {filteredCountries.map((code) => {
                    const data = COUNTRY_DATA[code];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const cc = `+${getCountryCallingCode(code as any)}`;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleCountryChange(code)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="text-xl">{data.flag}</span>
                        <span className="flex-1 text-sm">{data.name}</span>
                        <span className="text-sm text-gray-500">{cc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Input de número */}
        <div className="flex-1 relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            value={number}
            onChange={(e) => handleNumberChange(e.target.value.replace(/\D/g, ""))}
            placeholder="300 123 4567"
            className={`input pl-10 ${error ? "border-red-500" : ""}`}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
