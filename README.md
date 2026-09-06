# SOLENNE — E-commerce Website (Phase 1: Visual Foundation)

This is Phase 1 of the Solenne build, following the brief's own instruction to establish
the visual foundation before wiring up Firebase.

## What's built

- **Design system** in `tailwind.config.js` and `src/index.css`, tokenized directly from
  the brand identity HTML (Midnight Blue, Warm Ivory, Soft Beige, Champagne Gold; Marcellus /
  Cormorant Garamond / Jost).
- **Logo component** (`src/components/Logo.tsx`) reusing the exact crescent/shawl SVG mark
  from the brand identity file, in light and dark variants.
- **Navbar** and **Footer** (Midnight Blue, ivory type, gold accents only).
- **Home page**: hero, featured collection, new arrivals grid, brand story (dark section),
  collections grid, newsletter.
- **Shop page**: category filter + sort, responsive product grid.
- **Product Detail page**: editorial gallery, color swatches, add-to-bag.
- **Cart page**: line items, quantity controls, order summary.
- **Product card**: hover quick-view/wishlist actions, "New"/"Sold Out" badges.
- All remaining routes (`Collections`, `About`, `Contact`, `Login`, `Account`, `Checkout`,
  `Admin`, etc.) are scaffolded with placeholder pages so the full site map/routing works
  end-to-end — content for these comes in Phase 2.

Product/collection data currently lives in `src/data/mockData.ts` with placeholder imagery
(swap for real photography). This mirrors the shape the Firestore `products` and
`collections` collections will use.

## Run it

```bash
npm install
npm run dev
```

## Phase 2 — Firebase integration

Not yet built (per the brief's own build order — visuals first, backend second):

- Firebase Auth (email/password + Google), protected routes, custom claims for admin
- Firestore collections: `users`, `products`, `collections`, `categories`, `orders`,
  `wishlists`, `carts`, `reviews`, `newsletterSubscribers`, `contactMessages`, `settings`
- Firebase Storage for product images
- Security rules (admin-gated writes, public reads on published products)
- Full Admin dashboard (products, orders, customers, collections, stats)
- Real cart/wishlist state (React Context + Firestore sync), checkout, order tracking
- Remaining public pages: Collections, Collection Detail, About, Contact, Search,
  Wishlist, Checkout, Order Confirmation, Login, Register, Forgot Password, Account,
  Orders, Order Details, FAQ, Shipping & Returns, Privacy Policy, Terms

## Folder structure

```
src/
├── components/   Logo, Navbar, Footer, ProductCard, SectionLabel
├── pages/        Home, Shop, ProductDetail, Cart, PagePlaceholder
├── layouts/       MainLayout (Navbar + Outlet + Footer)
├── data/         mockData.ts (swap for Firestore fetches)
├── types/        product.ts
└── utils/        currency.ts
```
