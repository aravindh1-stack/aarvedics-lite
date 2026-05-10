import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "./components/AuthProvider";
import AuthProvider from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import RoomPage from "./pages/RoomPage";
import { Loader as Loader2 } from "lucide-react";

function AppRoutes() {
  const { user, loading } = useAuthState();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          <p className="text-xs text-surface-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? <Navigate to="/dashboard" replace /> : <LandingPage />
        }
      />
      <Route
        path="/login"
        element={
          user ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/room/:roomId"
        element={
          <ProtectedRoute>
            <RoomPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
