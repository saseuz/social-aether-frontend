import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";
import { apiClient } from "../services/apiClient";


export interface Comment {
  id: string;
  authorName: string;
  authorHandle: string;
  avatarText: string;
  content: string;
  timestamp: string;
  replies?: Comment[];
}

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
  commentsList?: Comment[];
  isRetransmission?: boolean;
  repostedBy?: string;
  originalPostId?: string;
  isBookmarked?: boolean;
  mediaUrl?: string;
  alignment?: string;
}

interface PostContextType {
  posts: Post[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  handlePublishPost: (text: string, mediaUrl?: string, alignment?: string) => void;
  handleLike: (id: string) => void;
  handleRepost: (id: string) => void;
  handleAddComment: (postId: string, text: string) => void;
  handleAddCommentReply: (postId: string, commentId: string, text: string) => void;
  handleToggleBookmark: (id: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const IS_MOCK_MODE = !import.meta.env.VITE_API_BASE_URL;

const SEED_POSTS: Post[] = [
  {
    id: "1",
    authorName: "Astro Coder",
    authorHandle: "@astro_coder",
    avatarText: "AC",
    content: "Just configured the solar sails on the React 19 compiler. The latency overhead across interstellar relays has dropped by exactly 42ms. Absolute magic. #reactCompiler #quantumComputing 🚀☄️",
    timestamp: "18m ago",
    likes: 124,
    reposts: 18,
    comments: 3,
    isLiked: true,
    isBookmarked: true,
    commentsList: [
      {
        id: "c1-1",
        authorName: "Tech Maven",
        authorHandle: "@tech_maven",
        avatarText: "TM",
        content: "Insane optimization! Did you run it on the Vercel edge runtime too?",
        timestamp: "12m ago",
        replies: [
          {
            id: "r1",
            authorName: "Astro Coder",
            authorHandle: "@astro_coder",
            avatarText: "AC",
            content: "Yes! Deployed edge function cold start dropped to 0ms. Insane speed.",
            timestamp: "10m ago"
          }
        ]
      },
      {
        id: "c1-2",
        authorName: "Lovelace Node",
        authorHandle: "@lovelace",
        avatarText: "LN",
        content: "42ms is huge for deep space routing. Excellent work.",
        timestamp: "8m ago",
        replies: []
      }
    ]
  },
  {
    id: "2",
    authorName: "Minimalist Lab",
    authorHandle: "@minimalist_lab",
    avatarText: "ML",
    content: "Visual clarity is not about what you add; it is about what you leave behind. Every rule, every pixel, every font weight must justify its presence. Build light. Breathe deep. #minimalistDesign #ambientWeb",
    timestamp: "2h ago",
    likes: 512,
    reposts: 92,
    comments: 1,
    commentsList: [
      {
        id: "c2-1",
        authorName: "Astro Coder",
        authorHandle: "@astro_coder",
        avatarText: "AC",
        content: "Couldn't agree more. Less code, fewer renders, clearer mind.",
        timestamp: "1h ago",
        replies: []
      }
    ]
  },
  {
    id: "3",
    authorName: "Aether Protocol",
    authorHandle: "@aether_net",
    avatarText: "AP",
    content: "Welcome to Aether. A premium, glassmorphic space designed for deep content and micro-transmissions. Our nodes are synchronized, and the solar winds are favorable. Synthesize your first message above. #vite8Release #ambientWeb",
    timestamp: "1d ago",
    likes: 1024,
    reposts: 420,
    comments: 1,
    commentsList: [
      {
        id: "c3-1",
        authorName: "Minimalist Lab",
        authorHandle: "@minimalist_lab",
        avatarText: "ML",
        content: "The glassmorphism looks absolutely stunning. The performance is very responsive.",
        timestamp: "18h ago",
        replies: []
      }
    ]
  }
];

export function PostProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addMockNotification } = useNotifications();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Fetch posts helper
  const fetchPosts = async () => {
    try {
      const data = await apiClient.get<Post[]>("/posts");
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts from API:", err);
    }
  };

  // Initial load
  useEffect(() => {
    if (IS_MOCK_MODE) {
      const local = localStorage.getItem("aether_posts");
      Promise.resolve().then(() => {
        setPosts(local ? JSON.parse(local) : SEED_POSTS);
      });
    } else {
      if (user) {
        Promise.resolve().then(() => {
          fetchPosts();
        });
      }
    }
  }, [user]);

  // Sync back to local storage (only in mock mode)
  useEffect(() => {
    if (IS_MOCK_MODE && posts.length > 0) {
      localStorage.setItem("aether_posts", JSON.stringify(posts));
    }
  }, [posts]);

  // Keep author names in sync with the user's updated profile info (only in mock mode)
  useEffect(() => {
    if (IS_MOCK_MODE && user) {
      Promise.resolve().then(() => {
        setPosts(prevPosts =>
          prevPosts.map(post => {
            const userCleanHandle = user.username.startsWith("@") ? user.username : `@${user.username}`;
            const isUserPost = post.authorHandle === userCleanHandle || (post.authorHandle === "@zypp_pilot" && userCleanHandle === "@zypp_pilot");
            if (isUserPost) {
              return {
                ...post,
                authorName: user.displayName,
                authorHandle: userCleanHandle,
                avatarText: user.avatarText
              };
            }
            return post;
          })
        );
      });
    }
  }, [user]);

  const handlePublishPost = async (text: string, mediaUrl?: string, alignment?: string) => {
    if (IS_MOCK_MODE) {
      const newPost: Post = {
        id: Date.now().toString(),
        authorName: user?.displayName || "Aether Pilot",
        authorHandle: user?.username || "@zypp_pilot",
        avatarText: user?.avatarText || "Æ",
        content: text,
        timestamp: "Just now",
        likes: 0,
        reposts: 0,
        comments: 0,
        commentsList: [],
        mediaUrl,
        alignment
      };
      setPosts([newPost, ...posts]);

      // Simulated social loop interactions
      setTimeout(() => {
        setPosts(prev => 
          prev.map(post => 
            post.id === newPost.id 
              ? { ...post, likes: post.likes + 1 } 
              : post
          )
        );
        addMockNotification({
          type: "like",
          senderName: "Astro Coder",
          senderHandle: "@astro_coder",
          senderAvatarText: "AC",
          postId: newPost.id,
          postContent: text.length > 60 ? text.substring(0, 60) + "..." : text,
          timestamp: "Just now"
        });
      }, 4000);

      setTimeout(() => {
        const mockComment = {
          id: `c-sim-${Date.now()}`,
          authorName: "Minimalist Lab",
          authorHandle: "@minimalist_lab",
          avatarText: "ML",
          content: "A beautiful transmission. The signals align perfectly.",
          timestamp: "Just now",
          replies: []
        };
        setPosts(prev => 
          prev.map(post => 
            post.id === newPost.id 
              ? { ...post, comments: post.comments + 1, commentsList: [...(post.commentsList || []), mockComment] } 
              : post
          )
        );
        addMockNotification({
          type: "comment",
          senderName: "Minimalist Lab",
          senderHandle: "@minimalist_lab",
          senderAvatarText: "ML",
          postId: newPost.id,
          postContent: text.length > 60 ? text.substring(0, 60) + "..." : text,
          commentId: mockComment.id,
          commentContent: mockComment.content,
          timestamp: "Just now"
        });
      }, 8000);
    } else {
      try {
        const response = await apiClient.post<Post>("/posts", {
          content: text,
          media_url: mediaUrl,
          alignment: alignment
        });
        setPosts(prev => [response, ...prev]);
      } catch (err) {
        console.error("Failed to publish post to API:", err);
      }
    }
  };

  const handleLike = async (id: string) => {
    if (IS_MOCK_MODE) {
      setPosts(prev => {
        const targetPost = prev.find(p => p.id === id);
        if (!targetPost) return prev;
        
        const targetId = targetPost.isRetransmission && targetPost.originalPostId
          ? targetPost.originalPostId
          : id;
          
        const isCurrentlyLiked = !!targetPost.isLiked;
        
        return prev.map(post => {
          const isTargetOrCopy = post.id === targetId || (post.isRetransmission && post.originalPostId === targetId);
          if (isTargetOrCopy) {
            return {
              ...post,
              likes: isCurrentlyLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
              isLiked: !isCurrentlyLiked
            };
          }
          return post;
        });
      });
    } else {
      try {
        const response = await apiClient.post<{ success: boolean; isLiked: boolean; likesCount: number }>(`/posts/${id}/like`);
        setPosts(prev =>
          prev.map(post => {
            if (post.id === id) {
              return {
                ...post,
                likes: response.likesCount,
                isLiked: response.isLiked
              };
            }
            return post;
          })
        );
      } catch (err) {
        console.error("Failed to like post via API:", err);
      }
    }
  };

  const handleRepost = async (id: string) => {
    if (IS_MOCK_MODE) {
      const userCleanHandle = user?.username.startsWith("@") ? user.username : `@${user?.username || "zypp_pilot"}`;
      
      setPosts(prev => {
        const targetPost = prev.find(p => p.id === id);
        if (!targetPost) return prev;
        
        const targetId = targetPost.isRetransmission && targetPost.originalPostId
          ? targetPost.originalPostId
          : id;
          
        const originalPost = prev.find(p => p.id === targetId);
        if (!originalPost) return prev;
        
        const isAlreadyReposted = originalPost.isReposted;
        
        if (isAlreadyReposted) {
          const updated = prev.map(post => {
            if (post.id === targetId) {
              return {
                ...post,
                reposts: Math.max(0, post.reposts - 1),
                isReposted: false
              };
            }
            if (post.isRetransmission && post.originalPostId === targetId) {
              return {
                ...post,
                reposts: Math.max(0, post.reposts - 1),
                isReposted: false
              };
            }
            return post;
          });
          
          return updated.filter(post => 
            !(post.isRetransmission && post.originalPostId === targetId && post.repostedBy?.toLowerCase() === userCleanHandle.toLowerCase())
          );
        } else {
          const updated = prev.map(post => {
            if (post.id === targetId) {
              return {
                ...post,
                reposts: post.reposts + 1,
                isReposted: true
              };
            }
            if (post.isRetransmission && post.originalPostId === targetId) {
              return {
                ...post,
                reposts: post.reposts + 1,
                isReposted: true
              };
            }
            return post;
          });
          
          const retransmissionPost: Post = {
            id: `repost-${targetId}-${Date.now()}`,
            authorName: originalPost.authorName,
            authorHandle: originalPost.authorHandle,
            avatarText: originalPost.avatarText,
            content: originalPost.content,
            timestamp: "Just now",
            likes: originalPost.likes,
            reposts: originalPost.reposts + 1,
            comments: originalPost.comments,
            commentsList: originalPost.commentsList || [],
            isLiked: originalPost.isLiked,
            isReposted: true,
            isRetransmission: true,
            repostedBy: userCleanHandle,
            originalPostId: targetId
          };
          
          return [retransmissionPost, ...updated];
        }
      });
    } else {
      try {
        await apiClient.post<{ success: boolean; isReposted: boolean; repostsCount: number }>(`/posts/${id}/repost`);
        await fetchPosts();
      } catch (err) {
        console.error("Failed to repost via API:", err);
      }
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!text.trim()) return;
    
    if (IS_MOCK_MODE) {
      const newComment: Comment = {
        id: Date.now().toString(),
        authorName: user?.displayName || "Aether Pilot",
        authorHandle: user?.username || "@zypp_pilot",
        avatarText: user?.avatarText || "Æ",
        content: text,
        timestamp: "Just now",
        replies: []
      };

      setPosts(prev => {
        const targetPost = prev.find(p => p.id === postId);
        if (!targetPost) return prev;
        
        const targetId = targetPost.isRetransmission && targetPost.originalPostId
          ? targetPost.originalPostId
          : postId;
          
        return prev.map(post => {
          const isTargetOrCopy = post.id === targetId || (post.isRetransmission && post.originalPostId === targetId);
          if (isTargetOrCopy) {
            const list = post.commentsList || [];
            return {
              ...post,
              comments: post.comments + 1,
              commentsList: [...list, newComment]
            };
          }
          return post;
        });
      });
    } else {
      try {
        const newComment = await apiClient.post<Comment>("/comments", {
          post_id: parseInt(postId),
          content: text
        });
        setPosts(prev =>
          prev.map(post => {
            if (post.id === postId) {
              const list = post.commentsList || [];
              return {
                ...post,
                comments: post.comments + 1,
                commentsList: [...list, newComment]
              };
            }
            return post;
          })
        );
      } catch (err) {
        console.error("Failed to add comment via API:", err);
      }
    }
  };

  const handleAddCommentReply = async (postId: string, commentId: string, text: string) => {
    if (!text.trim()) return;
    
    if (IS_MOCK_MODE) {
      const newReply: Comment = {
        id: Date.now().toString(),
        authorName: user?.displayName || "Aether Pilot",
        authorHandle: user?.username || "@zypp_pilot",
        avatarText: user?.avatarText || "Æ",
        content: text,
        timestamp: "Just now"
      };

      setPosts(prev => {
        const targetPost = prev.find(p => p.id === postId);
        if (!targetPost) return prev;
        
        const targetId = targetPost.isRetransmission && targetPost.originalPostId
          ? targetPost.originalPostId
          : postId;
          
        return prev.map(post => {
          const isTargetOrCopy = post.id === targetId || (post.isRetransmission && post.originalPostId === targetId);
          if (isTargetOrCopy) {
            const updatedComments = (post.commentsList || []).map(comment => {
              if (comment.id === commentId) {
                const repliesList = comment.replies || [];
                return {
                  ...comment,
                  replies: [...repliesList, newReply]
                };
              }
              return comment;
            });
            return {
              ...post,
              comments: post.comments + 1,
              commentsList: updatedComments
            };
          }
          return post;
        });
      });
    } else {
      try {
        const newReply = await apiClient.post<Comment>("/comments", {
          post_id: parseInt(postId),
          parent_id: parseInt(commentId),
          content: text
        });
        setPosts(prev =>
          prev.map(post => {
            if (post.id === postId) {
              const updatedComments = (post.commentsList || []).map(comment => {
                if (comment.id === commentId) {
                  const repliesList = comment.replies || [];
                  return {
                    ...comment,
                    replies: [...repliesList, newReply]
                  };
                }
                return comment;
              });
              return {
                ...post,
                comments: post.comments + 1,
                commentsList: updatedComments
              };
            }
            return post;
          })
        );
      } catch (err) {
        console.error("Failed to add comment reply via API:", err);
      }
    }
  };

  const handleToggleBookmark = async (id: string) => {
    if (IS_MOCK_MODE) {
      setPosts(prev => {
        const targetPost = prev.find(p => p.id === id);
        if (!targetPost) return prev;
        
        const targetId = targetPost.isRetransmission && targetPost.originalPostId
          ? targetPost.originalPostId
          : id;
          
        const isCurrentlyBookmarked = !!targetPost.isBookmarked;

        apiClient.post(`/posts/${targetId}/bookmark`).catch(err => {
          console.error("Failed to sync bookmark to mock API:", err);
        });

        return prev.map(post => {
          const isTargetOrCopy = post.id === targetId || (post.isRetransmission && post.originalPostId === targetId);
          if (isTargetOrCopy) {
            return {
              ...post,
              isBookmarked: !isCurrentlyBookmarked
            };
          }
          return post;
        });
      });
    } else {
      try {
        const response = await apiClient.post<{ success: boolean; isBookmarked: boolean }>(`/posts/${id}/bookmark`);
        setPosts(prev =>
          prev.map(post => {
            if (post.id === id) {
              return {
                ...post,
                isBookmarked: response.isBookmarked
              };
            }
            return post;
          })
        );
      } catch (err) {
        console.error("Failed to toggle bookmark via API:", err);
      }
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        selectedTag,
        setSelectedTag,
        handlePublishPost,
        handleLike,
        handleRepost,
        handleAddComment,
        handleAddCommentReply,
        handleToggleBookmark
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostProvider");
  }
  return context;
}
