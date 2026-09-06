import { Navigate } from "react-router-dom";

export default function Orders() {
  return <Navigate to="/account?tab=orders" replace />;
}
