import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Compass, Orbit, Plus, Check } from "lucide-react";
import { usePosts } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

interface SuggestedNode {
  name: string;
  handle: string;
  avatarText: string;
  bio: string;
}

const SUGGESTED_NODES: SuggestedNode[] = [
  {
    name: "Tech Maven",
    handle: "@tech_maven",
    avatarText: "TM",
    bio: "Edge function architect, solar telemetry analyst."
  },
  {
    name: "Lovelace Node",
    handle: "@lovelace",
    avatarText: "LN",
    bio: "Compiler developer and quantum cryptography enthusiast."
  },
  {
    name: "Cosmic Dev",
    handle: "@cosmic_dev",
    avatarText: "CD",
    bio: "CSS wizard rendering the universe in real-time."
  }
];

const TRENDING_TAGS = [
  { name: "#reactCompiler", volume: "15.9k transmissions" },
  { name: "#quantumComputing", volume: "12.4k transmissions" },
  { name: "#vite8Release", volume: "8.2k transmissions" },
  { name: "#minimalistDesign", volume: "24.5k transmissions" },
  { name: "#ambientWeb", volume: "4.1k transmissions" }
];

export default function Explore() {
  const { posts } = usePosts();
  const { connections, toggleConnection } = useAuth();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedTrendingTag, setSelectedTrendingTag] = useState<string | null>(null);

  // Sync query state with url query parameters
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
    if (q.startsWith("#")) {
      setSelectedTrendingTag(q);
    } else {
      setSelectedTrendingTag(null);
    }
  }, [searchParams]);

  const updateSearchQuery = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleTagClick = (tag: string) => {
    if (selectedTrendingTag === tag) {
      setSelectedTrendingTag(null);
      updateSearchQuery("");
    } else {
      setSelectedTrendingTag(tag);
      updateSearchQuery(tag);
    }
  };

  const clearSearch = () => {
    updateSearchQuery("");
    setSelectedTrendingTag(null);
  };

  // Filter posts based on query
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      post.content.toLowerCase().includes(query) ||
      post.authorName.toLowerCase().includes(query) ||
      post.authorHandle.toLowerCase().includes(query)
    );
  });

  return (
    <div id="explore-container" className="flex-1 border-cosmic-border/50 min-w-0 md:border-r md:px-4 lg:px-6">
      {/* Search Header */}
      <header className="sticky top-0 z-10 border-b border-cosmic-border bg-space-black/75 backdrop-blur-md py-4 mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-stardust-gray/60" />
          <input
            type="text"
            placeholder="Search Aether... (e.g. #quantumComputing, @astro)"
            value={searchQuery}
            onChange={(e) => {
              updateSearchQuery(e.target.value);
            }}
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-cosmic-border bg-zinc-955/40 text-sm text-stellar-white placeholder-stardust-gray/40 outline-none focus:border-aether-glow/50 focus:ring-1 focus:ring-aether-glow/30 transition-all duration-300 font-sans"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 text-xs font-mono text-stardust-gray/60 hover:text-stellar-white transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Explore Grid Columns */}
      <div className="flex flex-col gap-6 pb-24">
        {/* Only show suggestions/trending when search query is empty */}
        {!searchQuery.trim() && (
          <>
            {/* Trending Tags Section */}
            <section className="glass-panel p-5 rounded-2xl border border-cosmic-border/30">
              <h2 className="font-display text-sm font-bold text-stellar-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Compass className="w-4 h-4 text-aether-glow" />
                Active Node Coordinates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagClick(tag.name)}
                    className="flex flex-col items-start p-3.5 rounded-xl border border-cosmic-border/30 bg-zinc-950/20 hover:bg-zinc-950/40 hover:border-aether-glow/40 transition-all text-left cursor-pointer group"
                  >
                    <span className="font-mono text-xs font-bold text-nebula-teal group-hover:text-aether-glow transition-colors">
                      {tag.name}
                    </span>
                    <span className="font-mono text-[9px] text-stardust-gray/50 mt-1">
                      {tag.volume}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Suggested Node Connections Section */}
            <section className="glass-panel p-5 rounded-2xl border border-cosmic-border/30">
              <h2 className="font-display text-sm font-bold text-stellar-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Orbit className="w-4 h-4 text-nebula-teal" />
                Suggested Node Alignments
              </h2>
              <div className="flex flex-col gap-3">
                {SUGGESTED_NODES.map((node) => {
                  const cleanHandle = node.handle.replace("@", "");
                  const isFollowed = connections.includes(cleanHandle);
                  return (
                    <div
                      key={node.handle}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-cosmic-border/20 bg-zinc-950/10 gap-3"
                    >
                      <Link
                        to={`/profile/${cleanHandle}`}
                        className="flex items-center gap-3 group focus-visible:outline-none"
                      >
                        <div className="h-9 w-9 overflow-hidden rounded-lg bg-zinc-900 border border-cosmic-border flex items-center justify-center font-bold text-xs text-stellar-white group-hover:border-aether-glow/40 transition-colors">
                          {node.avatarText}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-display text-xs font-bold text-stellar-white group-hover:text-aether-glow transition-colors truncate">
                            {node.name}
                          </span>
                          <span className="font-mono text-[9px] text-stardust-gray/70 truncate">
                            {node.handle}
                          </span>
                        </div>
                      </Link>

                      <button
                        onClick={() => toggleConnection(node.handle)}
                        className={`px-3 py-1.5 rounded-xl font-display text-[10px] font-bold tracking-wide uppercase transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1 border ${
                          isFollowed
                            ? "bg-transparent border-cosmic-border text-stardust-gray hover:text-rose-400 hover:border-rose-400/30"
                            : "bg-gradient-to-r from-aether-glow to-nebula-teal border-transparent text-stellar-white hover:brightness-110"
                        }`}
                      >
                        {isFollowed ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Aligned</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Align</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Results / Feed Section */}
        <section className="flex flex-col gap-4">
          {searchQuery.trim() && (
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-[10px] text-stardust-gray/60 uppercase tracking-wider">
                Telemetry search result: {filteredPosts.length} nodes resolved
              </span>
            </div>
          )}

          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-16 px-4 glass-panel rounded-2xl border border-cosmic-border/20 flex flex-col items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
                <Search className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-stellar-white">No Alignments Found</h3>
                <p className="mt-1.5 text-xs text-stardust-gray/50 max-w-xs mx-auto leading-relaxed">
                  No transmissions resolved for &ldquo;{searchQuery}&rdquo;. Adjust your frequency coordinates and try again.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
