import { Navigate } from "react-router-dom";
import { useAuthState } from "./AuthProvider";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthState();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="w-10 h-10 rounded-full border-3 border-primary-200 border-t-primary-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
