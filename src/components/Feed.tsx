import DraftingConsole from "./DraftingConsole";
import { Sparkles, Orbit } from "lucide-react";
import { usePosts } from "../context/PostContext";
import PostCard from "./PostCard";

export default function Feed() {
  const { 
    posts, 
    selectedTag,
    setSelectedTag,
    handlePublishPost 
  } = usePosts();

  const filteredPosts = posts.filter(post => {
    if (!selectedTag) return true;
    return post.content.toLowerCase().includes(selectedTag.toLowerCase());
  });

  return (
    <div id="feed" className="flex-1 border-cosmic-border/50 min-w-0 md:border-r md:px-4 lg:px-6">
      {/* Top Banner / Feed Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-cosmic-border bg-space-black/75 backdrop-blur-md py-4 mb-6">
        <div className="flex items-center gap-2">
          <Orbit className="w-5 h-5 text-aether-glow" />
          <h1 className="font-display text-lg font-bold tracking-wide text-stellar-white m-0">
            Aether Feed
          </h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-nebula-teal/30 bg-nebula-teal/5 text-nebula-teal font-mono text-[10px] uppercase tracking-wider">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>Nodes Synced</span>
        </div>
      </header>

      {/* Drafting Console */}
      <div className="mb-6">
        <DraftingConsole onPublish={handlePublishPost} />
      </div>

      {/* Active Node Filter Banner */}
      {selectedTag && (
        <div className="mb-4 animate-toast flex items-center justify-between gap-3 rounded-2xl border border-aether-glow/30 bg-indigo-950/20 backdrop-blur-md p-4 shadow-[0_0_20px_rgba(99,102,241,0.08)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-aether-glow/10 text-aether-glow">
              <Orbit className="h-4 w-4 animate-spin-slow" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-stardust-gray/60">Filtering Feed Node</div>
              <div className="font-display text-sm font-bold text-stellar-white">{selectedTag}</div>
            </div>
          </div>
          <button 
            onClick={() => setSelectedTag(null)}
            className="h-8 px-3 rounded-xl border border-cosmic-border bg-zinc-900/30 hover:bg-zinc-900/60 font-mono text-xs text-stardust-gray hover:text-stellar-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50"
            aria-label="Clear node filter"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Posts Stream */}
      <div className="flex flex-col gap-4 pb-24">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
