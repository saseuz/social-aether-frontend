import { TrendingUp, Users, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";

interface Trend {
  tag: string;
  category: string;
  posts: string;
}

interface Suggestion {
  name: string;
  handle: string;
  avatarText: string;
}

export default function SidebarRight() {
  const { connections, toggleConnection } = useAuth();
  const { selectedTag, setSelectedTag } = usePosts();

  const trends: Trend[] = [
    { tag: "#quantumComputing", category: "Science & Tech", posts: "12.4k transmissions" },
    { tag: "#vite8Release", category: "Development", posts: "8.2k transmissions" },
    { tag: "#minimalistDesign", category: "Aesthetics", posts: "24.5k transmissions" },
    { tag: "#reactCompiler", category: "Frontend", posts: "15.9k transmissions" },
    { tag: "#ambientWeb", category: "UX Trends", posts: "4.1k transmissions" },
  ];

  const suggestions: Suggestion[] = [
    { name: "Cosmic Dev", handle: "@nebula_coder", avatarText: "CD" },
    { name: "Aesthetic Lab", handle: "@design_taste", avatarText: "AL" },
  ];

  return (
    /*
     * KEY: sticky + self-start is the x.com scroll model.
     *
     * sticky top-0  → sidebar follows window scroll (no isolated container)
     * self-start    → sidebar is only as tall as its content (flex-start align),
     *                 not stretched to match the middle feed height.
     *                 This means sticky works correctly: the sidebar element is
     *                 shorter than its flex-row parent, so it can scroll within it.
     *
     * NO overflow-y-auto → scroll events are NOT captured by this element;
     *                 they propagate to the window, so scrolling anywhere on the
     *                 page (including hovering over this sidebar) scrolls the window.
     */
    <aside className="hidden w-80 flex-col gap-6 pt-0 pb-6 lg:flex xl:w-96 sticky top-0 self-start">
      {/* Search Bar — sticky like feed header */}
      <div className="sticky top-0 z-10 bg-space-black/75 backdrop-blur-md border-b border-cosmic-border py-4 -mx-0">
        <div className="relative group">
          <input
            type="text"
            aria-label="Search Aether"
            placeholder="Search Aether… (e.g. #quantum)"
            className="w-full rounded-xl border border-cosmic-border bg-zinc-900/30 px-4 py-3 pl-11 font-display text-sm text-stellar-white placeholder-stardust-gray transition-[border-color,background-color,box-shadow] duration-300 focus-visible:border-aether-glow/60 focus-visible:bg-zinc-900/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/30"
          />
          <svg
            className="absolute left-4 top-3.5 h-4 w-4 text-stardust-gray transition-colors group-focus-within:text-aether-glow"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Network Trends Panel */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-nebula-teal" />
          <h2 className="font-display text-sm font-bold tracking-wider text-stellar-white uppercase">
            Active Nodes
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {trends.map((trend, idx) => {
            const isActive = selectedTag === trend.tag;
            return (
              <button
                key={idx}
                onClick={() => setSelectedTag(isActive ? null : trend.tag)}
                className={`group flex flex-col justify-between rounded-xl p-2.5 transition-all duration-300 text-left border ${
                  isActive
                    ? "bg-aether-glow/5 border-aether-glow/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                    : "bg-transparent border-transparent hover:bg-zinc-900/30 hover:border-cosmic-border/10"
                } focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 cursor-pointer`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-stardust-gray/60">
                    {trend.category}
                  </span>
                  <ArrowUpRight
                    className={`w-3.5 h-3.5 transition-all duration-300 ${
                      isActive
                        ? "opacity-100 text-aether-glow translate-x-0.5 -translate-y-0.5"
                        : "opacity-0 text-stardust-gray group-hover:opacity-100 group-hover:text-nebula-teal"
                    }`}
                  />
                </div>
                <span
                  className={`font-display text-[14px] font-bold mt-1 transition-colors ${
                    isActive ? "text-aether-glow" : "text-stellar-white group-hover:text-aether-glow"
                  }`}
                >
                  {trend.tag}
                </span>
                <span className="font-mono text-[10px] text-stardust-gray/50 mt-1">{trend.posts}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendation Panel */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-aether-glow" />
          <h2 className="font-display text-sm font-bold tracking-wider text-stellar-white uppercase">
            Connect
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {suggestions.map((user, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <Link
                to={`/profile/${user.handle.replace("@", "")}`}
                className="flex items-center gap-3 group/suggestion focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 focus-visible:rounded-lg"
              >
                <div className="h-9 w-9 overflow-hidden rounded-lg bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center font-bold text-xs text-stellar-white group-hover/suggestion:border-aether-glow/40 transition-colors border border-cosmic-border/30">
                  {user.avatarText}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-display text-xs font-semibold text-stellar-white group-hover/suggestion:text-aether-glow transition-colors truncate leading-tight">
                    {user.name}
                  </span>
                  <span className="font-mono text-[10px] text-stardust-gray group-hover/suggestion:text-aether-glow/80 transition-colors truncate">
                    {user.handle}
                  </span>
                </div>
              </Link>

              {connections.includes(user.handle.replace("@", "")) ? (
                <button
                  onClick={() => toggleConnection(user.handle)}
                  className="rounded-lg border border-nebula-teal/30 bg-nebula-teal/5 px-2.5 py-1.5 font-display text-[10px] font-bold text-nebula-teal transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 cursor-pointer group/btn min-w-[70px] text-center"
                  aria-label={`Disconnect from ${user.name}`}
                >
                  <span className="group-hover/btn:hidden">Aligned</span>
                  <span className="hidden group-hover/btn:inline">Sever</span>
                </button>
              ) : (
                <button
                  onClick={() => toggleConnection(user.handle)}
                  className="rounded-lg bg-stellar-white px-3 py-1.5 font-display text-[11px] font-bold text-space-black transition-[background-color,transform,box-shadow] duration-200 hover:bg-zinc-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar-white/50 cursor-pointer min-w-[70px] text-center"
                  aria-label={`Align with ${user.name}`}
                >
                  Align
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Muted Footer */}
      <div className="px-2 font-mono text-[10px] text-stardust-gray/60 flex flex-wrap gap-x-3 gap-y-1">
        <span>Aether OS v1.0.0</span>
        <span>•</span>
        <span>Privacy</span>
        <span>•</span>
        <span>Nodes</span>
        <span>•</span>
        <span>© 2026 Aether Corp</span>
      </div>
    </aside>
  );
}
