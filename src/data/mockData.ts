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
    name: "SOLENNE SILK",
    variant: "Ivory",
    price: 2900,
    description:
      "Crafted from a fluid silk blend that drapes with quiet ease. Finished with hand-rolled edges and a subtle sheen that softens through the day.",
    collection: "silk-heritage",
    category: "Hijabs",
    images: [
      ph(1000, 1250, "F3EDE1", "1B2A46", "Solenne Silk — Ivory"),
      ph(1000, 1250, "E9E0D2", "1B2A46", "Detail"),
    ],
    colors: [
      { name: "Ivory", hex: "#F3EDE1", image: ph(1000, 1250, "F3EDE1", "1B2A46", "Ivory") },
      { name: "Midnight", hex: "#1B2A46", image: ph(1000, 1250, "1B2A46", "F8F4EC", "Midnight") },
      { name: "Champagne", hex: "#D9C39C", image: ph(1000, 1250, "D9C39C", "1B2A46", "Champagne") },
    ],
    isNew: true,
    inStock: true,
  },
  {
    id: "solenne-silk-beige",
    name: "SOLENNE SILK",
    variant: "Soft Beige",
    price: 2900,
    description:
      "The same fluid silk blend in a warm, muted beige. A versatile foundation piece for the everyday wardrobe.",
    collection: "silk-heritage",
    category: "Hijabs",
    images: [ph(1000, 1250, "DCD0BB", "1B2A46", "Solenne Silk — Beige")],
    colors: [
      { name: "Soft Beige", hex: "#DCD0BB", image: ph(1000, 1250, "DCD0BB", "1B2A46", "Beige") },
      { name: "Midnight", hex: "#1B2A46", image: ph(1000, 1250, "1B2A46", "F8F4EC", "Midnight") },
    ],
    inStock: true,
  },
  {
    id: "solenne-modal-midnight",
    name: "SOLENNE MODAL",
    variant: "Midnight",
    price: 1900,
    description:
      "Breathable modal jersey with just the right amount of stretch. Designed for effortless everyday wear.",
    collection: "modal-essentials",
    category: "Hijabs",
    images: [ph(1000, 1250, "1B2A46", "F8F4EC", "Solenne Modal — Midnight")],
    colors: [
      { name: "Midnight", hex: "#1B2A46", image: ph(1000, 1250, "1B2A46", "F8F4EC", "Midnight") },
      { name: "Ivory", hex: "#F3EDE1", image: ph(1000, 1250, "F3EDE1", "1B2A46", "Ivory") },
    ],
    isNew: true,
    inStock: true,
  },
  {
    id: "solenne-modal-gold",
    name: "SOLENNE MODAL",
    variant: "Champagne Gold",
    price: 1900,
    description:
      "A softly luminous modal essential, cut for everyday ease and finished with a delicate matte sheen.",
    collection: "modal-essentials",
    category: "Hijabs",
    images: [ph(1000, 1250, "D9C39C", "1B2A46", "Solenne Modal — Gold")],
    colors: [{ name: "Champagne", hex: "#D9C39C", image: ph(1000, 1250, "D9C39C", "1B2A46", "Gold") }],
    inStock: true,
  },
  {
    id: "solenne-atelier-drape",
    name: "SOLENNE DRAPE",
    variant: "Midnight",
    price: 4200,
    description:
      "A limited-run piece from the Atelier Edit — a heavier crepe with a considered fall, made in small batches.",
    collection: "atelier-edit",
    category: "Hijabs",
    images: [ph(1000, 1250, "101B30", "F8F4EC", "Solenne Drape")],
    colors: [{ name: "Midnight", hex: "#1B2A46", image: ph(1000, 1250, "101B30", "F8F4EC", "Midnight") }],
    inStock: false,
  },
  {
    id: "solenne-undercap-ivory",
    name: "SOLENNE UNDERCAP",
    variant: "Ivory",
    price: 900,
    description: "A soft, breathable base layer designed to sit smoothly beneath any hijab.",
    collection: "modal-essentials",
    category: "Essentials",
    images: [ph(1000, 1250, "F8F4EC", "1B2A46", "Undercap")],
    colors: [{ name: "Ivory", hex: "#F8F4EC", image: ph(1000, 1250, "F8F4EC", "1B2A46", "Ivory") }],
    inStock: true,
  },
];

export const heroImage = ph(1800, 1000, "E9E0D2", "1B2A46", "Solenne — Editorial");
export const brandStoryImage = ph(1000, 1200, "101B30", "D9C39C", "Atelier");
