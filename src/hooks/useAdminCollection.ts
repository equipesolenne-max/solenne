import { useCallback, useEffect, useState } from "react";
import { listAdmin } from "../api/admin";

export function useAdminCollection<T>(resource: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setData(await listAdmin<T>(resource)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load data."); }
    finally { setLoading(false); }
  }, [resource]);
  useEffect(() => { void refresh(); }, [refresh]);
  return { data, setData, loading, error, refresh };
}
