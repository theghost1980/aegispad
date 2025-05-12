import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
