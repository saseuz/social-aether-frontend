import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

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
}

interface PostContextType {
  posts: Post[];
  handlePublishPost: (text: string) => void;
  handleLike: (id: string) => void;
  handleRepost: (id: string) => void;
  handleAddComment: (postId: string, text: string) => void;
  handleAddCommentReply: (postId: string, commentId: string, text: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const SEED_POSTS: Post[] = [
  {
    id: "1",
    authorName: "Astro Coder",
    authorHandle: "@astro_coder",
    avatarText: "AC",
    content: "Just configured the solar sails on the React 19 compiler. The latency overhead across interstellar relays has dropped by exactly 42ms. Absolute magic. 🚀☄️",
    timestamp: "18m ago",
    likes: 124,
    reposts: 18,
    comments: 3,
    isLiked: true,
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
    content: "Visual clarity is not about what you add; it is about what you leave behind. Every rule, every pixel, every font weight must justify its presence. Build light. Breathe deep.",
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
    content: "Welcome to Aether. A premium, glassmorphic space designed for deep content and micro-transmissions. Our nodes are synchronized, and the solar winds are favorable. Synthesize your first message above.",
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
  const [posts, setPosts] = useState<Post[]>(() => {
    const local = localStorage.getItem("aether_posts");
    return local ? JSON.parse(local) : SEED_POSTS;
  });

  useEffect(() => {
    localStorage.setItem("aether_posts", JSON.stringify(posts));
  }, [posts]);

  // Keep author names in sync with the user's updated profile info
  useEffect(() => {
    if (user) {
      setPosts(prevPosts =>
        prevPosts.map(post => {
          // If the post was created by the logged-in user (match by user's ID or hardcoded system handle), update details
          // We can match by a tag or authorHandle since we mock the pilot profile
          const userCleanHandle = user.username.startsWith("@") ? user.username : `@${user.username}`;
          
          // Let's check if the post is by the current logged-in user
          // Note: In register / initial load, user might be "zypp_pilot" or something new.
          // We can check if authorHandle matches the current user's username or if they are both the pilot
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
    }
  }, [user]);

  const handlePublishPost = (text: string) => {
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
      commentsList: []
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (id: string) => {
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
  };

  const handleRepost = (id: string) => {
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
        // Toggle off
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
        // Toggle on
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
  };

  const handleAddComment = (postId: string, text: string) => {
    if (!text.trim()) return;
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
  };

  const handleAddCommentReply = (postId: string, commentId: string, text: string) => {
    if (!text.trim()) return;
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
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        handlePublishPost,
        handleLike,
        handleRepost,
        handleAddComment,
        handleAddCommentReply
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostProvider");
  }
  return context;
}
