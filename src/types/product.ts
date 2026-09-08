export interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  hex: string;
  image: string;
  images: string[];
  stock: number;
  price?: number;
  compareAtPrice?: number;
  sku?: string;
}

export interface Product {
  id: string;
  legacyId?: string;
  name: string; // e.g. "SOLENNE SILK"
  price: number; // base price in DZD
  compareAtPrice?: number;
  description: string;
  collection: string;
  slug: string;
  collectionId?: string;
  collectionSlug?: string;
  category: string;
  images: string[]; // general images
  variants: ProductVariant[];
  isNew?: boolean;
  inStock: boolean;
  material?: string;
  dimensions?: string;
  care?: string;
  details?: string[];
}

export interface Collection {
  id: string;
  legacyId?: string;
  name: string;
  slug?: string;
  tagline: string;
  image: string;
  productIds?: string[];
}
