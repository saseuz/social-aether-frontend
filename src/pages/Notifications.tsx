import { useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import type { Notification } from "../context/NotificationContext";
import { 
  Heart, 
  MessageSquare, 
  RefreshCw, 
  UserPlus, 
  Sparkles, 
  Trash2, 
  CheckCheck, 
  Orbit, 
  X,
  Bell
} from "lucide-react";

export default function Notifications() {
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications, 
    deleteNotification 
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"all" | "interactions" | "system">("all");

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "all") return true;
    if (activeTab === "interactions") {
      return ["like", "repost", "comment", "reply", "follow"].includes(n.type);
    }
    if (activeTab === "system") return n.type === "system";
    return true;
  });

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />;
      case "repost":
        return <RefreshCw className="w-4 h-4 text-nebula-teal" />;
      case "comment":
      case "reply":
        return <MessageSquare className="w-4 h-4 text-aether-glow" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-indigo-400" />;
      case "system":
        return <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />;
      default:
        return <Bell className="w-4 h-4 text-stardust-gray" />;
    }
  };

  const getNotificationDescription = (n: Notification) => {
    const userLink = (
      <Link 
        to={`/profile/${n.senderHandle.replace("@", "")}`} 
        className="font-display font-bold text-stellar-white hover:text-aether-glow hover:underline transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {n.senderName}
      </Link>
    );

    switch (n.type) {
      case "like":
        return (
          <span>
            {userLink} liked your transmission
          </span>
        );
      case "repost":
        return (
          <span>
            {userLink} retransmitted your node
          </span>
        );
      case "comment":
        return (
          <span>
            {userLink} commented on your node
          </span>
        );
      case "reply":
        return (
          <span>
            {userLink} replied to your signal
          </span>
        );
      case "follow":
        return (
          <span>
            {userLink} aligned with your telemetry stream
          </span>
        );
      case "system":
        return (
          <span className="font-semibold text-cyan-400">
            System Update: Telemetry fully synced
          </span>
        );
      default:
        return <span>Action from {userLink}</span>;
    }
  };

  return (
    <div className="flex-1 border-cosmic-border/50 min-w-0 md:border-r md:px-4 lg:px-6">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-cosmic-border bg-space-black/75 backdrop-blur-md py-4 mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-aether-glow" />
          <h1 className="font-display text-lg font-bold tracking-wide text-stellar-white m-0">
            Notifications
          </h1>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => markAllAsRead()}
              disabled={notifications.every(n => n.isRead)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-cosmic-border bg-zinc-900/30 hover:bg-zinc-900/60 text-stardust-gray hover:text-stellar-white transition-all disabled:opacity-30 disabled:hover:bg-zinc-900/30 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50"
              title="Mark all as read"
              aria-label="Mark all notifications as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => clearNotifications()}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/50"
              title="Clear all notifications"
              aria-label="Clear all notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="flex border-b border-cosmic-border mb-6 gap-2">
        {(["all", "interactions", "system"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 font-display text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer focus-visible:outline-none ${
              activeTab === tab
                ? "border-aether-glow text-stellar-white"
                : "border-transparent text-stardust-gray hover:text-stellar-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="flex flex-col gap-3 pb-24">
        {isLoading ? (
          // Skeleton Loader
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-4 flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-zinc-800" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/4" />
              </div>
            </div>
          ))
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
              className={`glass-interactive rounded-2xl p-4 flex gap-4 relative group cursor-pointer border-l-2 transition-all duration-300 ${
                notif.isRead 
                  ? "border-transparent bg-zinc-950/20" 
                  : "border-aether-glow bg-indigo-950/5 shadow-[0_0_15px_rgba(99,102,241,0.02)]"
              }`}
            >
              {/* Left Column: Avatar & Type Indicator overlay */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-lg border border-cosmic-border bg-gradient-to-br from-indigo-950 to-zinc-900 flex items-center justify-center font-bold text-sm text-stellar-white shadow-inner">
                  {notif.senderAvatarText}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-md border border-cosmic-border bg-zinc-900 flex items-center justify-center shadow-md">
                  {getNotificationIcon(notif.type)}
                </div>
              </div>

              {/* Middle Column: Details */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="flex justify-between items-start gap-4">
                  <div className="text-[13px] leading-relaxed text-stardust-gray">
                    {getNotificationDescription(notif)}
                  </div>
                  <span className="font-mono text-[9px] text-stardust-gray/40 whitespace-nowrap self-start mt-0.5">
                    {notif.timestamp}
                  </span>
                </div>

                {/* Content preview if applicable */}
                {(notif.commentContent || notif.postContent) && (
                  <div className="text-xs bg-zinc-950/40 border border-cosmic-border/30 rounded-xl p-3 mt-1 font-sans italic text-stellar-white/80 leading-relaxed shadow-inner">
                    {notif.commentContent || notif.postContent}
                  </div>
                )}
              </div>

              {/* Right Column: Unread Dot / Dismiss button */}
              <div className="flex items-center gap-3 self-center pl-2">
                {!notif.isRead && (
                  <span 
                    className="w-2 h-2 rounded-full bg-aether-glow shadow-[0_0_8px_rgba(99,102,241,0.6)] flex-shrink-0" 
                    title="Unread"
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="p-1 rounded-lg text-stardust-gray hover:text-rose-500 hover:bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/50"
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          // Empty State
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 border border-cosmic-border/30 bg-zinc-900/10 min-h-[300px]">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-950/20 border border-cosmic-border text-stardust-gray/50 mb-2">
              <Orbit className="w-8 h-8 animate-spin-slow text-stardust-gray/30" style={{ animationDuration: '10s' }} />
              <Bell className="w-4 h-4 absolute text-aether-glow" />
            </div>
            <h3 className="font-display text-sm font-bold tracking-wider text-stellar-white uppercase">
              No telemetry signals detected
            </h3>
            <p className="text-xs text-stardust-gray max-w-xs leading-relaxed font-sans">
              This quadrant is currently quiet. Any nodes interacting with your signals will be logged here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
