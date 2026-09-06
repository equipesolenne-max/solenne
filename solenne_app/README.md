# SOLENNE — Flutter Mobile App (Scaffold)

Quiet luxury for the modern hijab wardrobe — mobile continuation of the
existing SOLENNE website.

## What's in this scaffold

```
lib/
├── main.dart              # App entry, Firebase init, Provider wiring
├── theme/                 # SolenneTheme: colors, typography, spacing, borders
├── ui/
│   ├── components/        # SolenneLogo, SolenneButton, SolenneProductCard, etc.
│   └── screens/           # All screens from the acceptance checklist
├── models/                # Product, Order, Customer, Inquiry, Notification
├── services/               # FirebaseService + repositories (Firestore access)
└── state/                 # CartState, WishlistState, AuthState (Provider)
assets/
└── brand/                 # Exact icon.svg / monogram.svg marks (light & dark)
```

## Before you run this

1. **Install dependencies**
   ```
   flutter pub get
   ```

2. **Connect to the EXISTING SOLENNE Firebase project — not a new one.**
   ```
   dart pub global activate flutterfire_cli
   flutterfire configure
   ```
   Select the SOLENNE project (the same one the website/admin dashboard
   uses). This generates `lib/firebase_options.dart`. Then in `main.dart`:
   - uncomment `import 'firebase_options.dart';`
   - change `Firebase.initializeApp()` to
     `Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform)`

3. **Verify the Firestore schema.** The models and repositories in
   `lib/models/` and `lib/services/` use *placeholder* field/collection
   names (`products`, `orders`, `customers`, `inquiries`, `notifications`,
   plus fields like `wilaya`, `commune`, `variants`, etc). Every model file
   has a comment flagging this. Open the existing web app's Firestore
   collections and adjust `fromMap`/`toMap` and the repository queries to
   match exactly — do not let the app create a parallel/duplicate schema.

4. **Firestore Security Rules.** This app assumes rules already scope
   customers to their own `orders`/`inquiries`/`notifications` documents
   (e.g. `customerId == request.auth.uid`). Confirm this holds and do not
   weaken it. No admin operations are exposed anywhere in this app.

5. **Fonts.** Marcellus / Cormorant Garamond / Jost are pulled at runtime
   via `google_fonts` so the app doesn't need bundled `.ttf` files to run.
   If you want fully offline/vendored fonts instead, drop the `.ttf` files
   into `assets/fonts/`, uncomment the `fonts:` block in `pubspec.yaml`,
   and swap the `GoogleFonts.*` calls in
   `lib/theme/solenne_typography.dart` for `TextStyle(fontFamily: '...')`.

6. **Product images.** `SolenneProductCard` and product/order screens use
   `Image.network` against the `images` field on each product/order-item.
   No placeholder image assets are bundled — verify the real image URLs
   coming from Firestore/Storage render correctly.

## What's fully built vs. scaffolded

**Fully built to the brand spec:** theme system (colors/type/spacing/
borders), all reusable components, brand SVG marks, Home/Shop/Search/
Product Details/Cart/Checkout/Order Confirmation/Wishlist/Account/Auth/
Orders/Order Details/Notifications/Inquiries screens, cart & wishlist
state, bottom nav + app bar.

**Needs your input before shipping:**
- Real Firestore collection/field names (see step 3 above)
- Real shipping-cost logic (currently a flat placeholder in
  `cart_screen.dart` / `checkout_screen.dart`)
- Wilaya/Commune as pickers instead of free-text fields, if the website
  uses fixed lists
- Saved-addresses read/write (currently an empty-state placeholder)
- Push notifications wiring (FCM) if the web app sends any
- App icon / splash screen generation from `assets/brand/monogram_light.svg`

## Design tokens quick reference

| Token | Hex |
|---|---|
| midnight | `#1B2A46` |
| ivory | `#F8F4EC` |
| gold | `#C6A369` |

See `lib/theme/solenne_colors.dart` for the full palette.
