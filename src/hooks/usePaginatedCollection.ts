import { useState, useCallback, useEffect } from "react";
import { api } from "../api/client";

interface PaginatedOptions {
  pageSize?: number;
  orderField?: string;
  orderDirection?: "asc" | "desc";
  filters?: { field: string; operator: any; value: any }[];
}

export function usePaginatedCollection<T>(
  collectionName: string,
  options: PaginatedOptions = {}
) {
  const {
    pageSize = 10,
    orderField = "createdAt",
    orderDirection = "desc",
    filters = [],
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(
    async (isNext = false) => {
      setLoading(true);
      setError("");

      try {
        const nextPage = isNext ? page + 1 : 1;
        const params = new URLSearchParams({ page: String(nextPage), page_size: String(pageSize), ordering: `${orderDirection === "desc" ? "-" : ""}${orderField}` });
        filters.forEach((filter) => params.set(filter.field, String(filter.value)));
        const response = await api.get<T[] | { results: T[]; next: string | null }>(`/${collectionName}/?${params}`);
        const items = Array.isArray(response) ? response : response.results;

        if (isNext) {
          setData((prev) => [...prev, ...items]);
        } else {
          setData(items);
        }
        setPage(nextPage);
        setHasMore(Array.isArray(response) ? items.length === pageSize : Boolean(response.next));
      } catch (err) {
        console.error(`Error fetching paginated collection ${collectionName}:`, err);
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    },
    [collectionName, pageSize, orderField, orderDirection, filters, page]
  );

  useEffect(() => {
    void fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(filters), orderField, orderDirection]);

  const loadMore = () => {
    if (!loading && hasMore) {
      void fetchPage(true);
    }
  };

  return { data, loading, error, hasMore, loadMore, refresh: () => fetchPage() };
}
