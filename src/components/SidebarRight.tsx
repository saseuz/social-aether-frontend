import { TrendingUp, Users, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

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
    <aside className="hidden w-80 flex-col gap-6 py-6 lg:flex xl:w-96">
      {/* Search Bar */}
      <div className="relative group">
        <input 
          type="text" 
          aria-label="Search Aether"
          placeholder="Search Aether… (e.g. #quantum)" 
          className="w-full rounded-xl border border-cosmic-border bg-zinc-900/30 px-4 py-3 pl-11 font-display text-sm text-stellar-white placeholder-stardust-gray transition-[border-color,background-color,box-shadow] duration-300 focus-visible:border-aether-glow/60 focus-visible:bg-zinc-900/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/30"
        />
        <svg className="absolute left-4 top-3.5 h-4 w-4 text-stardust-gray transition-colors group-focus-within:text-aether-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
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
          {trends.map((trend, idx) => (
            <a 
              key={idx} 
              href={`#trend-${idx}`} 
              className="group flex flex-col justify-between rounded-lg p-2 transition-colors duration-200 hover:bg-zinc-900/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-stardust-gray">{trend.category}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-stardust-gray opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:text-nebula-teal" />
              </div>
              <span className="font-display text-[15px] font-bold text-stellar-white group-hover:text-aether-glow transition-colors">
                {trend.tag}
              </span>
              <span className="font-mono text-[10px] text-stardust-gray/80 mt-1">{trend.posts}</span>
            </a>
          ))}
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
              
              <Link
                to={`/profile/${user.handle.replace("@", "")}`}
                className="rounded-lg bg-stellar-white px-3 py-1.5 font-display text-[11px] font-bold text-space-black transition-[background-color,transform,box-shadow] duration-200 hover:bg-zinc-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar-white/50"
                aria-label={`Align with ${user.name}`}
              >
                Align
              </Link>
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
