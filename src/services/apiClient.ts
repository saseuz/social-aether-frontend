/**
 * Aether Network API client wrapper.
 * Provides custom type-safe fetching, authorization header management, and API error formatting.
 */

const TOKEN_KEY = "aether_session_token";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface ApiErrorOptions {
  status: number;
  message: string;
  code?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor({ status, message, code }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// In mock mode, we bypass actual fetch network calls and simulate API response latency.
// Set to true by default for local standalone validation, toggles automatically if a base URL is specified.
const IS_MOCK_MODE = !import.meta.env.VITE_API_BASE_URL;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for Mock DB State
interface MockDB {
  users: Array<{
    id: string;
    email: string;
    displayName: string;
    username: string;
    avatarText: string;
    passwordHash: string;
  }>;
}

const getMockDB = (): MockDB => {
  const data = localStorage.getItem("aether_mock_db");
  if (data) return JSON.parse(data);
  const initial: MockDB = {
    users: [
      {
        id: "sys-1",
        email: "pilot@aether.net",
        displayName: "Aether Pilot",
        username: "zypp_pilot",
        avatarText: "Æ",
        passwordHash: "password123", // Simplified mock password check
      },
    ],
  };
  localStorage.setItem("aether_mock_db", JSON.stringify(initial));
  return initial;
};

const saveMockDB = (db: MockDB) => {
  localStorage.setItem("aether_mock_db", JSON.stringify(db));
};

const getMockNotifications = () => {
  const data = localStorage.getItem("aether_notifications");
  if (data) return JSON.parse(data);
  const initial = [
    {
      id: "n-1",
      type: "system",
      senderName: "Aether Protocol",
      senderHandle: "@aether_net",
      senderAvatarText: "AP",
      timestamp: "1d ago",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: false,
    },
    {
      id: "n-2",
      type: "like",
      senderName: "Astro Coder",
      senderHandle: "@astro_coder",
      senderAvatarText: "AC",
      timestamp: "18m ago",
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      isRead: false,
    },
    {
      id: "n-3",
      type: "comment",
      senderName: "Minimalist Lab",
      senderHandle: "@minimalist_lab",
      senderAvatarText: "ML",
      commentContent: "The glassmorphic panels feel very responsive!",
      timestamp: "2h ago",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
    {
      id: "n-4",
      type: "repost",
      senderName: "Aether Protocol",
      senderHandle: "@aether_net",
      senderAvatarText: "AP",
      timestamp: "1d ago",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 - 1000).toISOString(),
      isRead: true,
    },
    {
      id: "n-5",
      type: "follow",
      senderName: "Cosmic Dev",
      senderHandle: "@nebula_coder",
      senderAvatarText: "CD",
      timestamp: "2d ago",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    }
  ];
  localStorage.setItem("aether_notifications", JSON.stringify(initial));
  return initial;
};

const saveMockNotifications = (notifications: any[]) => {
  localStorage.setItem("aether_notifications", JSON.stringify(notifications));
};

export const apiClient = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  request: async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // MOCK MODE FLOW
    if (IS_MOCK_MODE) {
      await sleep(600); // Simulate network latency

      const db = getMockDB();
      const token = apiClient.getToken();

      // Mock Handler for Login
      if (cleanEndpoint === "/auth/login" && options.method === "POST") {
        const { email, password } = JSON.parse(options.body as string);
        const user = db.users.find((u) => u.email === email && u.passwordHash === password);
        if (!user) {
          throw new ApiError({ status: 401, message: "Node synchronization failed. Check credentials." });
        }
        const mockJwt = `mock-jwt-token-for-${user.id}`;
        apiClient.setToken(mockJwt);
        return {
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            username: user.username,
            avatarText: user.avatarText,
          },
          token: mockJwt,
        } as T;
      }

      // Mock Handler for Register
      if (cleanEndpoint === "/auth/register" && options.method === "POST") {
        const { displayName, username, email, password } = JSON.parse(options.body as string);
        
        if (db.users.some((u) => u.email === email)) {
          throw new ApiError({ status: 400, message: "Email is already mapped to an active node." });
        }
        if (db.users.some((u) => u.username === username.replace("@", ""))) {
          throw new ApiError({ status: 400, message: "Handle identifier is already synchronized." });
        }

        const newUser = {
          id: `usr-${Date.now()}`,
          email,
          displayName,
          username: username.startsWith("@") ? username.substring(1) : username,
          avatarText: displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2),
          passwordHash: password,
        };

        db.users.push(newUser);
        saveMockDB(db);

        const mockJwt = `mock-jwt-token-for-${newUser.id}`;
        apiClient.setToken(mockJwt);

        return {
          user: {
            id: newUser.id,
            email: newUser.email,
            displayName: newUser.displayName,
            username: `@${newUser.username}`,
          },
          token: mockJwt,
        } as T;
      }

      // Mock Handler for Fetch Profile
      if (cleanEndpoint === "/auth/me" && options.method === "GET") {
        if (!token) {
          throw new ApiError({ status: 401, message: "Unauthenticated: Missing transmission token." });
        }
        const userId = token.replace("mock-jwt-token-for-", "");
        const user = db.users.find((u) => u.id === userId);
        if (!user) {
          throw new ApiError({ status: 401, message: "Session invalid or expired." });
        }
        return {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          username: user.username.startsWith("@") ? user.username : `@${user.username}`,
          avatarText: user.avatarText,
        } as T;
      }

      // Mock Handler for Update Profile
      if (cleanEndpoint === "/auth/update" && options.method === "PUT") {
        if (!token) {
          throw new ApiError({ status: 401, message: "Unauthenticated: Missing transmission token." });
        }
        const userId = token.replace("mock-jwt-token-for-", "");
        const userIdx = db.users.findIndex((u) => u.id === userId);
        if (userIdx === -1) {
          throw new ApiError({ status: 401, message: "Session invalid or expired." });
        }

        const { displayName, username, email } = JSON.parse(options.body as string);

        // Check uniqueness if email/username changed
        const cleanUsername = username.startsWith("@") ? username.substring(1) : username;
        if (db.users.some((u) => u.id !== userId && u.email === email)) {
          throw new ApiError({ status: 400, message: "Email is already mapped to an active node." });
        }
        if (db.users.some((u) => u.id !== userId && u.username === cleanUsername)) {
          throw new ApiError({ status: 400, message: "Handle identifier is already synchronized." });
        }

        db.users[userIdx].displayName = displayName;
        db.users[userIdx].username = cleanUsername;
        db.users[userIdx].email = email;
        db.users[userIdx].avatarText = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

        saveMockDB(db);

        return {
          id: db.users[userIdx].id,
          email: db.users[userIdx].email,
          displayName: db.users[userIdx].displayName,
          username: `@${db.users[userIdx].username}`,
          avatarText: db.users[userIdx].avatarText,
        } as T;
      }

      // Mock Handler for Change Password
      if (cleanEndpoint === "/auth/change-password" && options.method === "PUT") {
        if (!token) {
          throw new ApiError({ status: 401, message: "Unauthenticated: Missing transmission token." });
        }
        const userId = token.replace("mock-jwt-token-for-", "");
        const userIdx = db.users.findIndex((u) => u.id === userId);
        if (userIdx === -1) {
          throw new ApiError({ status: 401, message: "Session invalid or expired." });
        }

        const { currentPassword, newPassword } = JSON.parse(options.body as string);

        if (db.users[userIdx].passwordHash !== currentPassword) {
          throw new ApiError({ status: 400, message: "Current password validation failed." });
        }

        db.users[userIdx].passwordHash = newPassword;
        saveMockDB(db);

        return { message: "Password updated successfully." } as T;
      }

      // Mock Handler for Fetching Another User's Profile
      if (cleanEndpoint.startsWith("/users/profile") && options.method === "GET") {
        const urlObj = new URL(cleanEndpoint, "http://localhost");
        const handle = urlObj.searchParams.get("username") || cleanEndpoint.split("/").pop() || "";
        const cleanHandle = handle.replace("@", "");

        const user = db.users.find(u => u.username.toLowerCase() === cleanHandle.toLowerCase());
        if (!user) {
          const seedAuthors: Record<string, { displayName: string, avatarText: string, email: string }> = {
            "astro_coder": { displayName: "Astro Coder", avatarText: "AC", email: "astro@aether.net" },
            "minimalist_lab": { displayName: "Minimalist Lab", avatarText: "ML", email: "minimalist@aether.net" },
            "aether_net": { displayName: "Aether Protocol", avatarText: "AP", email: "protocol@aether.net" },
            "nebula_coder": { displayName: "Cosmic Dev", avatarText: "CD", email: "nebula@aether.net" },
            "design_taste": { displayName: "Aesthetic Lab", avatarText: "AL", email: "design@aether.net" }
          };

          const seedUser = seedAuthors[cleanHandle.toLowerCase()];
          if (seedUser) {
            return {
              id: `usr-${cleanHandle}`,
              displayName: seedUser.displayName,
              username: `@${cleanHandle}`,
              avatarText: seedUser.avatarText,
              email: seedUser.email
            } as T;
          }

          throw new ApiError({ status: 404, message: "User node not found in Aether net." });
        }

        return {
          id: user.id,
          displayName: user.displayName,
          username: `@${user.username}`,
          avatarText: user.avatarText,
          email: user.email
        } as T;
      }

      // Mock Handler for Fetching Notifications
      if (cleanEndpoint === "/notifications" && options.method === "GET") {
        if (!token) {
          throw new ApiError({ status: 401, message: "Unauthenticated: Missing transmission token." });
        }
        return getMockNotifications() as T;
      }

      // Mock Handler for Adding a Mock Notification (Simulated Loop)
      if (cleanEndpoint === "/notifications" && options.method === "POST") {
        if (!token) {
          throw new ApiError({ status: 401, message: "Unauthenticated: Missing transmission token." });
        }
        const body = JSON.parse(options.body as string || "{}");
        const list = getMockNotifications();
        const newNotif = {
          ...body,
          id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          isRead: false,
          createdAt: new Date().toISOString(),
          timestamp: "Just now"
        };
        list.unshift(newNotif);
        saveMockNotifications(list);
        return newNotif as T;
      }

      // Mock Handler for Marking Notifications as Read
      if (cleanEndpoint === "/notifications/mark-read" && options.method === "PUT") {
        if (!token) {
          throw new ApiError({ status: 401, message: "Unauthenticated: Missing transmission token." });
        }
        const { id } = JSON.parse(options.body as string || "{}");
        let list = getMockNotifications();
        if (id) {
          list = list.map((n: any) => n.id === id ? { ...n, isRead: true } : n);
        } else {
          list = list.map((n: any) => ({ ...n, isRead: true }));
        }
        saveMockNotifications(list);
        return { success: true } as T;
      }

      // Mock Handler for Clearing All Notifications
      if (cleanEndpoint === "/notifications" && options.method === "DELETE") {
        if (!token) {
          throw new ApiError({ status: 401, message: "Unauthenticated: Missing transmission token." });
        }
        saveMockNotifications([]);
        return { success: true } as T;
      }

      // Mock Handler for Deleting a Single Notification
      if (cleanEndpoint.startsWith("/notifications/") && options.method === "DELETE") {
        if (!token) {
          throw new ApiError({ status: 401, message: "Unauthenticated: Missing transmission token." });
        }
        const id = cleanEndpoint.split("/").pop();
        let list = getMockNotifications();
        list = list.filter((n: any) => n.id !== id);
        saveMockNotifications(list);
        return { success: true } as T;
      }

      // Mock Handler for Bookmark toggle
      if (cleanEndpoint.startsWith("/posts/") && cleanEndpoint.endsWith("/bookmark") && options.method === "POST") {
        if (!token) {
          throw new ApiError({ status: 401, message: "Unauthenticated: Missing transmission token." });
        }
        const postId = cleanEndpoint.split("/")[2];
        const postsData = localStorage.getItem("aether_posts");
        let isBookmarked = false;
        if (postsData) {
          const posts = JSON.parse(postsData);
          const updated = posts.map((p: any) => {
            if (p.id === postId) {
              isBookmarked = !p.isBookmarked;
              return { ...p, isBookmarked };
            }
            return p;
          });
          localStorage.setItem("aether_posts", JSON.stringify(updated));
        }
        return { success: true, isBookmarked } as T;
      }

      // Mock Handler for GET /bookmarks
      if (cleanEndpoint === "/bookmarks" && options.method === "GET") {
        if (!token) {
          throw new ApiError({ status: 401, message: "Unauthenticated: Missing transmission token." });
        }
        const postsData = localStorage.getItem("aether_posts");
        const posts = postsData ? JSON.parse(postsData) : [];
        const bookmarked = posts.filter((p: any) => !!p.isBookmarked);
        return bookmarked as T;
      }

      throw new ApiError({ status: 404, message: `Mock route ${cleanEndpoint} not implemented.` });
    }

    // REAL HTTP FETCH FLOW
    const url = `${BASE_URL}${cleanEndpoint}`;
    const headers = new Headers(options.headers);
    
    headers.set("Content-Type", "application/json");
    const token = apiClient.getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, fetchOptions);
      const isJson = response.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        throw new ApiError({
          status: response.status,
          message: data?.message || response.statusText || "Transmission failed.",
          code: data?.code,
        });
      }

      return data as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError({
        status: 500,
        message: err instanceof Error ? err.message : "Node connection offline.",
      });
    }
  },

  get: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiClient.request<T>(endpoint, { ...options, method: "GET" });
  },

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> => {
    return apiClient.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> => {
    return apiClient.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiClient.request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
