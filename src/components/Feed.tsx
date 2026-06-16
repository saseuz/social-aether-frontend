import { useState } from "react";
import DraftingConsole from "./DraftingConsole";
import { MessageSquare, Heart, RefreshCw, Share, Sparkles, Orbit } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export interface Post {
  id: string;
  authorName: string;
  authorHandle: string;
  avatarText: string;
  content: string;
  timestamp: string;
  likes: number;
  reposts: number;
  comments: number;
  isLiked?: boolean;
  isReposted?: boolean;
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      authorName: "Astro Coder",
      authorHandle: "@astro_coder",
      avatarText: "AC",
      content: "Just configured the solar sails on the React 19 compiler. The latency overhead across interstellar relays has dropped by exactly 42ms. Absolute magic. 🚀☄️",
      timestamp: "18m ago",
      likes: 124,
      reposts: 18,
      comments: 7,
      isLiked: true
    },
    {
      id: "2",
      authorName: "Minimalist Lab",
      authorHandle: "@minimalist_lab",
      avatarText: "ML",
      content: "Visual clarity is not about what you add; it is about what you leave behind. Every rule, every pixel, every font weight must justify its presence. Build light. Breathe deep.",
      timestamp: "2h ago",
      likes: 512,
      reposts: 92,
      comments: 34
    },
    {
      id: "3",
      authorName: "Aether Protocol",
      authorHandle: "@aether_net",
      avatarText: "AP",
      content: "Welcome to Aether. A premium, glassmorphic space designed for deep content and micro-transmissions. Our nodes are synchronized, and the solar winds are favorable. Synthesize your first message above.",
      timestamp: "1d ago",
      likes: 1024,
      reposts: 420,
      comments: 89
    }
  ]);

  const handlePublishPost = (text: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      authorName: user?.displayName || "Aether Pilot",
      authorHandle: user?.username || "@zypp_pilot",
      avatarText: user?.avatarText || "Æ",
      content: text,
      timestamp: "Just now",
      likes: 0,
      reposts: 0,
      comments: 0
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (id: string) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleRepost = (id: string) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1,
          isReposted: !post.isReposted
        };
      }
      return post;
    }));
  };

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

      {/* Posts Stream */}
      <div className="flex flex-col gap-4 pb-24">
        {posts.map((post) => (\n          <article \n            key={post.id} \n            className="glass-interactive rounded-2xl p-5 flex flex-col gap-3 group"\n          >\n            {/* Header info */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-lg bg-zinc-900 border border-cosmic-border flex items-center justify-center font-bold text-sm text-stellar-white">
                  {post.avatarText}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-sm font-semibold text-stellar-white hover:text-aether-glow cursor-pointer transition-colors leading-tight">
                      {post.authorName}
                    </span>
                    {post.authorHandle === "@aether_net" ? (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-nebula-teal" title="Verified System Node" />
                    ) : null}
                  </div>
                  <span className="font-mono text-[10px] text-stardust-gray">
                    {post.authorHandle}
                  </span>
                </div>
              </div>
              
              <span className="font-mono text-[10px] text-stardust-gray/60">
                {post.timestamp}
              </span>
            </div>

            {/* Post Content */}
            <p className="text-[15px] leading-relaxed text-stellar-white/95 whitespace-pre-wrap select-text px-1">
              {post.content}
            </p>

            {/* Post Actions footer */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-cosmic-border/10">
              {/* Comment Button */}
              <button 
                className="flex items-center gap-2 text-stardust-gray hover:text-aether-glow transition-[color,background-color] duration-200 text-xs font-mono group/btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 focus-visible:rounded-xl"
                title="Comment"
                aria-label={`Comment on post by ${post.authorName}`}
              >
                <div className="p-2 rounded-lg group-hover/btn:bg-indigo-500/5 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span>{post.comments}</span>
              </button>

              {/* Repost Button */}
              <button 
                onClick={() => handleRepost(post.id)}
                className={`flex items-center gap-2 transition-[color,background-color] duration-200 text-xs font-mono group/btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nebula-teal/50 focus-visible:rounded-xl ${
                  post.isReposted ? "text-nebula-teal" : "text-stardust-gray hover:text-nebula-teal"
                }`}
                title="Retransmit"
                aria-label={`Retransmit post by ${post.authorName}`}
              >
                <div className="p-2 rounded-lg group-hover/btn:bg-teal-500/5 transition-colors">
                  <RefreshCw className={`w-4 h-4 ${post.isReposted ? "rotate-180" : ""} transition-transform duration-300`} />
                </div>
                <span>{post.reposts}</span>
              </button>

              {/* Like Button */}
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 transition-[color,background-color] duration-200 text-xs font-mono group/btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/50 focus-visible:rounded-xl ${
                  post.isLiked ? "text-rose-500" : "text-stardust-gray hover:text-rose-500"
                }`}
                title="Like"
                aria-label={`Like post by ${post.authorName}`}
              >
                <div className="p-2 rounded-lg group-hover/btn:bg-rose-500/5 transition-colors">
                  <Heart className={`w-4 h-4 ${post.isLiked ? "fill-rose-500 scale-110" : "transition-transform group-active/btn:scale-90"}`} />
                </div>
                <span>{post.likes}</span>
              </button>

              {/* Share Button */}
              <button 
                className="flex items-center gap-2 text-stardust-gray hover:text-indigo-400 transition-[color,background-color] duration-200 text-xs font-mono group/btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400/50 focus-visible:rounded-xl"
                title="Share"
                aria-label={`Share post by ${post.authorName}`}
              >
                <div className="p-2 rounded-lg group-hover/btn:bg-indigo-400/5 transition-colors">
                  <Share className="w-4 h-4" />
                </div>
              </button>
            </div>
          </article>\n        ))}\n      </div>
    </div>
  );
}
