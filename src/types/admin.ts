export type AdminRole = "admin" | "customer";

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
}

export interface ProductRecord {
  id: string;
  legacy_id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  category: string;
  collection: string;
  collection_id?: string;
  collection_slug?: string;
  material: string;
  dimensions: string;
  colors: string[];
  variants?: ProductVariant[];
  stock: number;
  featured: boolean;
  bestseller: boolean;
  is_new: boolean;
  active: boolean;
  images: string[];
  created_at: string;
}

export interface ProductVariant {
  id?: string;
  name: string;
  hex: string;
  images: string[];
  media_images?: string[];
  stock?: number;
  sku?: string;
}

export interface CollectionRecord {
  id: string;
  legacy_id?: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  image: string;
  product_ids: string[];
  created_at: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  active: boolean;
  created_at: string;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  customer: string;
  email: string;
  phone: string;
  date: string;
  created_at: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method: string;
  payment_status: "pending" | "paid" | "refunded";
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  items: Array<{ product_id?: string; name: string; color?: string; size?: string; image?: string; quantity: number; price: number; subtotal: number }>;
  shipping: {
    wilaya: string;
    commune: string;
    address: string;
  };
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined_at?: string;
  order_count?: number;
  total_spent?: number;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  contactEmail: string;
  phone: string;
  currency: string;
  shippingPrice: number;
  lowStockThreshold: number;
  socialLinks: {
    instagram: string;
    tiktok: string;
    pinterest: string;
  };
  storeStatus: "open" | "maintenance";
}

export type HomeSectionType = "hero" | "featured_products" | "featured_collection" | "categories" | "banner" | "editorial" | "lookbook" | "custom";

export interface HomeSectionRecord {
  id: string;
  section_type: HomeSectionType;
  title: string;
  subtitle?: string;
  description?: string;
  media?: string;
  media_url?: string;
  link?: string;
  button_text?: string;
  is_active: boolean;
  position: number;
  configuration?: any;
  collection?: string;
  collection_detail?: CollectionRecord;
  gallery?: Array<{ id: string; url: string; position: number }>;
  products?: ProductRecord[];
  categories?: CategoryRecord[];
  created_at?: string;
  updated_at?: string;
}
