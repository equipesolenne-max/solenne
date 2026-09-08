import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import { AdminAuthProvider } from "./contexts/AdminAuthProvider";
import { AdminStatsProvider } from "./contexts/AdminStatsProvider";
import { UserAuthProvider } from "./contexts/UserAuthProvider";
import { NotificationProvider } from "./contexts/NotificationProvider";
import { CartProvider } from "./contexts/CartProvider";
import { WishlistProvider } from "./contexts/WishlistProvider";
import AuthProtectedRoute from "./pages/AuthProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import LoadingScreen from "./components/LoadingScreen";
const Account = lazy(() => import("./pages/Account"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const Search = lazy(() => import("./pages/Search"));
const Contact = lazy(() => import("./pages/Contact"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const About = lazy(() => import("./pages/LegalPages").then((module) => ({ default: module.About })));
const ShippingReturns = lazy(() => import("./pages/LegalPages").then((module) => ({ default: module.ShippingReturns })));
const Privacy = lazy(() => import("./pages/LegalPages").then((module) => ({ default: module.Privacy })));
const Terms = lazy(() => import("./pages/LegalPages").then((module) => ({ default: module.Terms })));
const Faq = lazy(() => import("./pages/Faq"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminProtectedRoute = lazy(() => import("./pages/admin/AdminProtectedRoute"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminCollections = lazy(() => import("./pages/admin/AdminCollections"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminCMS = lazy(() => import("./pages/admin/AdminCMS"));
const NotFoundAdmin = lazy(() => import("./pages/admin/NotFoundAdmin"));

export default function App() {
  return (
    <BrowserRouter>
      <UserAuthProvider>
        <NotificationProvider>
          <CartProvider>
            <WishlistProvider>
            <AdminAuthProvider>
        <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />

            <Route
              path="/collections"
              element={<Collections />}
            />
            <Route
              path="/collections/:id"
              element={<CollectionDetail />}
            />
            <Route
              path="/about"
              element={<About />}
            />
            <Route
              path="/contact"
              element={<Contact />}
            />
            <Route
              path="/search"
              element={<Search />}
            />
            <Route
              path="/wishlist"
              element={<Wishlist />}
            />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/faq"
              element={<Faq />}
            />
            <Route
              path="/shipping-returns"
              element={<ShippingReturns />}
            />
            <Route
              path="/privacy-policy"
              element={<Privacy />}
            />
            <Route
              path="/terms"
              element={<Terms />}
            />
          </Route>

          <Route element={<AuthProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/account" element={<Account />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
            </Route>
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute />}>
            <Route
              path="/admin"
              element={
                <AdminStatsProvider>
                  <AdminLayout />
                </AdminStatsProvider>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="collections" element={<AdminCollections />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="cms" element={<AdminCMS />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<NotFoundAdmin />} />
        </Routes>
        </Suspense>
          </AdminAuthProvider>
          </WishlistProvider>
        </CartProvider>
        </NotificationProvider>
      </UserAuthProvider>
    </BrowserRouter>
  );
}
