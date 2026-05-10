import { Navigate } from "react-router-dom";
import { useAuthState } from "./AuthProvider";
import { FullPageLoader } from "./layout";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthState();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
