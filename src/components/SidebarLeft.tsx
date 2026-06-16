import { useAuth } from "../context/AuthContext";
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
  active?: boolean;
}

export default function SidebarLeft() {
  const { user, logout } = useAuth();

  const menuItems: MenuItem[] = [
    { icon: <Compass className="w-5 h-5" />, label: "Explore", active: true },
    { icon: <Bell className="w-5 h-5" />, label: "Notifications" },
    { icon: <Mail className="w-5 h-5" />, label: "Messages" },
    { icon: <Bookmark className="w-5 h-5" />, label: "Bookmarks" },
    { icon: <User className="w-5 h-5" />, label: "Profile" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings" },
  ];

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
        {/* Home Item (special layout rule or standard list) */}
        <a 
          href="#feed" 
          className="flex items-center gap-4 rounded-xl px-4 py-3 text-stardust-gray transition-[background-color,color,border-color,box-shadow,transform] duration-200 hover:bg-zinc-900/60 hover:text-stellar-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 md:w-full"
        >
          <Command className="w-5 h-5 text-aether-glow" />
          <span className="hidden font-medium text-[15px] md:inline">Console</span>
        </a>

        {menuItems.map((item, idx) => (
          <a
            key={idx}
            href={`#${item.label.toLowerCase()}`}
            className={`group flex items-center gap-4 rounded-xl px-4 py-3 transition-[background-color,color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 md:w-full ${
              item.active 
                ? "bg-gradient-to-r from-aether-glow/10 to-transparent text-stellar-white border-l-2 border-aether-glow" 
                : "text-stardust-gray hover:bg-zinc-900/60 hover:text-stellar-white"
            }`}
          >
            <div className={`transition-transform duration-200 group-hover:scale-110 ${item.active ? "text-aether-glow" : ""}`}>
              {item.icon}
            </div>
            <span className="hidden font-medium text-[15px] md:inline">{item.label}</span>
          </a>
        ))}\n\n        {/* Action Button - Only on Desktop */}
        <button 
          onClick={() => {
            const textarea = document.getElementById("post-textarea");
            if (textarea) textarea.focus();
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
              {user?.username || "@zypp_pilot"}
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
