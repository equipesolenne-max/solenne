import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthProvider";

export default function AdminProtectedRoute() {
  const { user, loading, isAdmin } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F4EC] text-[#1B2A46]">
        <div className="font-sans text-[12px] tracking-[0.2em] uppercase text-[#1B2A46]/70">Loading admin access…</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
