import { useState, useEffect } from "react";
import type { Sector } from "@/types/api";

interface SectorsResponse {
  ok: boolean;
  sectors: Sector[];
  total: number;
}

export function useSectors() {
  const [data, setData] = useState<SectorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/meta/sectors`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch sectors");
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

    fetchSectors();
  }, []);

  return { data, loading, error };
}
