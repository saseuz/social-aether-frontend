import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { User } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";
import { 
  Settings, 
  Radio, 
  Sparkles, 
  ArrowLeft,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
  Key
} from "lucide-react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { user, updateProfile, changePassword, connections, toggleConnection } = useAuth();
  const { posts } = usePosts();
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { username: urlUsername } = useParams<{ username?: string }>();

  // Determine if viewing self or another user
  const isSelf = !urlUsername || 
    urlUsername.toLowerCase().replace("@", "") === user?.username.toLowerCase().replace("@", "");

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Tab State: 'transmissions' | 'settings'
  const [activeTab, setActiveTab] = useState<"transmissions" | "settings">("transmissions");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    Promise.resolve().then(() => {
      if (tabParam === "settings" && isSelf) {
        setActiveTab("settings");
      } else {
        setActiveTab("transmissions");
      }
    });
  }, [searchParams, isSelf]);

  // Fetch profile details if viewing another user
  useEffect(() => {
    if (isSelf) {
      Promise.resolve().then(() => {
        setProfileUser(user);
        setProfileError(null);
        setLoadingProfile(false);
      });
    } else {
      async function fetchUserProfile() {
        Promise.resolve().then(() => {
          setLoadingProfile(true);
          setProfileError(null);
        });
        try {
          const profile = await apiClient.get<User>(`/users/profile/${urlUsername}`);
          Promise.resolve().then(() => {
            setProfileUser(profile);
          });
        } catch (err: unknown) {
          console.error("Failed to load node profile:", err);
          const message = err instanceof Error ? err.message : "Failed to load node profile.";
          Promise.resolve().then(() => {
            setProfileError(message);
          });
        } finally {
          Promise.resolve().then(() => {
            setLoadingProfile(false);
          });
        }
      }
      fetchUserProfile();
    }
  }, [urlUsername, user, isSelf]);

  // Connect/disconnect node (follow/unfollow) logic
  const isFollowed = profileUser ? connections.includes(profileUser.username.replace("@", "")) : false;

  const handleToggleFollow = () => {
    if (!profileUser) return;
    toggleConnection(profileUser.username);
  };


  // Filter profile user's posts
  const profileCleanHandle = profileUser?.username.startsWith("@") ? profileUser.username : `@${profileUser?.username}`;
  const profilePosts = posts.filter(post => 
    (post.authorHandle.toLowerCase() === profileCleanHandle.toLowerCase() && !post.isRetransmission) ||
    post.repostedBy?.toLowerCase() === profileCleanHandle.toLowerCase()
  );

  // Stats calculation
  const transmissionsCount = profilePosts.length;
  const totalLikesReceived = posts
    .filter(post => post.authorHandle.toLowerCase() === profileCleanHandle.toLowerCase() && !post.isRetransmission)
    .reduce((sum, post) => sum + post.likes, 0);

  // Settings form states
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(user?.username.replace("@", "") || "");
  const [email, setEmail] = useState(user?.email || "");
  
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStatusMessage, setPasswordStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Keep form fields synced with user context updates
  useEffect(() => {
    if (user && isSelf) {
      Promise.resolve().then(() => {
        setDisplayName(user.displayName);
        setUsername(user.username.replace("@", ""));
        setEmail(user.email);
      });
    }
  }, [user, isSelf]);


  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim() || !email.trim()) {
      setStatusMessage({ type: "error", text: "All fields are required to maintain node alignment." });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const cleanUsername = username.trim().startsWith("@") 
        ? username.trim().substring(1) 
        : username.trim();
        
      await updateProfile(displayName.trim(), cleanUsername, email.trim());
      setStatusMessage({ type: "success", text: "Aether profile synchronized successfully." });
      
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update node configuration.";
      setStatusMessage({ 
        type: "error", 
        text: message 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordStatusMessage({ type: "error", text: "All fields are required for node key realignment." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatusMessage({ type: "error", text: "New node keys do not align." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatusMessage({ type: "error", text: "New node key must be at least 6 characters." });
      return;
    }

    setIsChangingPassword(true);
    setPasswordStatusMessage(null);

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordStatusMessage({ type: "success", text: "Node key successfully synchronized." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update node key.";
      setPasswordStatusMessage({
        type: "error",
        text: message
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Sparkles className="w-8 h-8 text-aether-glow animate-spin" />
        <span className="font-mono text-xs text-stardust-gray animate-pulse">Resolving node sequence…</span>
      </div>
    );
  }

  if (profileError || !profileUser) {
    return (
      <div className="flex-1 border-cosmic-border/50 min-w-0 md:border-r md:px-4 lg:px-6 py-12 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-pulse" />
        <h2 className="font-display text-base font-bold text-stellar-white mb-2">Node connection failed</h2>
        <p className="font-mono text-xs text-stardust-gray/60 mb-6 text-center max-w-xs">{profileError || "Specified user node was not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-cosmic-border px-4 py-2.5 font-mono text-xs text-stellar-white hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div id="profile-container" className="flex-1 border-cosmic-border/50 min-w-0 md:border-r md:px-4 lg:px-6">
      {/* Profile Header Navigation */}
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-cosmic-border bg-space-black/75 backdrop-blur-md py-4 mb-6">
        <button 
          onClick={() => navigate("/")}
          className="p-2 rounded-xl text-stardust-gray hover:text-stellar-white hover:bg-zinc-900/40 transition-[color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50"
          title="Back to Console"
          aria-label="Back to Console"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="font-display text-lg font-bold tracking-wide text-stellar-white m-0 leading-tight">
            {profileUser?.displayName || "Aether Pilot"}
          </h1>
          <span className="font-mono text-[10px] text-stardust-gray/60 leading-none mt-1">
            {transmissionsCount} {transmissionsCount === 1 ? "transmission" : "transmissions"} logged
          </span>
        </div>
      </header>

      {/* Cosmic Banner Card */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-cosmic-border/40 bg-gradient-to-tr from-indigo-950/20 via-zinc-950 to-slate-900/30 p-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
        {/* Background ambient light overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-aether-glow/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-end gap-5 z-10">
          {/* Large Glassmorphic Avatar */}
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-aether-glow/20 via-nebula-teal/20 to-indigo-500/10 border-2 border-aether-glow/40 flex items-center justify-center font-display text-2xl font-extrabold text-stellar-white shadow-xl shadow-indigo-500/10">
            {profileUser?.avatarText || "Æ"}
          </div>
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="font-display text-xl font-extrabold text-stellar-white">
              {profileUser?.displayName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-aether-glow font-medium bg-aether-glow/5 border border-aether-glow/10 px-2 py-0.5 rounded-md">
                {profileCleanHandle}
              </span>
              <span className="font-mono text-[10px] text-stardust-gray flex items-center gap-1">
                <Mail className="w-3 h-3 text-stardust-gray/60" />
                {profileUser?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button & Stats Panel */}
        <div className="flex flex-col md:flex-row items-center gap-4 z-10 w-full md:w-auto justify-center md:justify-end">
          {!isSelf ? (
            <button
              onClick={handleToggleFollow}
              className={`w-full md:w-auto px-4 py-2.5 rounded-xl font-display text-xs font-bold transition-[background-color,border-color,box-shadow,transform] duration-200 active:scale-95 border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aether-glow/50 ${
                isFollowed
                  ? "bg-transparent border-cosmic-border text-stardust-gray hover:text-rose-500 hover:border-rose-500/40"
                  : "bg-gradient-to-r from-aether-glow to-nebula-teal text-stellar-white border-transparent hover:brightness-110 hover:shadow-lg hover:shadow-indigo-500/20"
              }`}
            >
              {isFollowed ? "Disconnect Node" : "Connect Node"}
            </button>
          ) : null}

          <div className="flex gap-4 bg-zinc-950/40 p-4 rounded-xl border border-cosmic-border/20 backdrop-blur-sm w-full md:w-auto justify-around">
            <div className="flex flex-col items-center px-2 border-r border-cosmic-border/10">
              <span className="font-display text-lg font-bold text-stellar-white">{transmissionsCount}</span>
              <span className="text-[10px] text-stardust-gray/60 uppercase tracking-wider font-mono">Waves</span>
            </div>
            <div className="flex flex-col items-center px-2">
              <span className="font-display text-lg font-bold text-rose-500">{totalLikesReceived}</span>
              <span className="text-[10px] text-stardust-gray/60 uppercase tracking-wider font-mono">Likes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      {isSelf ? (
        <div className="flex border-b border-cosmic-border/30 mb-6 gap-2">
          <button
            onClick={() => {
              setActiveTab("transmissions");
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 font-display text-xs font-bold tracking-wider uppercase border-b-2 transition-[color,border-color] duration-150 focus-visible:outline-none ${
              activeTab === "transmissions"
                ? "border-aether-glow text-stellar-white"
                : "border-transparent text-stardust-gray/60 hover:text-stellar-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Transmissions
          </button>
          <button
            onClick={() => {
              setActiveTab("settings");
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 font-display text-xs font-bold tracking-wider uppercase border-b-2 transition-[color,border-color] duration-150 focus-visible:outline-none ${
              activeTab === "settings"
                ? "border-aether-glow text-stellar-white"
                : "border-transparent text-stardust-gray/60 hover:text-stellar-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Node Settings
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-b border-cosmic-border/30 pb-3 mb-6">
          <Radio className="w-4 h-4 text-nebula-teal" />
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-stellar-white">Transmissions Stream</h3>
        </div>
      )}

      {/* Profile Page Content Views */}
      <div className="pb-24">
        {activeTab === "transmissions" ? (
          <div className="flex flex-col gap-4">
            {profilePosts.length > 0 ? (
              profilePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-12 px-4 glass-panel rounded-2xl border border-cosmic-border/20">
                <Radio className="w-8 h-8 mx-auto text-stardust-gray/40 mb-3 animate-pulse" />
                <h3 className="font-display text-sm font-semibold text-stellar-white">No Transmissions Logged</h3>
                <p className="mt-1 text-xs text-stardust-gray/50 max-w-xs mx-auto">
                  Your node signal has not broadcasts any messages yet. Go back to the Console to emit your first wave.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Settings View (Profile Settings & Password Change) */
          <div className="flex flex-col gap-6">
            {/* Profile Parameters Form */}
            <form onSubmit={handleSaveSettings}>
              <div className="glass-panel p-6 rounded-2xl border border-cosmic-border/30 flex flex-col gap-5">
                <div className="flex items-center gap-2 pb-3 border-b border-cosmic-border/10">
                  <Shield className="w-4 h-4 text-aether-glow" />
                  <h3 className="font-display text-sm font-bold text-stellar-white uppercase tracking-wider">Node Synchronization Parameters</h3>
                </div>

                {/* Status Message */}
                {statusMessage ? (
                  <div className={`p-3 rounded-xl text-xs flex gap-2.5 items-start border ${
                    statusMessage.type === "success" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    {statusMessage.type === "success" ? (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{statusMessage.text}</span>
                  </div>
                ) : null}

                {/* Display Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="settings-displayname" className="font-mono text-[10px] text-stardust-gray/70 uppercase tracking-wider">
                    Pilot Display Name
                  </label>
                  <input
                    id="settings-displayname"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-zinc-950/40 text-xs text-stellar-white border border-cosmic-border/30 rounded-xl px-3.5 py-2.5 outline-none focus:border-aether-glow/50 focus:ring-1 focus:ring-aether-glow/30 focus-visible:outline-none transition-[border-color,box-shadow] duration-200 font-sans"
                    placeholder="e.g. Commander Shepard"
                    required
                  />
                </div>

                {/* Username/Handle Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="settings-username" className="font-mono text-[10px] text-stardust-gray/70 uppercase tracking-wider">
                    Node Handle Identifier
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 font-mono text-xs text-aether-glow select-none pointer-events-none">@</span>
                    <input
                      id="settings-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-zinc-950/40 text-xs text-stellar-white border border-cosmic-border/30 rounded-xl pl-7 pr-3.5 py-2.5 outline-none focus:border-aether-glow/50 focus:ring-1 focus:ring-aether-glow/30 focus-visible:outline-none transition-[border-color,box-shadow] duration-200 font-sans"
                      placeholder="handle_id"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-stardust-gray/40 font-mono mt-0.5">
                    Handles must be alphanumeric identifiers without spaces, used for routing and mentions.
                  </p>
                </div>

                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="settings-email" className="font-mono text-[10px] text-stardust-gray/70 uppercase tracking-wider">
                    Node Frequency (Email)
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-950/40 text-xs text-stellar-white border border-cosmic-border/30 rounded-xl px-3.5 py-2.5 outline-none focus:border-aether-glow/50 focus:ring-1 focus:ring-aether-glow/30 focus-visible:outline-none transition-[border-color,box-shadow] duration-200 font-sans"
                    placeholder="name@aether.net"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-aether-glow to-nebula-teal px-4 py-3 font-display text-xs font-bold tracking-wide text-stellar-white transition-[background-color,box-shadow,transform,filter] duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-glow/50 ${
                    isSaving ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Synchronizing Node...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Update Node Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword}>
              <div className="glass-panel p-6 rounded-2xl border border-cosmic-border/30 flex flex-col gap-5">
                <div className="flex items-center gap-2 pb-3 border-b border-cosmic-border/10">
                  <Key className="w-4 h-4 text-aether-glow" />
                  <h3 className="font-display text-sm font-bold text-stellar-white uppercase tracking-wider">Node Key Realignment</h3>
                </div>

                {/* Password Status Message */}
                {passwordStatusMessage ? (
                  <div className={`p-3 rounded-xl text-xs flex gap-2.5 items-start border ${
                    passwordStatusMessage.type === "success" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    {passwordStatusMessage.type === "success" ? (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{passwordStatusMessage.text}</span>
                  </div>
                ) : null}

                {/* Current Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password-current" className="font-mono text-[10px] text-stardust-gray/70 uppercase tracking-wider">
                    Current Node Key
                  </label>
                  <input
                    id="password-current"
                    name="current-password"
                    autoComplete="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-zinc-950/40 text-xs text-stellar-white border border-cosmic-border/30 rounded-xl px-3.5 py-2.5 outline-none focus:border-aether-glow/50 focus:ring-1 focus:ring-aether-glow/30 focus-visible:outline-none transition-[border-color,box-shadow] duration-200 font-sans"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* New Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password-new" className="font-mono text-[10px] text-stardust-gray/70 uppercase tracking-wider">
                    New Node Key
                  </label>
                  <input
                    id="password-new"
                    name="new-password"
                    autoComplete="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-zinc-950/40 text-xs text-stellar-white border border-cosmic-border/30 rounded-xl px-3.5 py-2.5 outline-none focus:border-aether-glow/50 focus:ring-1 focus:ring-aether-glow/30 focus-visible:outline-none transition-[border-color,box-shadow] duration-200 font-sans"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* Confirm Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password-confirm" className="font-mono text-[10px] text-stardust-gray/70 uppercase tracking-wider">
                    Confirm New Node Key
                  </label>
                  <input
                    id="password-confirm"
                    name="confirm-password"
                    autoComplete="new-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-zinc-950/40 text-xs text-stellar-white border border-cosmic-border/30 rounded-xl px-3.5 py-2.5 outline-none focus:border-aether-glow/50 focus:ring-1 focus:ring-aether-glow/30 focus-visible:outline-none transition-[border-color,box-shadow] duration-200 font-sans"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* Submit Change Password Button */}
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className={`w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-aether-glow to-nebula-teal px-4 py-3 font-display text-xs font-bold tracking-wide text-stellar-white transition-[background-color,box-shadow,transform,filter] duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-glow/50 ${
                    isChangingPassword ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isChangingPassword ? (
                    <>
                      <Key className="w-4 h-4 animate-spin" />
                      <span>Synchronizing Node Key...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Realign Node Key</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
