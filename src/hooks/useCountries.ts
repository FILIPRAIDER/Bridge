import { useState, useEffect } from "react";
import type { Country } from "@/types/api";

export function useCountries() {
  const [data, setData] = useState<Country[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/meta/countries`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch countries");
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

    fetchCountries();
  }, []);

  return { data, loading, error };
}
