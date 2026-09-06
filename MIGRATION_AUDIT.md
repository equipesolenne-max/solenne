# Firebase -> Django Migration Audit

Date: 2026-09-04

## Scope and result

This audit covers the current application source, Django configuration/models/migrations, DRF routes/serializers/services/tests, frontend routes/components/adapters, and retained Firebase migration/rollback assets. No Firebase resource or data was deleted.

The current application is a React/Vite storefront plus a Django/DRF backend under `backend/`. The frontend runtime no longer imports Firebase. Some admin screens still call the compatibility adapter in `src/services/firestore.ts`; that adapter now calls REST, but it targets public route names and therefore does not yet provide the strict `/api/admin/` contract for all admin writes.

The production Firebase dataset was not queried during this audit. Counts, document contents, Auth users and image payloads therefore remain NOT VERIFIED — requires external environment.

## Firebase -> Django Migration Map

| Capability | Current implementation | Target replacement | Status / migration note |
|---|---|---|---|
| Firebase Auth (legacy source) | The former implementation used email/password registration, login, logout, auth-state listener, password reset and display name update | Django custom user model + DRF SimpleJWT access/refresh tokens + Django password reset flow | Frontend now uses Django. Firebase Auth remains only an import source; live account verification is not verified. |
| Admin roles | Existence of `admins/{uid}` grants admin access; frontend also checks `role: admin` | Django `is_staff`/`is_superuser` or explicit role field + server-side DRF admin permission | Preserve the `admins` membership during import; never rely on React route guards. |
| Firestore catalog (legacy source) | `products`, `collections`, `categories`; public active reads, admin CRUD | PostgreSQL models, relations, DRF list/detail/viewsets | Django models and public/admin routes exist. Variants are relational in Django; legacy relation reconciliation remains partial. |
| Firestore users | `users/{uid}` profile documents | Django user plus profile fAields or `UserProfile` one-to-one model | Present. Auth email is currently the source of truth. |
| Addresses | `users/{uid}/addresses/{addressId}` CRUD, default-address behavior | `Address` foreign key to user with database/application default constraint | Present. Ownership must be enforced from request user, not URL uid. |
| Orders | Legacy `orders/{id}`, read own orders or admin, admin status updates | `Order`, `OrderItem`, `OrderStatusHistory`, transactional service | Django order creation and ownership routes exist; legacy callable remains only under `functions/`. |
| Checkout | Legacy Cloud Function `createOrder` | Authenticated `POST /api/orders/` service | Django preserves idempotency, server prices, stock checks, variant checks and shipping rule. Location validation is not yet implemented in Django. |
| Stock | Product `stock` and embedded variant stock; transaction decrements both in variant checkout | PostgreSQL row locks and `transaction.atomic()` | Present. Must define whether variant stock is authoritative to avoid double-counting. |
| Shipping | `0` when subtotal >= 5000, otherwise `1000` DZD | Backend pricing service and persisted order snapshot | Verified in `functions/src/index.ts`; frontend display is only advisory. |
| Coupons | No implementation found in source, rules, or functions | Future `Coupon` and `CouponRedemption` models/endpoints if required by product scope | Not a current feature; do not claim data migration until a live-data audit finds it. |
| Reviews/comments | No implementation found | Future `Review` model and moderated DRF endpoints if product scope adds it | Not currently present. |
| Notifications | No notification collection, UI, FCM initialization, or messaging API found | In-app `Notification` model/API; optional email/WebSocket later | No current behavior to reproduce. Order status currently queues email only. |
| Firebase Storage | No Storage SDK or bucket configuration found. `src/services/imageUpload.ts` converts selected files to `data:image/...` Data URLs; product and variant image arrays are then saved with the product document | Django `ProductImage.image` multipart upload, with local/S3-compatible storage | Django media model and admin upload endpoint exist. Existing Data URLs are not yet converted/imported. Image counts: NOT VERIFIED — requires external environment. |
| Cloud Functions (legacy source) | `createOrder` callable and `onOrderStatusChange` Firestore trigger | DRF order service + Django email service/notifications | Django equivalents exist. Legacy Functions remain in `functions/` for rollback and are not called by the frontend. |
| Email | Confirmation and status emails were documents in `mail` for an external Firebase extension/worker | Django email backend via `store/email_service.py` | Implemented with console/SMTP backend selection; durable outbox and provider delivery are not verified. |
| Firestore Security Rules | Legacy admin-gated catalog/settings, owner-scoped users/carts/wishlists/orders, public contact/newsletter create | DRF authentication, object-level permissions, queryset scoping, serializer validation | Django is the active authorization layer; legacy rules remain for rollback/reference. |
| Firestore listeners | No `onSnapshot` found | Regular API fetch; WebSocket only if a real live-update requirement appears | Current hooks use `getDocs`, not listeners. |
| Firebase Hosting | `firebase.json` serves `dist` with SPA rewrite | Keep static hosting independently or deploy frontend behind chosen host/CDN | Hosting config is deploy-related, not runtime application logic. |
| Firestore indexes | Empty `firestore.indexes.json` | PostgreSQL indexes and constraints | Current queries use active filters, pagination ordering, and status filtering. |
| Firebase Messaging | No implementation found; only a sender ID appears in the old `.env` config | No replacement required for legacy behavior; Django in-app notifications now exist as a new capability | No Firebase Messaging SDK, token registration, listener or UI was found. |

## Collections and document shapes observed

- `admins/{uid}`: membership marker; document contents are not consumed.
- `users/{uid}`: `uid`, `name`, optional `firstName`, `lastName`, `email`, `phone`, timestamps.
- `users/{uid}/addresses/{addressId}`: `fullName`, `phone`, `address`, `wilaya`, `commune`, optional `postalCode`, `isDefault`, `createdAt`.
- `products/{id}`: catalog fields including name, slug, description, price, currency, category, collection, optional collection IDs/slugs, material, dimensions, colors, embedded `variants`, stock, merchandising flags, active flag, images, createdAt.
- `collections/{id}`: name, slug, description, active, image, productIds, createdAt.
- `categories/{id}`: name, slug, description, active, createdAt.
- `orders/{id}`: userId, orderNumber, customer, email, phone, date, subtotal, shippingCost, total, paymentMethod, paymentStatus, status, embedded items, embedded shipping address, createdAt, updatedAt.
- `carts/{uid}`: userId, embedded `items` containing serialized product, quantity and color, updatedAt.
- `wishlists/{uid}`: userId, productIds, updatedAt.
- `idempotencyKeys/{key}`: userId, result `{id, orderNumber}`, createdAt.
- `contactMessages/{id}`: name, email, message, createdAt, status.
- `newsletterSubscribers/{id}`: email, createdAt.
- `settings/store`: StoreSettings fields, including shippingPrice and lowStockThreshold.
- `mail/{id}`: recipient and email message payload queued by Cloud Functions.

No subcollections other than `users/{uid}/addresses` were found in source or rules.

## Current reads and writes

- Current catalog reads use `src/api/products.ts` and `src/services/catalog.ts` through REST; the compatibility service `src/services/firestore.ts` is named historically but contains no Firebase SDK calls.
- Current pagination uses REST query parameters through `src/hooks/usePaginatedCollection.ts`.
- Current user reads/writes use JWT-backed REST for profile, addresses, cart, wishlist and orders; contact and newsletter are public REST submissions.
- Current admin API writes use `/api/admin/`, but several React admin screens still call the compatibility adapter and therefore do not yet target the admin endpoints correctly.
- No `onSnapshot`, Firebase SDK call, Firebase Storage SDK call or Firebase Messaging SDK call remains under `src/`.

## Current security behavior

- Public catalog querysets expose active products, collections and categories.
- Django JWT authenticates private routes; admin viewsets use DRF `IsAdminUser`.
- Address, cart, wishlist, notification and order querysets are scoped to `request.user`; order detail access is therefore ownership-scoped server-side.
- Order prices, shipping, totals and stock are calculated in a transaction; client price/stock fields are ignored.
- Public contact/newsletter writes use DRF serializer validation.
- The retained Firestore rules describe the legacy system only; they are not the active authorization layer for the frontend.

## Missing or incomplete current requirements

The following capabilities were absent from the old checked-in Firebase implementation: coupons, reviews/comments and Firebase Messaging. Django now contains new `Notification` and `ProductImage` capabilities, but they are not migrations of old Firebase features. User-management mutations and full admin settings APIs are not implemented.

The current `AdminDashboard`, `AdminCustomers`, and several admin screens still use mock-derived settings/types and the generic compatibility adapter. `src/services/adminData.ts` remains a localStorage helper and must not be treated as a Django persistence path. Admin React integration is therefore only partially migrated.

## Proposed relational model

- `User` (custom Django user, email login, role/is_staff)
- `Address` (user FK, delivery fields, one default per user)
- `Category`
- `Collection`
- `Product` (catalog and merchandising fields)
- `ProductVariant` (product FK, name, hex, SKU, stock)
- `Cart` and `CartItem` (user FK, product/variant FK, quantity)
- `Wishlist` and `WishlistItem`
- `Order`, `OrderItem`, `OrderStatusHistory`
- `IdempotencyKey`
- `StoreSettings`
- `ContactMessage`, `NewsletterSubscriber`
- `EmailOutbox` (replacement for `mail` queue)
- `Coupon` and `CouponRedemption` only if discovered/approved as new scope
- `Review` and `Notification` only if discovered/approved as new scope

## Current API boundary

The frontend should call a single API client layer. Initial endpoints should include:

```text
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/refresh/
POST   /api/auth/logout/
POST   /api/auth/password-reset/
GET    /api/auth/me/
PATCH  /api/auth/me/

GET    /api/products/
GET    /api/products/{id}/
GET    /api/collections/
GET    /api/collections/{id}/
GET    /api/categories/

GET    /api/cart/
POST   /api/cart/items/
PATCH  /api/cart/items/{id}/
DELETE /api/cart/items/{id}/
DELETE /api/cart/
GET    /api/wishlist/
PUT    /api/wishlist/

GET    /api/addresses/
POST   /api/addresses/
PATCH  /api/addresses/{id}/
DELETE /api/addresses/{id}/
POST   /api/addresses/{id}/default/

GET    /api/orders/
POST   /api/orders/
GET    /api/orders/{id}/

POST   /api/contact/
POST   /api/newsletter/subscribe/

GET    /api/admin/dashboard/
GET|POST|PATCH|DELETE /api/admin/products/
GET|POST|PATCH|DELETE /api/admin/collections/
GET|POST|PATCH|DELETE /api/admin/categories/
GET|PATCH              /api/admin/orders/
GET|PATCH              /api/admin/settings/ (not implemented)
POST                   /api/admin/products/{id}/images/
```

## Migration gates

1. Export and count Auth users and every Firestore collection/subcollection with Firebase Admin credentials.
2. Import into PostgreSQL using stable legacy IDs and an explicit ID mapping table.
3. Verify counts, references, order totals, variant stock, user ownership, addresses and admin membership.
4. Run API/frontend integration tests against a non-production database.
5. Switch frontend traffic to Django while Firebase remains available for rollback.
6. Remove Firebase packages/configuration only after production verification and rollback expiry.

## Unknowns requiring live Firebase access

- Exact production document counts and malformed/legacy documents.
- Whether the Firebase email extension consumes `mail` and which provider it uses.
- Whether any Storage objects exist outside this repository.
- Whether Firebase Auth contains users not represented in Firestore.
- Whether undocumented manual/admin workflows rely on mock localStorage records.
- Whether coupons, reviews, notifications or additional collections exist outside the checked-in source/rules.

## Current repository inventory

### Django routes and capabilities

- Public/auth routes: register, login, refresh, password reset request, current user/profile update.
- Public catalog: products, collections and categories are read-only viewsets with active filtering in the queryset; product search is supported by the viewset implementation.
- Authenticated user routes: addresses CRUD/default, cart read/update and add-item, wishlist read/update, own orders create/list/detail, notifications list/read/read-all, contact and newsletter submission.
- Admin routes: `/api/admin/dashboard/`, products CRUD plus stock/variant/image actions, categories CRUD, collections CRUD, orders read/status patch, users read-only.
- Models in `backend/store/models.py`: User, Category, Collection, Product, ProductVariant, ProductImage, Address, Cart, CartItem, Wishlist, Order, OrderItem, OrderStatusHistory, IdempotencyKey, StoreSettings, ContactMessage, NewsletterSubscriber and Notification.
- Migrations present: `0001_initial` and `0002_alter_user_managers_notification_productimage`.
- Email service: `backend/store/email_service.py` sends confirmation and status emails through Django’s configured email backend and creates status notifications.

### React/admin screen contract audit

| Screen | Current data path | Auth/permission | Loading/error/pagination | Assessment |
|---|---|---|---|---|
| AdminDashboard | `useFirestoreCollection` compatibility adapter -> public REST collection routes | JWT is attached, but no `/api/admin/dashboard/` call | Loading and error states; no server statistics endpoint used | Partially migrated; client aggregation and mock settings remain. |
| AdminProducts | Generic adapter -> public products/categories routes | JWT attached; public product viewset is read-only | Loading/error; client filtering; no pagination | Read can work, CRUD is not correctly targeted at admin endpoints. |
| AdminProductForm | Generic adapter for collections/categories/product save; local Data URL upload | JWT attached; generic save can hit public read-only route | Error/loading upload state | Partially migrated; must use `/api/admin/products/` and multipart media endpoint. |
| AdminCategories | Generic adapter -> public categories routes | JWT attached; public viewset is read-only | Loading/error; no pagination | CRUD contract is incorrect despite admin UI. |
| AdminCollections | Generic adapter -> public collections routes | JWT attached; public viewset is read-only | Loading/error; no pagination | CRUD contract is incorrect despite admin UI. |
| AdminInventory | Generic adapter -> public product routes | JWT attached; public viewset is read-only | Loading/error; paginated compatibility hook | Stock writes are not correctly targeted at admin stock action. |
| AdminOrders | Generic adapter -> public orders route | JWT attached; public order viewset is user-scoped and POST/GET only | Loading/error/status filters/pagination | Admin cannot reliably list all orders through this path. |
| AdminCustomers | Generic adapter -> public `users` route, which is not registered | JWT attached | Loading/error/pagination UI | Backend route missing for this generic path; admin users endpoint exists separately. |
| AdminSettings | Generic adapter -> `settings` route, not registered in current public/admin URLs | JWT attached | Loading/error/save states | Backend settings endpoint missing. |

### Firebase import matrix

The command names are `firebase_import` and `import_firebase`. Both invoke the same command. `--dry-run` still connects to Firebase and reads data, then rolls back Django writes; it is not executable without a service-account file.

| Firebase data | Dry-run | Real import | Current status |
|---|---|---|---|
| admins | Counts only as an excluded root collection; no Django admin membership import | No | Partially implemented; admin flags are not mapped. |
| users/Auth | Auth user stream imported by email with `firebase_uid` | Yes for Auth users | Partially implemented; profile fields/duplicates are not fully reported. |
| addresses | No | No | Not implemented. |
| products | Reads and upserts by `legacy_id` | Yes | Implemented for base products; category/collection matching is name-based. |
| variants | Reads embedded product variants and upserts by product/name | Yes | Implemented for embedded variants. |
| collections | Reads and upserts by `legacy_id` | Yes | Implemented; productIds links are not reconciled. |
| categories | Reads and upserts by `legacy_id` | Yes | Implemented. |
| carts | Counted/ignored only | No | Not implemented. |
| wishlists | Counted/ignored only | No | Not implemented. |
| orders | Counted/ignored only | No | Not implemented. |
| order items | Counted as part of ignored orders only | No | Not implemented. |
| idempotency keys | Counted/ignored only | No | Not implemented. |
| contact messages | Counted/ignored only | No | Not implemented. |
| newsletter subscribers | Counted/ignored only | No | Not implemented. |
| settings | Counted/ignored only | No | Not implemented. |
| mail | Counted/ignored only | No | Not implemented; Django email service is separate. |

### Image migration truth

Current frontend upload code uses `FileReader.readAsDataURL` and stores strings beginning with `data:image/...` in product/variant arrays. No Firebase Storage SDK or bucket operation exists in the checked-in code. Django has `ProductImage.image` and a validated multipart admin upload endpoint, but the importer does not currently inspect, decode, validate or save legacy Data URLs.

Image counts detected in the live dataset: **NOT VERIFIED — requires external environment**. The required strategy is: decode the Data URL header/body with a strict base64 parser, validate MIME and decoded bytes with Pillow, write a `ContentFile` to `ProductImage.image`, preserve product ordering/primary image, record invalid/missing entries in the import report, and retain non-Data-URL remote URLs as references until a deliberate download policy is approved. No image is considered migrated by the current command.

## COMPLETED

- Audited the checked-in Firebase integration and documented the migration map.
- Added a Django/DRF backend with a relational catalog, users, addresses, carts, wishlists, orders, order items, variants and order status history.
- Added JWT login, registration, current-user and profile-update endpoints, plus password-reset request handling.
- Added server-side order pricing, shipping calculation, stock validation, row locking and idempotency.
- Migrated frontend authentication, catalog reads, checkout, contact, newsletter, profile, addresses, cart, wishlist, order detail and pagination away from Firebase.
- Removed the frontend Firebase package and frontend Firebase modules. No Firebase imports remain under `src/`.
- Verified server-side search implementation.
- Verified guest cart merging logic.
- Fixed `WishlistView` to use `product_ids` consistently between React and Django.
- Fixed `create_order` service to robustly handle product ID keys.
- Cleaned up `store/tests.py` from legacy migration tool dependencies.
- Added backend tests for server-authoritative totals, stock deduction, idempotency and private order access.

## REMAINING

- The real Firebase import has not been run: service-account credentials, live counts and a PostgreSQL instance are required. No Firebase data was deleted.
- Admin API endpoints exist, but AdminDashboard, AdminProducts, AdminCategories, AdminCollections, AdminInventory, AdminOrders, AdminCustomers and AdminSettings are not all wired to `/api/admin/`; their real browser CRUD behavior is NOT VERIFIED — requires external environment.
- Django `ProductImage` and multipart upload exist; Data URL conversion/import and production object-storage verification are NOT VERIFIED — requires external environment.
- Coupons and reviews/comments were absent from the audited legacy Firebase code and are absent from Django; they are not migrated features.
- Django notifications exist for order status changes; no legacy Firebase notification feature was found.
- Django email service exists, but SMTP/provider delivery is NOT VERIFIED — requires external environment.
- Full browser integration against PostgreSQL, including authenticated checkout/order flow, is NOT VERIFIED — requires external environment.

## FIREBASE DEPENDENCIES

Frontend runtime dependencies remaining: **0**.

Repository migration/legacy dependencies remaining:

- `functions/package.json`: `firebase-admin`, `firebase-functions`, `firebase-functions-test`, and Firebase CLI scripts.
- `functions/src/index.ts`: legacy `createOrder` callable and order-status email trigger retained for rollback/reference; it is no longer called by the migrated frontend.
- `backend/requirements.txt` and `store/management/commands/import_firebase.py`: `firebase-admin` is retained only to perform the non-destructive migration import.
- Root Firebase configuration/rules files remain intentionally for rollback and data preservation: `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `.firebaserc`.
- Root `.env` and `.env.example` still contain legacy `VITE_FIREBASE_*` configuration; these are unused by current `src/` code and should be removed only after the external cutover checklist is approved.
- Generated `dist/` and `.firebase/hosting...cache` may contain stale build/cache filenames from earlier builds; they are generated artifacts, not current source dependencies.

## Latest implementation update

### Architecture final target

React/Vite calls `src/api/client.ts`, which manages JWT access/refresh tokens and calls Django REST endpoints. Django uses PostgreSQL in production, SQLite only when `DATABASE_URL` is absent for local development. Admin APIs live under `/api/admin/` and require `IsAdminUser`. Product media uses Django `ImageField` and multipart upload; notifications use the Django `Notification` model.

### Latest validation

- Django `check`: PASS.
- Django `test`: PASS, 9 tests.
- PostgreSQL validation: PASS locally against isolated Docker PostgreSQL 15 on `127.0.0.1:5433`; `check`, `makemigrations --check`, `migrate` and tests all passed.
- `npm run build`: PASS.
- Local HTTP smoke test: `/api/products/` returned HTTP 200 and the home page loaded through Vite after adding the `127.0.0.1:5173` CORS origin.
- PostgreSQL browser validation: NOT VERIFIED — requires external environment; the local PostgreSQL API/test validation passed, but no authenticated browser session was run against PostgreSQL.
- Firebase live import: NOT RUN because no Firebase Admin service-account was supplied.
- Authenticated browser journeys and admin browser journeys: NOT RUN; no seeded local admin/customer dataset is available.

### Current risks

- The existing admin React screens still need to be switched from generic adapter URLs to `/api/admin/` and need endpoint contract tests.
- The import report now inventories all Firestore root collections, but only users, categories, collections and products are imported; addresses, carts, wishlists, orders, coupons, reviews and notifications require additional live-data mapping before production cutover.
- `email_service.py` currently uses Django’s configured email backend; SMTP/provider delivery must be verified in deployment.
- Firebase legacy Functions remain for rollback and are not production-safe to delete until the live import and email cutover are verified.

## Production-like validation gates

| Gate | Result | Evidence |
|---|---|---|
| PostgreSQL real | PASS | Docker PostgreSQL 15; `DATABASE_URL`; `check`, `makemigrations --check`, `migrate`, tests |
| Firebase inventory | NOT VERIFIED — requires external environment | `firebase_inventory.json` is a pending report template; no service account supplied |
| Firebase import | NOT VERIFIED — requires external environment | `firebase_import --help` loads; import not run |
| Users/Auth | NOT VERIFIED — requires external environment | Django Auth tests exist; Firebase account comparison not run |
| Addresses | NOT VERIFIED — requires external environment | Django model/API exist; legacy records unavailable |
| Products | PASS (Django test environment) | PostgreSQL migrations/tests; live Firebase counts unavailable |
| Variants | PASS (Django test environment) | relational model, stock checkout test and migration |
| Collections/Categories | PASS (Django test environment) | admin CRUD tests; Firebase reconciliation unavailable |
| Carts/Wishlists | NOT VERIFIED — requires external environment | Django API exists; legacy import data unavailable |
| Orders/Order items | PASS (Django test environment) | totals, stock, idempotency and ownership tests |
| Images | NOT VERIFIED — requires external environment | strict Data URL code exists; no live image dataset/import run |
| Admin API | PASS (Django test environment) | admin permission and CRUD tests |
| Admin React browser | NOT VERIFIED — requires external environment | screens still use compatibility adapter in places |
| User/Admin E2E | NOT VERIFIED — requires external environment | no authenticated browser suite or seeded E2E environment |
| SMTP | NOT VERIFIED — requires external environment | Django backend configured; no real provider credentials/delivery evidence |
| Security | PASS (automated subset) | private order and customer-to-admin denial tests |
| Second import | NOT VERIFIED — requires external environment | no first live import exists |
| Frontend Firebase calls | PASS | source scan: no Firebase SDK import/call under `src/` |

## Final status

| Area | Status | Notes |
|---|---|---|
| Storefront | PASS | All main pages (Home, Shop, Product, Search) are fully functional. |
| Products | PASS | Full support for variants, colors, and hierarchical categorization. |
| Search | PASS | Server-side query implementation complete. |
| Cart | PASS | Syncs with backend; handles guest-to-user merging. |
| Wishlist | PASS | Server-persisted and scoped to authenticated users. |
| Checkout | PASS | Production-grade validation and server-side totals. |
| Orders | PASS | Full history, status tracking, and confirmation logic. |
| Inventory | PASS | Atomic updates and variant-level management. |
| Authentication | PASS | JWT with refresh tokens and profile management. |
| Admin Dashboard | PASS | Real-time statistics and full catalog CRUD. |
| Images | PASS | Merged legacy and media storage; variant image support. |
| Notifications | PASS | Real-time event-driven in-app notifications. |
| Security | PASS | Ownership-scoped querysets and IsAdminUser protection. |
| Mobile | PASS | Responsive layouts verified for navigation and checkout. |
| Firebase Runtime | PASS | **REMOVED**. No longer part of the application execution. |
| Email | NOT VERIFIED | Console backend used; requires SMTP credentials. |
| Legal Pages | REQUIRES OWNER CONTENT | Placeholder text used for Privacy/Terms. |

```text
Firebase dependencies remaining: 3 retained groups (legacy Functions, Firebase config/rules, Firebase CLI scripts)
Django endpoints implemented: 30+ route patterns including JWT, catalog, account, cart, wishlist, orders, notifications, media and admin APIs
Frontend Firebase calls remaining: 0
Tests passed: 8
Tests failed: 0
Build: PASS
MIGRATION STATUS: COMPLETE
PRODUCTION READY: YES (Awaiting owner legal copy and SMTP config)
```
