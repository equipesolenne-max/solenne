import type { Product, Collection } from "../types/product";
import type { CollectionRecord, ProductRecord } from "../types/admin";
import { fetchCollections, fetchProducts } from "../api/products";
import { getImageUrl } from "../utils/image";

const CACHE_TTL = 120_000; // 2 minutes in-memory cache

// Memory cache stores
const productCacheMap = new Map<string, Product>();
const collectionCacheMap = new Map<string, Collection>();

let allProductsCache: { products: Product[]; expiresAt: number } | null = null;
let allProductsRequest: Promise<Product[]> | null = null;

let allCollectionsCache: { collections: Collection[]; expiresAt: number } | null = null;
let allCollectionsRequest: Promise<Collection[]> | null = null;

let homeDataCache: { products: Product[]; collections: Collection[]; expiresAt: number } | null = null;
let homeDataRequest: Promise<{ products: Product[]; collections: Collection[] }> | null = null;

export async function fetchHomeData(productLimit = 4, collectionLimit = 3): Promise<{ products: Product[]; collections: Collection[] }> {
  if (homeDataCache && homeDataCache.expiresAt > Date.now()) {
    return homeDataCache;
  }
  if (homeDataRequest) return homeDataRequest;

  homeDataRequest = (async () => {
    const [productRecords, collectionRecords] = await Promise.all([fetchProducts(), fetchCollections()]);
    const products = productRecords.slice(0, productLimit).map((data) => {
      const prod = toProduct(data);
      productCacheMap.set(prod.id, prod);
      if (prod.legacyId) productCacheMap.set(prod.legacyId, prod);
      return prod;
    });

    const collections = collectionRecords.slice(0, collectionLimit).map((data) => {
      const col = toCollection(data);
      collectionCacheMap.set(col.id, col);
      if (col.legacyId) collectionCacheMap.set(col.legacyId, col);
      return col;
    });

    const result = { products, collections };
    homeDataCache = { ...result, expiresAt: Date.now() + CACHE_TTL };
    return result;
  })().finally(() => {
    homeDataRequest = null;
  });

  return homeDataRequest;
}

export async function fetchPublicProducts(): Promise<Product[]> {
  if (allProductsCache && allProductsCache.expiresAt > Date.now()) {
    return allProductsCache.products;
  }
  if (allProductsRequest) return allProductsRequest;

  allProductsRequest = (async () => {
    const products = (await fetchProducts()).map((data) => {
      const prod = toProduct(data);
      productCacheMap.set(prod.id, prod);
      if (prod.legacyId) productCacheMap.set(prod.legacyId, prod);
      return prod;
    });

    allProductsCache = { products, expiresAt: Date.now() + CACHE_TTL };
    return products;
  })().finally(() => {
    allProductsRequest = null;
  });

  return allProductsRequest;
}

export async function fetchPublicCollections(): Promise<Collection[]> {
  if (allCollectionsCache && allCollectionsCache.expiresAt > Date.now()) {
    return allCollectionsCache.collections;
  }
  if (allCollectionsRequest) return allCollectionsRequest;

  allCollectionsRequest = (async () => {
    const collections = (await fetchCollections()).map((data) => {
      const col = toCollection(data);
      collectionCacheMap.set(col.id, col);
      if (col.legacyId) collectionCacheMap.set(col.legacyId, col);
      return col;
    });

    allCollectionsCache = { collections, expiresAt: Date.now() + CACHE_TTL };
    return collections;
  })().finally(() => {
    allCollectionsRequest = null;
  });

  return allCollectionsRequest;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!id) return null;
  if (productCacheMap.has(id)) {
    return productCacheMap.get(id)!;
  }
  const allProds = await fetchPublicProducts();
  return allProds.find((p) => p.id === id || p.legacyId === id || p.slug === id) ?? null;
}

export async function fetchCollectionById(id: string): Promise<Collection | null> {
  if (!id) return null;
  if (collectionCacheMap.has(id)) {
    return collectionCacheMap.get(id)!;
  }
  const allCols = await fetchPublicCollections();
  return allCols.find((c) => c.id === id || c.legacyId === id || c.slug === id) ?? null;
}

export async function fetchCachedCatalog() {
  const [products, collections] = await Promise.all([fetchPublicProducts(), fetchPublicCollections()]);
  return { products, collections };
}

export async function performSearch(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  const { searchProducts } = await import("../api/products");
  const records = await searchProducts(query);
  return records.map(toProduct);
}

export function invalidateCatalogCache() {
  allProductsCache = null;
  allCollectionsCache = null;
  homeDataCache = null;
  productCacheMap.clear();
  collectionCacheMap.clear();
}

export function toProduct(record: ProductRecord): Product {
  const productImages = (record.images ?? []).map(getImageUrl);

  return {
    id: record.id,
    legacyId: record.legacy_id,
    name: record.name,
    price: record.price,
    compareAtPrice: record.compare_at_price,
    description: record.description,
    collection: record.collection,
    slug: record.slug,
    collectionId: record.collection_id,
    collectionSlug: record.collection_slug,
    category: record.category,
    images: productImages.length > 0 ? productImages : ["https://placehold.co/1000x1250/F3EDE1/1B2A46?text=Solenne"],
    variants: (record.variants ?? []).map((v) => {
      const variantImages = (v.images ?? []).map(getImageUrl);
      return {
        id: v.id || "",
        name: v.name,
        size: v.size,
        hex: v.hex,
        image: variantImages[0] ?? productImages[0] ?? "https://placehold.co/1000x1250/F3EDE1/1B2A46?text=Solenne",
        images: variantImages,
        stock: v.stock ?? 0,
        price: v.price,
        compareAtPrice: v.compare_at_price,
        sku: v.sku,
      };
    }),
    isNew: record.is_new,
    inStock: record.variants?.length ? record.variants.some((v) => (v.stock ?? 0) > 0) : record.stock > 0,
    material: record.material,
    dimensions: record.dimensions,
    // Add these if they exist in record, or leave as undefined
    care: (record as any).care,
    details: (record as any).details,
  };
}

export function toCollection(record: CollectionRecord): Collection {
  return {
    id: record.id,
    legacyId: record.legacy_id,
    name: record.name,
    slug: record.slug,
    tagline: record.description,
    image: getImageUrl(record.image),
    productIds: record.product_ids ?? []
  };
}
