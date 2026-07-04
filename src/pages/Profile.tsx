import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Radio, Shield, Save, Key, Orbit, Sparkles } from "lucide-react";
import { useAuth, type User } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";
import { apiClient } from "../services/apiClient";
import PostCard from "../components/PostCard";

type ProfileTab = "transmissions" | "settings" | "connections";

export default function Profile() {
  const { username: urlUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    user: currentUser,
    connections,
    toggleConnection,
    updateProfile,
    changePassword,
  } = useAuth();
  const { posts } = usePosts();

  const [activeTab, setActiveTab] = useState<ProfileTab>("transmissions");
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states for profile parameters
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form states for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passSuccess, setPassSuccess] = useState<boolean>(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Determine if viewing own node profile
  const isSelf =
    !urlUsername ||
    (currentUser &&
      urlUsername.replace("@", "").toLowerCase() ===
        currentUser.username.replace("@", "").toLowerCase());

  // Keep form fields synced with user context updates
  useEffect(() => {
    if (currentUser && isSelf) {
      Promise.resolve().then(() => {
        setDisplayName(currentUser.displayName);
        setUsername(currentUser.username.replace("@", ""));
        setEmail(currentUser.email);
      });
    }
  }, [currentUser, isSelf]);

  // Sync activeTab state from URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    Promise.resolve().then(() => {
      if (tabParam === "settings" && isSelf) {
        setActiveTab("settings");
      } else if (tabParam === "connections" && isSelf) {
        setActiveTab("connections");
      } else {
        setActiveTab("transmissions");
      }
    });
  }, [searchParams, isSelf]);

  // Sync and fetch profile details
  useEffect(() => {
    async function fetchProfile() {
      setLoadingProfile(true);
      setErrorMsg(null);

      if (isSelf) {
        setProfileUser(currentUser);
        setLoadingProfile(false);
      } else if (urlUsername) {
        try {
          const profileData = await apiClient.get<User>(
            `/users/profile/${urlUsername.replace("@", "")}`
          );
          setProfileUser(profileData);
        } catch (err) {
          console.error("Failed to load node profile:", err);
          setErrorMsg("Selected node coordinate is unreachable or offline.");
        } finally {
          setLoadingProfile(false);
        }
      }
    }

    fetchProfile();
  }, [urlUsername, currentUser, isSelf]);

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    if (tab === "transmissions") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const handleToggleFollow = () => {
    if (!profileUser) return;
    toggleConnection(profileUser.username);
  };

  // Connected users state
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [loadingConnections, setLoadingConnections] = useState<boolean>(false);

  // Sync and fetch connected users detail
  useEffect(() => {
    if (activeTab === "connections" && isSelf) {
      const missingUsernames = connections.filter(
        username => !connectedUsers.some(u => u.username.replace("@", "").toLowerCase() === username.toLowerCase())
      );
      if (missingUsernames.length > 0) {
        async function fetchMissing() {
          Promise.resolve().then(() => {
            setLoadingConnections(true);
          });
          try {
            const promises = missingUsernames.map(username =>
              apiClient.get<User>(`/users/profile/${username}`)
            );
            const resolved = await Promise.all(promises);
            Promise.resolve().then(() => {
              setConnectedUsers(prev => {
                const combined = [...prev, ...resolved];
                return combined.filter(u => connections.some(c => c.toLowerCase() === u.username.replace("@", "").toLowerCase()));
              });
            });
          } catch (err) {
            console.error("Failed to load connection details:", err);
          } finally {
            Promise.resolve().then(() => {
              setLoadingConnections(false);
            });
          }
        }
        fetchMissing();
      } else {
        // Sync list (filter out removed connections)
        Promise.resolve().then(() => {
          setConnectedUsers(prev => prev.filter(u => connections.some(c => c.toLowerCase() === u.username.replace("@", "").toLowerCase())));
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, connections, isSelf]);


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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);

    if (!displayName.trim() || !username.trim() || !email.trim()) {
      setSaveError("All synchronization parameters must be populated.");
      return;
    }

    try {
      await updateProfile(displayName.trim(), username.trim(), email.trim());
      setSaveSuccess(true);
    } catch (err) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : "Node update failed.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(false);
    setPassError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError("All security key fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New key does not match validation sequence.");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setPassSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setPassError(err instanceof Error ? err.message : "Key rotation failed.");
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-aether-glow/20 border-t-aether-glow animate-spin" />
          <span className="font-mono text-xs text-stardust-gray/60 animate-pulse">Resolving Node Address...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !profileUser) {
    return (
      <div className="flex-1 px-4 py-12 text-center border-r border-cosmic-border/50 min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-stellar-white">Transmission Terminated</h2>
          <p className="mt-2 text-xs text-stardust-gray/60 max-w-sm mx-auto leading-relaxed">{errorMsg}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 rounded-xl border border-cosmic-border bg-zinc-950/40 px-4 py-2 font-display text-xs text-stellar-white hover:bg-zinc-900/60 transition-all cursor-pointer"
        >
          Return to Console
        </button>
      </div>
    );
  }

  const isFollowed = connections.includes(profileUser.username.replace("@", ""));

  return (
    <div id="profile-container" className="flex-1 border-cosmic-border/50 min-w-0 md:border-r md:px-4 lg:px-6">
      {/* Node Profile Header Banner */}
      <div className="relative mt-4 h-32 w-full overflow-hidden rounded-2xl border border-cosmic-border/30 bg-gradient-to-r from-indigo-950/40 via-zinc-900/30 to-purple-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      </div>

      {/* Node Credentials Overlay */}
      <div className="relative px-6 pb-6 border-b border-cosmic-border/20">
        {/* Avatar block */}
        <div className="absolute -top-12 left-6">
          <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-cosmic-border bg-gradient-to-tr from-zinc-900 via-indigo-950 to-zinc-900 flex items-center justify-center font-display text-2xl font-bold text-stellar-white shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {profileUser.avatarText}
          </div>
        </div>

        {/* Action Button (Self / Follow) */}
        <div className="flex justify-end pt-4">
          {isSelf ? (
            <button
              onClick={() => handleTabChange("settings")}
              className={`rounded-xl border px-4 py-2 font-display text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer ${
                activeTab === "settings"
                  ? "bg-stellar-white border-stellar-white text-space-black hover:bg-zinc-200"
                  : "bg-transparent border-cosmic-border text-stellar-white hover:bg-zinc-900/40"
              }`}
            >
              Configure Node
            </button>
          ) : (
            <button
              onClick={handleToggleFollow}
              className={`rounded-xl px-4 py-2 font-display text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer border ${
                isFollowed
                  ? "bg-transparent border-cosmic-border text-stardust-gray hover:text-rose-400 hover:border-rose-400/30"
                  : "bg-gradient-to-r from-aether-glow to-nebula-teal border-transparent text-stellar-white hover:brightness-110"
              }`}
            >
              {isFollowed ? "Disconnect Alignment" : "Establish Alignment"}
            </button>
          )}
        </div>

        {/* User Identity Parameters */}
        <div className="mt-4">
          <h1 className="font-display text-lg font-bold text-stellar-white leading-tight">
            {profileUser.displayName}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 mt-1.5 font-mono text-[10px] text-stardust-gray/80">
            <span className="text-aether-glow font-semibold">
              {profileUser.username.startsWith("@") ? profileUser.username : `@${profileUser.username}`}
            </span>
            <span className="text-stardust-gray/30">•</span>
            <span>{profileUser.email}</span>
          </div>
        </div>

        {/* Stats segment */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-cosmic-border/10 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-stellar-white">{transmissionsCount}</span>
            <span className="text-stardust-gray/60 uppercase text-[10px] tracking-wider">Transmissions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-stellar-white">{totalLikesReceived}</span>
            <span className="text-stardust-gray/60 uppercase text-[10px] tracking-wider">Likes Logged</span>
          </div>
        </div>
      </div>

      {/* Tab Segment Controls */}
      {isSelf ? (
        <div className="flex border-b border-cosmic-border/30 mb-6 font-display text-xs uppercase tracking-wider font-bold">
          <button
            onClick={() => handleTabChange("transmissions")}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-300 cursor-pointer ${
              activeTab === "transmissions"
                ? "border-aether-glow text-stellar-white bg-aether-glow/5"
                : "border-transparent text-stardust-gray/60 hover:text-stellar-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Transmissions
          </button>
          <button
            onClick={() => handleTabChange("settings")}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-300 cursor-pointer ${
              activeTab === "settings"
                ? "border-aether-glow text-stellar-white bg-aether-glow/5"
                : "border-transparent text-stardust-gray/60 hover:text-stellar-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Node Settings
          </button>
          <button
            onClick={() => handleTabChange("connections")}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-300 cursor-pointer ${
              activeTab === "connections"
                ? "border-aether-glow text-stellar-white bg-aether-glow/5"
                : "border-transparent text-stardust-gray/60 hover:text-stellar-white"
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            Connections
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
        ) : activeTab === "connections" ? (
          /* Connections List View */
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-3 border-b border-cosmic-border/10 mb-2">
              <Orbit className="w-4 h-4 text-nebula-teal" />
              <h3 className="font-display text-sm font-bold text-stellar-white uppercase tracking-wider">
                Aligned Node Connections ({connections.length})
              </h3>
            </div>
            
            {loadingConnections && connectedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Sparkles className="w-6 h-6 text-nebula-teal animate-spin" />
                <span className="font-mono text-xs text-stardust-gray/60 animate-pulse">Scanning frequencies...</span>
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-12 px-4 glass-panel rounded-2xl border border-cosmic-border/20">
                <Orbit className="w-8 h-8 mx-auto text-stardust-gray/40 mb-3 animate-pulse" />
                <h3 className="font-display text-sm font-semibold text-stellar-white">No Alignments Established</h3>
                <p className="mt-1 text-xs text-stardust-gray/50 max-w-xs mx-auto">
                  Your node signal has no active connections. Explore other nodes in the network to establish alignments.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {connectedUsers.map((u) => (
                  <div key={u.id} className="glass-panel p-4 rounded-xl border border-cosmic-border/20 flex items-center justify-between gap-4">
                    <div 
                      onClick={() => navigate(`/profile/${u.username.replace("@", "")}`)}
                      className="flex items-center gap-3 group cursor-pointer focus-visible:outline-none"
                    >
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-gradient-to-tr from-indigo-950 to-zinc-900 border border-cosmic-border/30 flex items-center justify-center font-bold text-sm text-stellar-white group-hover:border-aether-glow/40 transition-colors">
                        {u.avatarText}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-display text-xs font-bold text-stellar-white group-hover:text-aether-glow transition-colors">
                          {u.displayName}
                        </span>
                        <span className="font-mono text-[10px] text-stardust-gray mt-0.5">
                          {u.username.startsWith("@") ? u.username : `@${u.username}`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleConnection(u.username)}
                      className="rounded-lg border border-nebula-teal/30 bg-nebula-teal/5 px-3 py-1.5 font-display text-[10px] font-bold text-nebula-teal transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 cursor-pointer group/btn min-w-[90px] text-center"
                      aria-label={`Disconnect from ${u.displayName}`}
                    >
                      <span className="group-hover/btn:hidden">Aligned</span>
                      <span className="hidden group-hover/btn:inline">Sever</span>
                    </button>
                  </div>
                ))}
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

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="displayName" className="font-mono text-[10px] text-stardust-gray uppercase tracking-wider">Display Designation</label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl border border-cosmic-border bg-zinc-950/40 px-4 py-2.5 font-sans text-xs text-stellar-white outline-none focus:border-aether-glow/50 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="username" className="font-mono text-[10px] text-stardust-gray uppercase tracking-wider">Unique Node Handle</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 font-mono text-xs text-stardust-gray/50">@</span>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-cosmic-border bg-zinc-950/40 pl-8 pr-4 py-2.5 font-sans text-xs text-stellar-white outline-none focus:border-aether-glow/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="font-mono text-[10px] text-stardust-gray uppercase tracking-wider">Node Communications Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-cosmic-border bg-zinc-950/40 px-4 py-2.5 font-sans text-xs text-stellar-white outline-none focus:border-aether-glow/50 transition-colors"
                  />
                </div>

                {saveSuccess && (
                  <div className="p-3.5 rounded-xl border border-nebula-teal/20 bg-nebula-teal/5 text-nebula-teal font-mono text-[10px] tracking-wide">
                    Node parameters successfully synchronized.
                  </div>
                )}

                {saveError && (
                  <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 font-mono text-[10px] tracking-wide">
                    Synchronization failed: {saveError}
                  </div>
                )}

                <button
                  type="submit"
                  className="rounded-xl bg-stellar-white py-2.5 font-display text-xs font-bold text-space-black transition-all hover:bg-zinc-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Parameters
                </button>
              </div>
            </form>

            {/* Password Rotation Form */}
            <form onSubmit={handlePasswordChange}>
              <div className="glass-panel p-6 rounded-2xl border border-cosmic-border/30 flex flex-col gap-5">
                <div className="flex items-center gap-2 pb-3 border-b border-cosmic-border/10">
                  <Key className="w-4 h-4 text-nebula-teal" />
                  <h3 className="font-display text-sm font-bold text-stellar-white uppercase tracking-wider">Security Key Rotation</h3>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="currentPassword" className="font-mono text-[10px] text-stardust-gray uppercase tracking-wider">Active Security Key</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-cosmic-border bg-zinc-950/40 px-4 py-2.5 font-sans text-xs text-stellar-white outline-none focus:border-aether-glow/50 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="newPassword" className="font-mono text-[10px] text-stardust-gray uppercase tracking-wider">New Security Key</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-cosmic-border bg-zinc-950/40 px-4 py-2.5 font-sans text-xs text-stellar-white outline-none focus:border-aether-glow/50 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="font-mono text-[10px] text-stardust-gray uppercase tracking-wider">Verify New Security Key</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-cosmic-border bg-zinc-950/40 px-4 py-2.5 font-sans text-xs text-stellar-white outline-none focus:border-aether-glow/50 transition-colors"
                  />
                </div>

                {passSuccess && (
                  <div className="p-3.5 rounded-xl border border-nebula-teal/20 bg-nebula-teal/5 text-nebula-teal font-mono text-[10px] tracking-wide">
                    Security key successfully rotated.
                  </div>
                )}

                {passError && (
                  <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 font-mono text-[10px] tracking-wide">
                    Rotation failed: {passError}
                  </div>
                )}

                <button
                  type="submit"
                  className="rounded-xl bg-transparent border border-cosmic-border py-2.5 font-display text-xs font-bold text-stellar-white transition-all hover:bg-zinc-900/40 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-nebula-teal" />
                  Rotate Security Key
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
