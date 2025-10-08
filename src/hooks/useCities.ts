import { useState, useEffect } from "react";
import type { CitiesResponse } from "@/types/api";

export function useCities(countryCode?: string) {
  const [data, setData] = useState<CitiesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // No fetch if no country code
    if (!countryCode) {
      setData(null);
      setLoading(false);
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
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [countryCode]);

  return { data, loading, error };
}
