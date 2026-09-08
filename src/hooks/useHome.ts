import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { HomeSectionRecord } from "../types/admin";

export function useHome() {
  const [sections, setSections] = useState<HomeSectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHome() {
      try {
        const data = await api.get<HomeSectionRecord[]>("/home/");
        setSections(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load home content");
      } finally {
        setLoading(false);
      }
    }

    fetchHome();
  }, []);

  return { sections, loading, error };
}
