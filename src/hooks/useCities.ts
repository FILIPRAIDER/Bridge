import { useState, useEffect } from "react";
import type { CitiesResponse } from "@/types/api";

export function useCities(countryCode?: string) {
  const [data, setData] = useState<CitiesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasCities, setHasCities] = useState(true);

  useEffect(() => {
    // No fetch if no country code
    if (!countryCode) {
      setData(null);
      setLoading(false);
      setHasCities(true);
      return;
    }

    const fetchCities = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/meta/cities/${countryCode}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch cities");
        }
        
        const result = await response.json();
        
        // Verificar si hay ciudades disponibles
        const cities = result?.cities || [];
        setHasCities(cities.length > 0);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setData(null);
        setHasCities(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [countryCode]);

  return { data, loading, error, hasCities };
}
