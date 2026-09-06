import { useEffect, useState } from "react";
import {
  fetchCachedCatalog,
  fetchHomeData,
  fetchPublicProducts,
  fetchProductById,
  fetchCollectionById,
} from "../services/catalog";
import type { Product, Collection } from "../types/product";

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchCachedCatalog()
      .then(({ products: nextProducts, collections: nextCollections }) => {
        if (cancelled) return;
        setProducts(nextProducts);
        setCollections(nextCollections);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load catalog.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, collections, loading, error };
}

export function useHomeCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchHomeData(4, 3)
      .then(({ products: nextProducts, collections: nextCollections }) => {
        if (cancelled) return;
        setProducts(nextProducts);
        setCollections(nextCollections);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load collection.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, collections, loading, error };
}

export function useShopCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchPublicProducts()
      .then((nextProducts) => {
        if (cancelled) return;
        setProducts(nextProducts);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}

export function useProductDetail(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(() => Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError("");

    void (async () => {
      try {
        const prod = await fetchProductById(id);
        if (cancelled) return;
        setProduct(prod);

        if (prod) {
          // Fetch all products asynchronously to get related products
          const all = await fetchPublicProducts();
          if (cancelled) return;

          // Improved logic: same collection first, then same category
          let rel = all.filter((p) => p.collection === prod.collection && p.id !== prod.id);

          if (rel.length < 4) {
            const sameCategory = all.filter((p) =>
              p.category === prod.category &&
              p.collection !== prod.collection &&
              p.id !== prod.id
            );
            rel = [...rel, ...sameCategory];
          }

          setRelated(rel.slice(0, 4));
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, related, loading, error };
}

function normalize(value: string | undefined) {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "";
}

function belongsToCollection(
  product: Product,
  collection: Collection
) {
  const collectionKeys = [collection.id, collection.legacyId, collection.name, collection.slug].map(normalize).filter(Boolean);
  const productKeys = [product.id, product.legacyId, product.slug, product.name, product.collection, product.collectionId, product.collectionSlug].map(normalize).filter(Boolean);
  const linkedProductKeys = (collection.productIds ?? []).map(normalize).filter(Boolean);

  return linkedProductKeys.some((key) => productKeys.includes(key))
    || productKeys.some((key) => collectionKeys.includes(key))
    || productKeys.some((key) => collectionKeys.some((collectionKey) => key.includes(collectionKey) || collectionKey.includes(key)));
}

export function useCollectionDetail(id: string | undefined) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(() => Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError("");

    void (async () => {
      try {
        const [col, allProducts] = await Promise.all([
          fetchCollectionById(id),
          fetchPublicProducts(),
        ]);
        if (cancelled) return;
        setCollection(col);
        if (col) {
          const prods = allProducts.filter((item) => belongsToCollection(item, col));
          setCollectionProducts(prods);
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load collection.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { collection, collectionProducts, loading, error };
}
