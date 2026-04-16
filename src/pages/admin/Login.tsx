import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already authenticated admin → skip login page
  if (!authLoading && user && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin/dashboard", { replace: true });
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-500 mb-3">
            Darchia &amp; Partners
          </p>
          <h1 className="font-serif text-3xl text-navy-900 tracking-tight">
            Admin Portal
          </h1>
          <div className="mt-4 mx-auto w-12 h-px bg-gold-500/50" />
        </div>

        {/* Card */}
        <div className="bg-white border border-cream-200 shadow-sm rounded-sm p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-xs tracking-widest uppercase text-charcoal/50 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-navy-700 transition-colors"
                placeholder="admin@darchia.law"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-charcoal/50 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-navy-700 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 tracking-wide">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-900 text-cream-50 text-xs tracking-[0.2em] uppercase py-3.5 hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
