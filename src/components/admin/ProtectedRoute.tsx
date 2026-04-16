import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user && isAdmin ? <>{children}</> : <Navigate to="/admin" replace />;
}
