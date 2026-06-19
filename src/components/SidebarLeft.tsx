import React, { useState } from "react";
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
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export default function SidebarLeft() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("aether_sidebar_collapsed") === "true";
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("aether_sidebar_collapsed", String(next));
      return next;
    });
  };

  const menuItems: MenuItem[] = [
    { icon: <Compass className="w-5 h-5" />, label: "Explore", path: "/explore" },
    { icon: <Bell className="w-5 h-5" />, label: "Notifications", path: "/notifications" },
    { icon: <Mail className="w-5 h-5" />, label: "Messages", path: "#messages" },
    { icon: <Bookmark className="w-5 h-5" />, label: "Bookmarks", path: "/bookmarks" },
    { icon: <User className="w-5 h-5" />, label: "Profile", path: "/profile" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/profile?tab=settings" },
  ];

  const isConsoleActive = location.pathname === "/";

  const getIsActive = (path: string) => {
    if (path.includes("tab=settings")) {
      return location.pathname === "/profile" && location.search === "?tab=settings";
    }
    if (path === "/profile") {
      return location.pathname === "/profile" && location.search !== "?tab=settings";
    }
    return location.pathname === path;
  };

  // Collapsed: a 72px wide column, all items centered via items-center on the aside
  // Expanded:  a 256/288px wide column with left-padded rows

  // We compute common classNames here once to avoid repetition
  const C = isCollapsed;

  // A single nav row — icon + optional label
  const NavLink = ({
    to,
    icon,
    label,
    isActive,
    badge,
  }: {
    to: string;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    badge?: React.ReactNode;
  }) => (
    <Link
      to={to}
      className={[
        "group flex items-center shrink-0 rounded-xl transition-all duration-300 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 overflow-hidden",
        C ? "w-10 h-10 justify-center" : "w-full h-11 px-3 gap-3",
        isActive
          ? C
            ? "bg-aether-glow/10 text-aether-glow"
            : "bg-gradient-to-r from-aether-glow/10 to-transparent text-stellar-white border-l-2 border-aether-glow"
          : C
          ? "text-stardust-gray hover:bg-zinc-900/60 hover:text-stellar-white"
          : "text-stardust-gray hover:bg-zinc-900/60 hover:text-stellar-white border-l-2 border-transparent",
      ].join(" ")}
    >
      <div className={`relative shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-aether-glow" : ""}`}>
        {icon}
        {badge}
      </div>
      {/* Label — hidden when collapsed */}
      <span
        className={[
          "font-medium text-[15px] whitespace-nowrap transition-all duration-300 ease-in-out",
          C ? "opacity-0 w-0 pointer-events-none" : "opacity-100 flex-1",
        ].join(" ")}
      >
        {label}
      </span>
      {/* Notification count badge */}
      {label === "Notifications" && unreadCount > 0 && !C && (
        <span className="ml-auto px-2 py-0.5 text-[10px] font-bold font-mono text-rose-100 bg-rose-600 rounded-full border border-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse">
          {unreadCount}
        </span>
      )}
    </Link>
  );

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside
        style={{ width: C ? "72px" : undefined }}
        className={[
          "hidden md:flex flex-col sticky top-0 max-h-screen",
          "border-r border-cosmic-border py-5",
          "transition-[width] duration-300 ease-in-out overflow-x-hidden",
          // Collapsed: fixed 72px, zero horizontal padding, center all children
          // Expanded:  natural width class + padding
          C ? "items-center px-0" : "w-64 lg:w-72 px-4",
        ].join(" ")}
      >
        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <div className={`flex items-center mb-8 shrink-0 ${C ? "w-10 justify-center" : "w-full gap-3"}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-aether-glow to-nebula-teal text-stellar-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span
            className={[
              "font-display text-xl font-extrabold tracking-wider whitespace-nowrap",
              "bg-gradient-to-r from-stellar-white via-stellar-white to-stardust-gray bg-clip-text text-transparent",
              "transition-all duration-300 ease-in-out",
              C ? "opacity-0 w-0 pointer-events-none" : "opacity-100",
            ].join(" ")}
          >
            AETHER
          </span>
        </div>

        {/* ── Nav items ─────────────────────────────────────────────────── */}
        <nav className={`flex flex-col gap-1 shrink-0 ${C ? "items-center w-10" : "w-full"}`}>
          <NavLink to="/" icon={<Command className="w-5 h-5" />} label="Console" isActive={isConsoleActive} />
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              icon={item.icon}
              label={item.label}
              isActive={getIsActive(item.path)}
              badge={
                item.label === "Notifications" && unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                ) : undefined
              }
            />
          ))}
        </nav>

        {/* ── Transmit button ───────────────────────────────────────────── */}
        <button
          onClick={() => {
            const el = document.getElementById("post-textarea");
            if (el) el.focus();
            else window.location.href = "/";
          }}
          aria-label="Transmit Signal"
          className={[
            "mt-6 shrink-0 flex items-center justify-center rounded-xl",
            "bg-gradient-to-r from-aether-glow to-nebula-teal",
            "font-display text-sm font-bold tracking-wide text-stellar-white",
            "transition-all duration-300 ease-in-out overflow-hidden",
            "hover:brightness-110 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-glow/50",
            C ? "w-10 h-10" : "w-full h-11 px-4 gap-2",
          ].join(" ")}
        >
          <Plus className="w-5 h-5 shrink-0" />
          {!C && <span className="whitespace-nowrap">Transmit</span>}
        </button>

        {/* ── Spacer pushes bottom items down ───────────────────────────── */}
        <div className="flex-1 min-h-0" />

        {/* ── Collapse toggle ───────────────────────────────────────────── */}
        <button
          onClick={toggleCollapse}
          aria-label={C ? "Expand sidebar" : "Collapse sidebar"}
          className={[
            "shrink-0 flex items-center rounded-xl mb-3",
            "text-stardust-gray hover:bg-zinc-900/60 hover:text-stellar-white",
            "transition-all duration-300 ease-in-out overflow-hidden",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50",
            C ? "w-10 h-10 justify-center" : "w-full h-11 px-3 gap-3",
          ].join(" ")}
        >
          <div className="shrink-0">
            {C ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </div>
          {!C && (
            <span className="font-medium text-[15px] whitespace-nowrap">
              Collapse Sidebar
            </span>
          )}
        </button>

        {/* ── User session ──────────────────────────────────────────────── */}
        <div
          className={[
            "shrink-0 flex items-center rounded-xl",
            "border border-cosmic-border/30 bg-zinc-900/20",
            "transition-all duration-300 ease-in-out overflow-hidden",
            C ? "w-10 h-10 justify-center p-0 border-transparent bg-transparent" : "w-full p-2.5 gap-3",
          ].join(" ")}
        >
          {/* Avatar — always visible, always w-9 h-9 */}
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-cosmic-border bg-gradient-to-br from-indigo-950 to-zinc-900 flex items-center justify-center font-bold text-sm text-aether-glow">
            {user?.avatarText || "Æ"}
          </div>
          {/* Name + handle — hidden when collapsed */}
          {!C && (
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
              <span className="font-display text-xs font-semibold text-stellar-white truncate">
                {user?.displayName || "Aether Pilot"}
              </span>
              <span className="font-mono text-[10px] text-stardust-gray truncate">
                {user?.username?.startsWith("@") ? user.username : `@${user?.username}`}
              </span>
            </div>
          )}
          {/* Logout — hidden when collapsed */}
          {!C && (
            <button
              onClick={logout}
              title="Disconnect Node"
              aria-label="Disconnect Node (Logout)"
              className="shrink-0 p-1.5 rounded-lg text-stardust-gray hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/50"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile bottom navigation bar ─────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 z-20 flex h-16 w-full items-center justify-around border-t border-cosmic-border bg-space-black/90 backdrop-blur-md px-2 md:hidden">
        <Link
          to="/"
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            isConsoleActive ? "text-aether-glow bg-aether-glow/10" : "text-stardust-gray hover:text-stellar-white"
          }`}
        >
          <Command className="w-5 h-5" />
        </Link>
        {menuItems.slice(0, 5).map((item, idx) => {
          const isActive = getIsActive(item.path);
          return (
            <Link
              key={idx}
              to={item.path}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                isActive ? "text-aether-glow bg-aether-glow/10" : "text-stardust-gray hover:text-stellar-white"
              }`}
            >
              {item.icon}
              {item.label === "Notifications" && unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
