import { api } from "./client";
import type { ProductRecord, CollectionRecord, CategoryRecord } from "../types/admin";

function list<T>(value: T[] | { results: T[] }) { return Array.isArray(value) ? value : value.results; }

function product(value: Record<string, unknown>): ProductRecord {
  return {
    ...value,
    id: String(value.id),
    compare_at_price: Number(value.compare_at_price ?? 0),
    is_new: Boolean(value.is_new ?? false),
    created_at: String(value.created_at ?? ""),
    category: typeof value.category === "string" ? value.category : "",
    collection: typeof value.collection === "string" ? value.collection : "",
    variants: (value.variants as any[]) ?? [],
    images: (value.images as string[]) ?? [],
    colors: (value.colors as string[]) ?? []
  } as ProductRecord;
}

function collectionRecord(value: Record<string, unknown>): CollectionRecord {
  return {
    ...value,
    id: String(value.id),
    product_ids: (value.product_ids as string[]) ?? []
  } as CollectionRecord;
}

export async function fetchProducts(active = true) {
  const value = await api.get<unknown[] | { results: unknown[] }>(`/products/${active ? "?active=true" : ""}`);
  return list(value).map((item) => product(item as Record<string, unknown>));
}
export async function searchProducts(query: string) {
  const value = await api.get<unknown[] | { results: unknown[] }>(`/products/?q=${encodeURIComponent(query)}`);
  return list(value).map((item) => product(item as Record<string, unknown>));
}
export async function fetchCollections(active = true) {
  const value = await api.get<unknown[] | { results: unknown[] }>(`/collections/${active ? "?active=true" : ""}`);
  return list(value).map((item) => collectionRecord(item as Record<string, unknown>));
}
export async function fetchCategories() {
  const value = await api.get<CategoryRecord[] | { results: CategoryRecord[] }>("/categories/");
  return list(value);
}
