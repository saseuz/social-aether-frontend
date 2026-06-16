import { useState } from "react";
import { Link } from "react-router-dom";
import DraftingConsole from "./DraftingConsole";
import { MessageSquare, Heart, RefreshCw, Share, Sparkles, Orbit } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";
import type { Comment, Post } from "../context/PostContext";

export type { Comment, Post };

export default function Feed() {
  const { user } = useAuth();
  const { 
    posts, 
    handlePublishPost, 
    handleLike, 
    handleRepost, 
    handleAddComment, 
    handleAddCommentReply 
  } = usePosts();

  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  const handleToggleComments = (postId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
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
        {posts.map((post) => (
          <article 
            key={post.id} 
            className="glass-interactive rounded-2xl p-5 flex flex-col gap-3 group"
          >
            {/* Header info */}
            <div className="flex items-center justify-between gap-3">
              <Link 
                to={`/profile/${post.authorHandle.replace("@", "")}`}
                className="flex items-center gap-3 group/author focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 focus-visible:rounded-lg"
              >
                <div className="h-10 w-10 overflow-hidden rounded-lg bg-zinc-900 border border-cosmic-border flex items-center justify-center font-bold text-sm text-stellar-white group-hover/author:border-aether-glow/40 transition-colors">
                  {post.avatarText}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-sm font-semibold text-stellar-white group-hover/author:text-aether-glow transition-colors leading-tight">
                      {post.authorName}
                    </span>
                    {post.authorHandle === "@aether_net" ? (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-nebula-teal" title="Verified System Node" />
                    ) : null}
                  </div>
                  <span className="font-mono text-[10px] text-stardust-gray group-hover/author:text-aether-glow/85 transition-colors">
                    {post.authorHandle}
                  </span>
                </div>
              </Link>
              
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
                onClick={() => handleToggleComments(post.id)}
                className={`flex items-center gap-2 transition-[color,background-color] duration-200 text-xs font-mono group/btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 focus-visible:rounded-xl ${
                  expandedComments[post.id] ? "text-aether-glow" : "text-stardust-gray hover:text-aether-glow"
                }`}
                title="Comment"
                aria-label={`Toggle comments panel for post by ${post.authorName}`}
                aria-expanded={expandedComments[post.id] ? "true" : "false"}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  expandedComments[post.id] ? "bg-indigo-500/10" : "group-hover/btn:bg-indigo-500/5"
                }`}>
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

            {/* Comments Panel */}
            {expandedComments[post.id] ? (
              <div className="mt-2 pt-3 border-t border-cosmic-border/10 flex flex-col gap-3 transition-all duration-300">
                {/* Comments List */}
                <div className="flex flex-col gap-2.5 max-h-[240px] overflow-y-auto pr-1">
                  {(post.commentsList || []).length > 0 ? (
                    (post.commentsList || []).map((comment) => (
                      <div key={comment.id} className="flex flex-col gap-2">
                        {/* Parent Comment */}
                        <div className="relative flex gap-3 items-start text-xs bg-zinc-950/20 p-3 rounded-xl border border-cosmic-border/10">
                          {/* Thread connecting line when reply form or replies exist */}
                          {(((comment.replies || []).length > 0) || activeReplyCommentId === comment.id) ? (
                            <div className="absolute left-6 top-9 bottom-0 w-0.5 bg-gradient-to-b from-cosmic-border/30 to-transparent pointer-events-none" />
                          ) : null}

                          <Link 
                            to={`/profile/${comment.authorHandle.replace("@", "")}`}
                            className="h-6 w-6 rounded bg-gradient-to-tr from-aether-glow/10 to-nebula-teal/10 border border-cosmic-border/30 flex items-center justify-center font-bold text-[9px] text-aether-glow flex-shrink-0 hover:border-aether-glow/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 focus-visible:rounded"
                          >
                            {comment.avatarText}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <Link 
                                to={`/profile/${comment.authorHandle.replace("@", "")}`}
                                className="flex items-center gap-1.5 text-stellar-white group/commenter focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/30 focus-visible:rounded"
                              >
                                <span className="font-semibold leading-none group-hover/commenter:text-aether-glow transition-colors">{comment.authorName}</span>
                                <span className="text-stardust-gray/60 font-mono text-[9px] leading-none group-hover/commenter:text-aether-glow/85 transition-colors">{comment.authorHandle}</span>
                              </Link>
                              <span className="text-stardust-gray/40 font-mono text-[9px] leading-none">{comment.timestamp}</span>
                            </div>
                            <p className="mt-1.5 text-stellar-white/90 leading-relaxed break-words">
                              {comment.content}
                            </p>
                            
                            {/* Reply Button Trigger */}
                            <button 
                              onClick={() => {
                                if (activeReplyCommentId === comment.id) {
                                  setActiveReplyCommentId(null);
                                  setReplyText("");
                                } else {
                                  setActiveReplyCommentId(comment.id);
                                  setReplyText("");
                                }
                              }}
                              className={`mt-2 font-mono text-[9px] hover:text-aether-glow flex items-center gap-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/30 px-1.5 py-0.5 rounded ${
                                activeReplyCommentId === comment.id ? "text-aether-glow bg-aether-glow/5" : "text-stardust-gray/60"
                              }`}
                              aria-label={`Reply to comment by ${comment.authorName}`}
                            >
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>{activeReplyCommentId === comment.id ? "Cancel Reply" : "Reply"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Inline Reply Input Form */}
                        {activeReplyCommentId === comment.id ? (
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!replyText.trim()) return;
                              handleAddCommentReply(post.id, comment.id, replyText);
                              setReplyText("");
                              setActiveReplyCommentId(null);
                            }}
                            className="ml-8 flex gap-2 items-center bg-zinc-950/10 p-2 rounded-xl border border-cosmic-border/5"
                          >
                            <div className="h-5 w-5 rounded bg-gradient-to-tr from-aether-glow/15 to-nebula-teal/15 border border-cosmic-border/20 flex items-center justify-center font-bold text-[8px] text-aether-glow flex-shrink-0">
                              {user?.avatarText || "Æ"}
                            </div>
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Replying to ${comment.authorHandle}…`}
                              aria-label={`Reply text for ${comment.authorName}`}
                              className="flex-1 bg-zinc-950/40 text-[11px] text-stellar-white placeholder-stardust-gray/40 border border-cosmic-border/30 rounded-lg px-2.5 py-1.5 outline-none focus:border-aether-glow/50 focus:ring-1 focus:ring-aether-glow/30 focus-visible:outline-none transition-[border-color,box-shadow] duration-200 font-sans"
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={!replyText.trim()}
                              className={`px-2.5 py-1.5 rounded-lg font-display text-[9px] font-bold tracking-wide transition-[background-color,box-shadow,transform,filter] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 ${
                                replyText.trim()
                                  ? "bg-gradient-to-r from-aether-glow to-nebula-teal text-stellar-white hover:brightness-110 active:scale-95 cursor-pointer"
                                  : "bg-zinc-900/40 text-stardust-gray/30 border border-cosmic-border/20 cursor-not-allowed"
                              }`}
                            >
                              Send
                            </button>
                          </form>
                        ) : null}

                        {/* Render Nested Replies */}
                        {(comment.replies || []).length > 0 ? (
                          <div className="ml-8 flex flex-col gap-2 border-l border-cosmic-border/10 pl-3">
                            {(comment.replies || []).map((reply) => (
                              <div key={reply.id} className="flex gap-2.5 items-start text-xs bg-zinc-950/10 p-2.5 rounded-xl border border-cosmic-border/5">
                                <Link 
                                  to={`/profile/${reply.authorHandle.replace("@", "")}`}
                                  className="h-5 w-5 rounded bg-gradient-to-tr from-aether-glow/5 to-nebula-teal/5 border border-cosmic-border/20 flex items-center justify-center font-bold text-[8px] text-aether-glow flex-shrink-0 hover:border-aether-glow/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 focus-visible:rounded"
                                >
                                  {reply.avatarText}
                                </Link>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <Link 
                                      to={`/profile/${reply.authorHandle.replace("@", "")}`}
                                      className="flex items-center gap-1.5 text-stellar-white group/replier focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/30 focus-visible:rounded"
                                    >
                                      <span className="font-semibold leading-none group-hover/replier:text-aether-glow transition-colors">{reply.authorName}</span>
                                      <span className="text-stardust-gray/60 font-mono text-[9px] leading-none group-hover/replier:text-aether-glow/85 transition-colors">{reply.authorHandle}</span>
                                    </Link>
                                    <span className="text-stardust-gray/40 font-mono text-[9px] leading-none">{reply.timestamp}</span>
                                  </div>
                                  <p className="mt-1 text-stellar-white/85 leading-relaxed break-words">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-stardust-gray/40 font-mono">
                      No transmissions logged in this thread…
                    </div>
                  )}
                </div>

                {/* Comment Input Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = commentTexts[post.id] || "";
                    if (!text.trim()) return;
                    handleAddComment(post.id, text);
                    setCommentTexts(prev => ({ ...prev, [post.id]: "" }));
                  }}
                  className="flex gap-2 items-center mt-1"
                >
                  <div className="h-7 w-7 rounded bg-gradient-to-tr from-aether-glow/20 to-nebula-teal/20 border border-cosmic-border flex items-center justify-center font-bold text-[9px] text-aether-glow flex-shrink-0">
                    {user?.avatarText || "Æ"}
                  </div>
                  <input
                    type="text"
                    value={commentTexts[post.id] || ""}
                    onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Add to the transmission… (e.g. interesting insight)"
                    aria-label="Write a comment reply"
                    className="flex-1 bg-zinc-950/40 text-xs text-stellar-white placeholder-stardust-gray/40 border border-cosmic-border/30 rounded-xl px-3 py-2 outline-none focus:border-aether-glow/50 focus:ring-1 focus:ring-aether-glow/30 focus-visible:outline-none transition-[border-color,box-shadow] duration-200 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!(commentTexts[post.id] || "").trim()}
                    className={`px-3 py-2 rounded-xl font-display text-[10px] font-bold tracking-wide transition-[background-color,box-shadow,transform,filter] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 ${
                      (commentTexts[post.id] || "").trim()
                        ? "bg-gradient-to-r from-aether-glow to-nebula-teal text-stellar-white hover:brightness-110 active:scale-95 cursor-pointer"
                        : "bg-zinc-900/40 text-stardust-gray/30 border border-cosmic-border/20 cursor-not-allowed"
                    }`}
                  >
                    Reply
                  </button>
                </form>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
