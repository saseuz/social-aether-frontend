import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Orbit, Sparkles, UserPlus, AlertCircle } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim() || !email.trim() || !password.trim()) return;

    setError(null);
    setIsSubmitting(true);

    // Filter/clean handle formatting (remove prefix @ if typed)
    const cleanHandle = username.startsWith("@") ? username.substring(1) : username;

    try {
      await register(displayName.trim(), cleanHandle.trim(), email.trim(), password.trim());
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Synchronizing new user node failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-space-black px-4 relative overflow-hidden">
      {/* Decorative ambient blurred backgrounds */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-aether-glow/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] rounded-full bg-nebula-teal/8 blur-[90px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-[420px] z-10 py-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-aether-glow to-nebula-teal flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Orbit className="w-5 h-5 text-stellar-white animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <span className="font-display text-2xl font-black tracking-widest text-stellar-white uppercase bg-clip-text">
              Aether
            </span>
          </div>
          <p className="font-mono text-[10px] text-stardust-gray uppercase tracking-widest">
            Cosmic Node Sync Portal
          </p>
        </div>

        {/* Register Form Panel */}
        <div className="glass-panel rounded-2xl p-8 border border-cosmic-border/50 relative shadow-2xl">
          {/* Subtle horizontal glowing progress line when submitting */}
          {isSubmitting ? (
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-aether-glow via-nebula-teal to-aether-glow animate-pulse" />
          ) : null}

          <h2 className="font-display text-lg font-bold text-stellar-white mb-6">
            Register Node Key
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error ? (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-400">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-xs font-mono leading-tight">{error}</span>
              </div>
            ) : null}

            {/* Display Name field */}
            <div className="flex flex-col gap-1">
              <label 
                htmlFor="reg-name" 
                className="font-mono text-[10px] text-stardust-gray uppercase tracking-wider"
              >
                Display Name
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                required
                disabled={isSubmitting}
                autoComplete="name"
                placeholder="e.g. Aether Pilot…"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-cosmic-border bg-zinc-950/40 px-4 py-2.5 font-display text-sm text-stellar-white placeholder-stardust-gray/40 transition-[border-color,background-color,box-shadow] duration-300 focus-visible:border-aether-glow/60 focus-visible:bg-zinc-950/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/30 disabled:opacity-50"
              />
            </div>

            {/* Username field */}
            <div className="flex flex-col gap-1">
              <label 
                htmlFor="reg-handle" 
                className="font-mono text-[10px] text-stardust-gray uppercase tracking-wider"
              >
                Transmit Handle (Username)
              </label>
              <input
                id="reg-handle"
                name="username"
                type="text"
                required
                disabled={isSubmitting}
                autoComplete="username"
                spellCheck={false}
                placeholder="e.g. @zypp_pilot…"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-cosmic-border bg-zinc-950/40 px-4 py-2.5 font-display text-sm text-stellar-white placeholder-stardust-gray/40 transition-[border-color,background-color,box-shadow] duration-300 focus-visible:border-aether-glow/60 focus-visible:bg-zinc-950/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/30 disabled:opacity-50"
              />
            </div>

            {/* Email field */}
            <div className="flex flex-col gap-1">
              <label 
                htmlFor="reg-email" 
                className="font-mono text-[10px] text-stardust-gray uppercase tracking-wider"
              >
                Access Email
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                disabled={isSubmitting}
                autoComplete="email"
                spellCheck={false}
                placeholder="e.g. pilot@aether.net…"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-cosmic-border bg-zinc-950/40 px-4 py-2.5 font-display text-sm text-stellar-white placeholder-stardust-gray/40 transition-[border-color,background-color,box-shadow] duration-300 focus-visible:border-aether-glow/60 focus-visible:bg-zinc-950/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/30 disabled:opacity-50"
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1">
              <label 
                htmlFor="reg-password" 
                className="font-mono text-[10px] text-stardust-gray uppercase tracking-wider"
              >
                Security Key (Password)
              </label>
              <input
                id="reg-password"
                name="password"
                type="password"
                required
                disabled={isSubmitting}
                autoComplete="new-password"
                placeholder="e.g. ••••••••…"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-cosmic-border bg-zinc-950/40 px-4 py-2.5 font-display text-sm text-stellar-white placeholder-stardust-gray/40 transition-[border-color,background-color,box-shadow] duration-300 focus-visible:border-aether-glow/60 focus-visible:bg-zinc-950/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/30 disabled:opacity-50"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !displayName.trim() || !username.trim() || !email.trim() || !password.trim()}
              className={`flex items-center justify-center gap-2 w-full mt-3 py-3.5 rounded-xl font-display text-xs font-bold tracking-widest uppercase transition-[background-color,box-shadow,transform,filter] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-glow/50 ${
                displayName.trim() && username.trim() && email.trim() && password.trim() && !isSubmitting
                  ? "bg-gradient-to-r from-aether-glow to-nebula-teal text-stellar-white hover:shadow-lg hover:shadow-indigo-500/10 hover:brightness-110 active:scale-98"
                  : "bg-zinc-900/50 text-stardust-gray/40 border border-cosmic-border/30 cursor-not-allowed"
              }`}
            >
              <span>{isSubmitting ? "Initializing Node…" : "Initialize Key"}</span>
              {isSubmitting ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </div>

        {/* Footer switch page */}
        <div className="text-center mt-6">
          <p className="font-mono text-xs text-stardust-gray/60">
            Already registered?{" "}
            <Link 
              to="/login" 
              className="text-aether-glow hover:text-stellar-white font-bold transition-colors underline decoration-aether-glow/30 hover:decoration-stellar-white underline-offset-4"
            >
              Establish Link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
