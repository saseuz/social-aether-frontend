import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  Heart, 
  RefreshCw, 
  Share, 
  Bookmark, 
  Check 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";
import type { Post } from "../context/PostContext";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { 
    selectedTag, 
    setSelectedTag, 
    handleLike, 
    handleRepost, 
    handleAddComment, 
    handleAddCommentReply,
    handleToggleBookmark
  } = usePosts();

  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [copied, setCopied] = useState(false);

  const renderPostContent = (content: string) => {
    const parts = content.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith("#") && part.length > 1) {
        const cleanTag = part.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        const isActive = selectedTag?.toLowerCase() === cleanTag.toLowerCase();
        return (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTag(isActive ? null : cleanTag);
            }}
            className={`transition-colors font-mono font-bold hover:underline cursor-pointer ${
              isActive ? "text-aether-glow" : "text-nebula-teal hover:text-nebula-teal/80"
            }`}
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/profile/${post.authorHandle.replace("@", "")}?post=${post.id}`;
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    handleAddComment(post.id, commentText);
    setCommentText("");
  };

  const submitReply = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    handleAddCommentReply(post.id, commentId, replyText);
    setReplyText("");
    setActiveReplyCommentId(null);
  };

  return (
    <article className="glass-panel rounded-2xl p-5 flex flex-col gap-3 group transition-all duration-300 hover:border-cosmic-border/80">
      {post.isRetransmission ? (
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-nebula-teal/80 border-b border-cosmic-border/10 pb-2 mb-1">
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-nebula-teal" style={{ animationDuration: '8s' }} />
          <span>Retransmitted by {post.repostedBy}</span>
        </div>
      ) : null}

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
        
        <div className="flex items-center gap-2">
          {post.alignment && (
            <span className="font-mono text-[8px] font-bold text-nebula-teal border border-nebula-teal/20 bg-nebula-teal/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {post.alignment}
            </span>
          )}
          <span className="font-mono text-[10px] text-stardust-gray/60">
            {post.timestamp}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-[15px] leading-relaxed text-stellar-white/95 whitespace-pre-wrap select-text px-1 font-sans">
        {renderPostContent(post.content)}
      </p>

      {/* Post Media Attachment */}
      {post.mediaUrl && (
        <div className="mt-1.5 overflow-hidden rounded-xl border border-cosmic-border/30 bg-zinc-950/20 max-h-[360px] shadow-[0_0_20px_rgba(0,0,0,0.2)]">
          <img 
            src={post.mediaUrl} 
            alt="Node transmission attachment" 
            className="w-full h-full object-cover max-h-[360px] hover:scale-[1.015] transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}

      {/* Post Actions Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-cosmic-border/10">
        {/* Comment Button */}
        <button 
          onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
          className={`flex items-center gap-2 transition-[color,background-color] duration-200 text-xs font-mono group/btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 focus-visible:rounded-xl cursor-pointer ${
            isCommentsExpanded ? "text-aether-glow" : "text-stardust-gray hover:text-aether-glow"
          }`}
          title="Comment"
          aria-label={`Toggle comments panel for post by ${post.authorName}`}
        >
          <div className={`p-2 rounded-lg transition-colors ${
            isCommentsExpanded ? "bg-indigo-500/10" : "group-hover/btn:bg-indigo-500/5"
          }`}>
            <MessageSquare className="w-4 h-4" />
          </div>
          <span>{post.comments}</span>
        </button>

        {/* Repost Button */}
        <button 
          onClick={() => handleRepost(post.id)}
          className={`flex items-center gap-2 transition-[color,background-color] duration-200 text-xs font-mono group/btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nebula-teal/50 focus-visible:rounded-xl cursor-pointer ${
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
          className={`flex items-center gap-2 transition-[color,background-color] duration-200 text-xs font-mono group/btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/50 focus-visible:rounded-xl cursor-pointer ${
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

        {/* Bookmark Button */}
        <button 
          onClick={() => handleToggleBookmark(post.id)}
          className={`flex items-center gap-2 transition-[color,background-color] duration-200 text-xs font-mono group/btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/50 focus-visible:rounded-xl cursor-pointer ${
            post.isBookmarked ? "text-amber-400" : "text-stardust-gray hover:text-amber-400"
          }`}
          title="Bookmark"
          aria-label={`Bookmark post by ${post.authorName}`}
        >
          <div className="p-2 rounded-lg group-hover/btn:bg-amber-400/5 transition-colors">
            <Bookmark className={`w-4 h-4 ${post.isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
          </div>
        </button>

        {/* Share Button with micro-feedback */}
        <button 
          onClick={handleShare}
          className={`flex items-center gap-2 transition-[color,background-color] duration-200 text-xs font-mono group/btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400/50 focus-visible:rounded-xl cursor-pointer ${
            copied ? "text-nebula-teal" : "text-stardust-gray hover:text-indigo-400"
          }`}
          title="Share"
          aria-label={`Share post by ${post.authorName}`}
        >
          <div className="p-2 rounded-lg group-hover/btn:bg-indigo-400/5 transition-colors">
            {copied ? <Check className="w-4 h-4" /> : <Share className="w-4 h-4" />}
          </div>
        </button>
      </div>

      {/* Comments Panel */}
      {isCommentsExpanded ? (
        <div className="mt-2 pt-3 border-t border-cosmic-border/10 flex flex-col gap-3 transition-all duration-300">
          {/* Comments List */}
          <div className="flex flex-col gap-2.5 max-h-[240px] overflow-y-auto pr-1">
            {(post.commentsList || []).length > 0 ? (
              (post.commentsList || []).map((comment) => (
                <div key={comment.id} className="flex flex-col gap-2">
                  {/* Parent Comment */}
                  <div className="relative flex gap-3 items-start text-xs bg-zinc-950/20 p-3 rounded-xl border border-cosmic-border/10">
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
                      <p className="mt-1.5 text-stellar-white/90 leading-relaxed break-words font-sans">
                        {comment.content}
                      </p>
                      
                      {/* Reply Button Trigger */}
                      <button 
                        onClick={() => {
                          if (activeReplyCommentId === comment.id) {
                            setActiveReplyCommentId(null);
                          } else {
                            setActiveReplyCommentId(comment.id);
                            setReplyText("");
                          }
                        }}
                        className="mt-2 text-[10px] font-mono text-stardust-gray hover:text-aether-glow transition-colors focus-visible:outline-none focus-visible:underline cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                  </div>

                  {/* Comment Replies */}
                  {(comment.replies || []).map((reply) => (
                    <div key={reply.id} className="flex gap-2.5 items-start pl-8 text-xs relative">
                      <div className="absolute left-6 -top-2 w-3.5 h-6 border-l-2 border-b-2 border-cosmic-border/20 rounded-bl-lg pointer-events-none" />
                      <div className="h-5 w-5 rounded bg-gradient-to-tr from-indigo-950 to-zinc-950 border border-cosmic-border/30 flex items-center justify-center font-bold text-[8px] text-stardust-gray flex-shrink-0">
                        {reply.avatarText}
                      </div>
                      <div className="flex-1 min-w-0 bg-zinc-950/10 p-2.5 rounded-lg border border-cosmic-border/5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-stellar-white">{reply.authorName}</span>
                            <span className="text-stardust-gray/50 font-mono text-[8px]">{reply.authorHandle}</span>
                          </div>
                          <span className="text-stardust-gray/40 font-mono text-[8px]">{reply.timestamp}</span>
                        </div>
                        <p className="mt-1 text-stellar-white/80 leading-relaxed break-words font-sans">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Add Reply Input Panel */}
                  {activeReplyCommentId === comment.id ? (
                    <form 
                      onSubmit={(e) => submitReply(e, comment.id)}
                      className="flex items-start gap-2.5 pl-8 mt-1.5 animate-toast"
                    >
                      <div className="h-5 w-5 rounded bg-zinc-900 border border-cosmic-border flex items-center justify-center font-bold text-[8px] text-stellar-white flex-shrink-0">
                        {user?.avatarText || "Æ"}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder={`Reply to ${comment.authorHandle}…`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 rounded-lg border border-cosmic-border bg-zinc-950/50 px-3 py-1.5 font-display text-[11px] text-stellar-white placeholder-stardust-gray/40 focus-visible:border-aether-glow/50 focus-visible:bg-zinc-950/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/30"
                        />
                        <button
                          type="submit"
                          disabled={!replyText.trim()}
                          className="px-3 rounded-lg bg-aether-glow hover:bg-indigo-600 disabled:opacity-40 disabled:hover:bg-aether-glow text-stellar-white font-mono text-[10px] tracking-wide uppercase transition-all cursor-pointer focus-visible:outline-none"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="text-center py-4 font-mono text-[10px] text-stardust-gray/50">
                No signal responses logged.
              </div>
            )}
          </div>

          {/* Add Comment Input Form */}
          <form 
            onSubmit={submitComment}
            className="flex items-start gap-3 mt-1.5 pt-2.5 border-t border-cosmic-border/10"
          >
            <div className="h-7 w-7 rounded bg-zinc-900 border border-cosmic-border flex items-center justify-center font-bold text-xs text-stellar-white flex-shrink-0">
              {user?.avatarText || "Æ"}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                required
                placeholder="Log your node transmission feedback…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 rounded-xl border border-cosmic-border bg-zinc-950/40 px-3.5 py-2 font-display text-xs text-stellar-white placeholder-stardust-gray/40 transition-[border-color,background-color] focus-visible:border-aether-glow/50 focus-visible:bg-zinc-950/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/30"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-aether-glow to-indigo-600 hover:shadow-lg disabled:opacity-40 disabled:hover:shadow-none text-stellar-white font-display text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow"
              >
                Transmit
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </article>
  );
}
