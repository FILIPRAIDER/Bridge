"use client";

import { useSectors } from "@/hooks/useSectors";

interface SectorSelectorProps {
  value?: string;
  onChange: (sectorId: string) => void;
  required?: boolean;
  disabled?: boolean;
  showDescription?: boolean;
}

/**
 * SectorSelector
 * 
 * Componente reutilizable para seleccionar sector profesional desde la BD
 * 
 * @example
 * ```tsx
 * <SectorSelector
 *   value={formData.sectorId}
 *   onChange={(sectorId) => setFormData({...formData, sectorId})}
 *   required
 * />
 * ```
 */
export function SectorSelector({
  value = "",
  onChange,
  required = false,
  disabled = false,
  showDescription = false,
}: SectorSelectorProps) {
  const { data: sectorsData, loading } = useSectors();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
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
      {showDescription && value && sectorsData && (
        <p className="mt-1 text-xs text-gray-600">
          {sectorsData.sectors.find((s) => s.id === value)?.description}
        </p>
      )}
    </div>
  );
}
