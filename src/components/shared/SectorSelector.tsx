"use client";

import { useState } from "react";
import { useSectors } from "@/hooks/useSectors";

interface SectorSelectorProps {
  value?: string;
  onChange: (sectorId: string) => void;
  onCustomSectorChange?: (customSector: string) => void;
  customSectorValue?: string;
  required?: boolean;
  disabled?: boolean;
  showDescription?: boolean;
}

/**
 * SectorSelector
 * 
 * Componente reutilizable para seleccionar sector profesional desde la BD
 * Incluye soporte para "Otro" con campo de texto personalizado
 * 
 * @example
 * ```tsx
 * <SectorSelector
 *   value={formData.sectorId}
 *   onChange={(sectorId) => setFormData({...formData, sectorId})}
 *   onCustomSectorChange={(custom) => setFormData({...formData, customSector: custom})}
 *   required
 * />
 * ```
 */
export function SectorSelector({
  value = "",
  onChange,
  onCustomSectorChange,
  customSectorValue = "",
  required = false,
  disabled = false,
  showDescription = false,
}: SectorSelectorProps) {
  const { data: sectorsData, loading } = useSectors();
  
  // Verificar si el sector seleccionado es "Otro"
  const selectedSector = sectorsData?.sectors.find(s => s.id === value);
  const isOtherSelected = selectedSector?.nameEs?.toLowerCase().includes("otro") || 
                         selectedSector?.nameEn?.toLowerCase().includes("other");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const handleCustomSectorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCustomSectorChange?.(e.target.value);
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="sectorId" className="label">
          Sector Profesional {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="sectorId"
          value={value}
          onChange={handleChange}
          className="input appearance-none cursor-pointer"
          disabled={loading || disabled}
          required={required}
        >
          <option value="">
            {loading ? "Cargando sectores..." : "Selecciona un sector"}
          </option>
          {sectorsData?.sectors.map((sector) => (
            <option
              key={sector.id}
              value={sector.id}
              title={showDescription ? sector.description : undefined}
            >
              {sector.icon} {sector.nameEs}
            </option>
          ))}
        </select>
        {showDescription && value && sectorsData && !isOtherSelected && (
          <p className="mt-1 text-xs text-gray-600">
            {sectorsData.sectors.find((s) => s.id === value)?.description}
          </p>
        )}
      </div>

      {/* Campo de texto personalizado cuando selecciona "Otro" */}
      {isOtherSelected && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <label htmlFor="customSector" className="label text-sm">
            Especifica tu sector {required && <span className="text-red-500">*</span>}
          </label>
          <input
            id="customSector"
            type="text"
            value={customSectorValue}
            onChange={handleCustomSectorChange}
            placeholder="ej. Biotecnología, Gaming, Criptomonedas..."
            className="input"
            required={required}
            disabled={disabled}
            maxLength={100}
          />
          <p className="mt-1 text-xs text-gray-500">
            💡 Describe el sector específico en el que trabajas
          </p>
        </div>
      )}
    </div>
  );
}
