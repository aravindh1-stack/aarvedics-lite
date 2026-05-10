import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "./components/AuthProvider";
import AuthProvider from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import RoomPage from "./pages/RoomPage";
import { FullPageLoader } from "./components/layout";

function AppRoutes() {
  const { user, loading } = useAuthState();

  if (loading) {
    return <FullPageLoader message="Loading..." />;
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
