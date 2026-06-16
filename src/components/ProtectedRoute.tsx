import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-space-black text-stellar-white">
        <div className="flex flex-col items-center gap-4">
          {/* Pulsing cosmic rings */}
          <div className="relative flex items-center justify-center h-16 w-16">
            <div className="absolute inset-0 rounded-full border border-aether-glow/30 animate-ping" />
            <div className="absolute h-10 w-10 rounded-full border border-nebula-teal/40 animate-pulse flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-aether-glow animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <span className="font-mono text-xs text-stardust-gray tracking-wider uppercase animate-pulse">
            Establishing Mesh Link…
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
