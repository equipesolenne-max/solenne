import type { Product, Collection } from "../types/product";

// Editorial fallback imagery used only when the catalog has not been initialized.
const ph = (w: number, h: number, bg: string, fg: string, label: string) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(label)}&font=raleway`;

export const collections: Collection[] = [
  {
    id: "silk-heritage",
    name: "Silk Heritage",
    tagline: "Fluid silk blends in muted, wearable tones",
    image: ph(900, 1100, "E9E0D2", "1B2A46", "Silk Heritage"),
  },
  {
    id: "modal-essentials",
    name: "Modal Essentials",
    tagline: "Everyday jersey, engineered to drape",
    image: ph(900, 1100, "F3EDE1", "1B2A46", "Modal Essentials"),
  },
  {
    id: "atelier-edit",
    name: "The Atelier Edit",
    tagline: "Limited pieces, considered details",
    image: ph(900, 1100, "1B2A46", "F8F4EC", "Atelier Edit"),
  },
];

export const products: Product[] = [
  {
    id: "solenne-silk-ivory",
    slug: "solenne-silk-ivory",
    name: "SOLENNE SILK",
    price: 2900,
    description:
      "Crafted from a fluid silk blend that drapes with quiet ease. Finished with hand-rolled edges and a subtle sheen that softens through the day.",
    collection: "silk-heritage",
    category: "Hijabs",
    images: [
      ph(1000, 1250, "F3EDE1", "1B2A46", "Solenne Silk — Ivory"),
      ph(1000, 1250, "E9E0D2", "1B2A46", "Detail"),
    ],
    variants: [
      { id: "v1", name: "Ivory", hex: "#F3EDE1", image: ph(1000, 1250, "F3EDE1", "1B2A46", "Ivory"), images: [ph(1000, 1250, "F3EDE1", "1B2A46", "Ivory")], stock: 10 },
      { id: "v2", name: "Midnight", hex: "#1B2A46", image: ph(1000, 1250, "1B2A46", "F8F4EC", "Midnight"), images: [ph(1000, 1250, "1B2A46", "F8F4EC", "Midnight")], stock: 5 },
      { id: "v3", name: "Champagne", hex: "#D9C39C", image: ph(1000, 1250, "D9C39C", "1B2A46", "Champagne"), images: [ph(1000, 1250, "D9C39C", "1B2A46", "Champagne")], stock: 8 },
    ],
    isNew: true,
    inStock: true,
  },
  {
    id: "solenne-silk-beige",
    slug: "solenne-silk-beige",
    name: "SOLENNE SILK",
    price: 2900,
    description:
      "The same fluid silk blend in a warm, muted beige. A versatile foundation piece for the everyday wardrobe.",
    collection: "silk-heritage",
    category: "Hijabs",
    images: [ph(1000, 1250, "DCD0BB", "1B2A46", "Solenne Silk — Beige")],
    variants: [
      { id: "v4", name: "Soft Beige", hex: "#DCD0BB", image: ph(1000, 1250, "DCD0BB", "1B2A46", "Beige"), images: [ph(1000, 1250, "DCD0BB", "1B2A46", "Beige")], stock: 12 },
      { id: "v5", name: "Midnight", hex: "#1B2A46", image: ph(1000, 1250, "1B2A46", "F8F4EC", "Midnight"), images: [ph(1000, 1250, "1B2A46", "F8F4EC", "Midnight")], stock: 4 },
    ],
    inStock: true,
  },
  {
    id: "solenne-modal-midnight",
    slug: "solenne-modal-midnight",
    name: "SOLENNE MODAL",
    price: 1900,
    description:
      "Breathable modal jersey with just the right amount of stretch. Designed for effortless everyday wear.",
    collection: "modal-essentials",
    category: "Hijabs",
    images: [ph(1000, 1250, "1B2A46", "F8F4EC", "Solenne Modal — Midnight")],
    variants: [
      { id: "v6", name: "Midnight", hex: "#1B2A46", image: ph(1000, 1250, "1B2A46", "F8F4EC", "Midnight"), images: [ph(1000, 1250, "1B2A46", "F8F4EC", "Midnight")], stock: 20 },
      { id: "v7", name: "Ivory", hex: "#F3EDE1", image: ph(1000, 1250, "F3EDE1", "1B2A46", "Ivory"), images: [ph(1000, 1250, "F3EDE1", "1B2A46", "Ivory")], stock: 15 },
    ],
    isNew: true,
    inStock: true,
  },
  {
    id: "solenne-modal-gold",
    slug: "solenne-modal-gold",
    name: "SOLENNE MODAL",
    price: 1900,
    description:
      "A softly luminous modal essential, cut for everyday ease and finished with a delicate matte sheen.",
    collection: "modal-essentials",
    category: "Hijabs",
    images: [ph(1000, 1250, "D9C39C", "1B2A46", "Solenne Modal — Gold")],
    variants: [{ id: "v8", name: "Champagne", hex: "#D9C39C", image: ph(1000, 1250, "D9C39C", "1B2A46", "Gold"), images: [ph(1000, 1250, "D9C39C", "1B2A46", "Gold")], stock: 10 }],
    inStock: true,
  },
  {
    id: "solenne-atelier-drape",
    slug: "solenne-atelier-drape",
    name: "SOLENNE DRAPE",
    price: 4200,
    description:
      "A limited-run piece from the Atelier Edit — a heavier crepe with a considered fall, made in small batches.",
    collection: "atelier-edit",
    category: "Hijabs",
    images: [ph(1000, 1250, "101B30", "F8F4EC", "Solenne Drape")],
    variants: [{ id: "v9", name: "Midnight", hex: "#1B2A46", image: ph(1000, 1250, "101B30", "F8F4EC", "Midnight"), images: [ph(1000, 1250, "101B30", "F8F4EC", "Midnight")], stock: 0 }],
    inStock: false,
  },
  {
    id: "solenne-undercap-ivory",
    slug: "solenne-undercap-ivory",
    name: "SOLENNE UNDERCAP",
    price: 900,
    description: "A soft, breathable base layer designed to sit smoothly beneath any hijab.",
    collection: "modal-essentials",
    category: "Essentials",
    images: [ph(1000, 1250, "F8F4EC", "1B2A46", "Undercap")],
    variants: [{ id: "v10", name: "Ivory", hex: "#F8F4EC", image: ph(1000, 1250, "F8F4EC", "1B2A46", "Ivory"), images: [ph(1000, 1250, "F8F4EC", "1B2A46", "Ivory")], stock: 30 }],
    inStock: true,
  },
];

export const heroImage = ph(1800, 1000, "E9E0D2", "1B2A46", "Solenne — Editorial");
export const brandStoryImage = ph(1000, 1200, "101B30", "D9C39C", "Atelier");
