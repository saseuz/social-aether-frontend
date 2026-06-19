import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { Link, useLocation } from "react-router-dom";
import { 
  Compass, 
  Bell, 
  Mail, 
  Bookmark, 
  User, 
  Settings, 
  Plus, 
  Sparkles,
  Command,
  LogOut
} from "lucide-react";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  matchPath: string;
}

export default function SidebarLeft() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { icon: <Compass className="w-5 h-5" />, label: "Explore", path: "#explore", matchPath: "#explore" },
    { icon: <Bell className="w-5 h-5" />, label: "Notifications", path: "/notifications", matchPath: "/notifications" },
    { icon: <Mail className="w-5 h-5" />, label: "Messages", path: "#messages", matchPath: "#messages" },
    { icon: <Bookmark className="w-5 h-5" />, label: "Bookmarks", path: "#bookmarks", matchPath: "#bookmarks" },
    { icon: <User className="w-5 h-5" />, label: "Profile", path: "/profile", matchPath: "/profile" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/profile?tab=settings", matchPath: "/profile?tab=settings" },
  ];

  const isConsoleActive = location.pathname === "/";

  return (
    <aside className="fixed bottom-0 left-0 z-20 flex h-16 w-full border-t border-cosmic-border bg-space-black/80 backdrop-blur-md px-2 py-1 md:sticky md:top-0 md:h-screen md:w-64 md:flex-col md:border-r md:border-t-0 md:bg-transparent md:px-4 md:py-6 lg:w-72">
      {/* Brand Logo - Top */}
      <div className="hidden items-center gap-3 px-2 mb-8 md:flex">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-aether-glow to-nebula-teal text-stellar-white shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <span className="font-display text-xl font-extrabold tracking-wider bg-gradient-to-r from-stellar-white via-stellar-white to-stardust-gray bg-clip-text text-transparent">
          AETHER
        </span>
      </div>

      {/* Nav Menu */}
      <nav className="flex w-full items-center justify-around md:flex-col md:items-start md:gap-1.5">
        {/* Home/Console Link */}
        <Link 
          to="/" 
          className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-[background-color,color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 md:w-full ${
            isConsoleActive 
              ? "bg-gradient-to-r from-aether-glow/10 to-transparent text-stellar-white border-l-2 border-aether-glow" 
              : "text-stardust-gray hover:bg-zinc-900/60 hover:text-stellar-white"
          }`}
        >
          <Command className={`w-5 h-5 ${isConsoleActive ? "text-aether-glow" : "text-stardust-gray"}`} />
          <span className="hidden font-medium text-[15px] md:inline">Console</span>
        </Link>

        {menuItems.map((item, idx) => {
          // Determine active status:
          // For profile, match "/profile". For settings, match if it ends with tab=settings.
          const isItemActive = item.path.startsWith("/profile")
            ? (item.path.includes("tab=settings")
              ? location.pathname === "/profile" && location.search === "?tab=settings"
              : location.pathname === "/profile" && location.search !== "?tab=settings")
            : location.pathname === item.path;

          return (
            <Link
              key={idx}
              to={item.path}
              className={`group flex items-center gap-4 rounded-xl px-4 py-3 transition-[background-color,color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 md:w-full relative ${
                isItemActive 
                  ? "bg-gradient-to-r from-aether-glow/10 to-transparent text-stellar-white border-l-2 border-aether-glow" 
                  : "text-stardust-gray hover:bg-zinc-900/60 hover:text-stellar-white"
              }`}
            >
              <div className={`relative transition-transform duration-200 group-hover:scale-110 ${isItemActive ? "text-aether-glow" : ""}`}>
                {item.icon}
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </div>
              <span className="hidden font-medium text-[15px] md:inline">{item.label}</span>
              {item.label === "Notifications" && unreadCount > 0 && (
                <span className="hidden md:inline-flex items-center justify-center ml-auto px-2 py-0.5 text-[10px] font-bold font-mono leading-none text-rose-100 bg-rose-600 rounded-full border border-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}

        {/* Action Button - Only on Desktop */}
        <button 
          onClick={() => {
            const textarea = document.getElementById("post-textarea");
            if (textarea) {
              textarea.focus();
            } else {
              // Redirect to main feed if not there, then focus
              window.location.href = "/";
            }
          }}
          className="mt-6 hidden w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-aether-glow to-nebula-teal px-4 py-3.5 font-display text-sm font-bold tracking-wide text-stellar-white transition-[background-color,box-shadow,transform,filter] duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-glow/50 md:flex"
        >
          <Plus className="w-4 h-4" />
          Transmit
        </button>
      </nav>

      {/* User Session Quick Peek - Desktop bottom */}
      <div className="mt-auto hidden items-center justify-between gap-3 rounded-xl border border-cosmic-border/30 bg-zinc-900/20 p-3 md:flex">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-cosmic-border bg-gradient-to-br from-indigo-950 to-zinc-900 flex items-center justify-center font-bold text-aether-glow">
            {user?.avatarText || "Æ"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-display text-xs font-semibold text-stellar-white truncate">
              {user?.displayName || "Aether Pilot"}
            </span>
            <span className="font-mono text-[10px] text-stardust-gray truncate">
              {user?.username.startsWith("@") ? user.username : `@${user?.username}`}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-1.5 rounded-lg text-stardust-gray hover:text-rose-500 hover:bg-rose-500/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/50"
          title="Disconnect Node (Logout)"
          aria-label="Disconnect Node (Logout)"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
