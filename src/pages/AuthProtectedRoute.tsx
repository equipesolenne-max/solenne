import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserAuth } from "../contexts/UserAuthProvider";

export default function AuthProtectedRoute() {
  const { user, loading } = useUserAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center font-sans text-xs uppercase tracking-[0.2em] text-midnight/60">Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
