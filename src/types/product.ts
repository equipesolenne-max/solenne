export interface ProductColor {
  name: string;
  hex: string;
  image: string;
  images?: string[];
  stock?: number;
}

export interface Product {
  id: string;
  legacyId?: string;
  name: string; // e.g. "SOLENNE SILK"
  variant: string; // e.g. "Ivory"
  price: number; // in DZD
  description: string;
  collection: string;
  slug?: string;
  collectionId?: string;
  collectionSlug?: string;
  category: string;
  images: string[];
  colors: ProductColor[];
  isNew?: boolean;
  inStock: boolean;
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
