import { Bookmark, Orbit } from "lucide-react";
import { usePosts } from "../context/PostContext";
import PostCard from "../components/PostCard";

export default function Bookmarks() {
  const { posts } = usePosts();

  const bookmarkedPosts = posts.filter((post) => !!post.isBookmarked);

  return (
    <div id="bookmarks-container" className="flex-1 border-cosmic-border/50 min-w-0 md:border-r md:px-4 lg:px-6">
      {/* Page Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-cosmic-border bg-space-black/75 backdrop-blur-md py-4 mb-6">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-400" />
          <h1 className="font-display text-lg font-bold tracking-wide text-stellar-white m-0">
            Bookmarked Signals
          </h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/5 text-amber-400 font-mono text-[10px] uppercase tracking-wider">
          <span>{bookmarkedPosts.length} saved</span>
        </div>
      </header>

      {/* Bookmarked Stream */}
      <div className="flex flex-col gap-4 pb-24">
        {bookmarkedPosts.length > 0 ? (
          bookmarkedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-16 px-4 glass-panel rounded-2xl border border-cosmic-border/20 flex flex-col items-center justify-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.1)]">
              <Bookmark className="w-6 h-6 animate-pulse" />
              <Orbit className="absolute -inset-2 w-18 h-18 text-amber-400/20 animate-spin-slow pointer-events-none" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-stellar-white">No Telemetry Bookmarks</h3>
              <p className="mt-1.5 text-xs text-stardust-gray/50 max-w-xs mx-auto leading-relaxed">
                No bookmarked signals detected in this quadrant. Bookmark transmissions in your Console feed to preserve them here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
