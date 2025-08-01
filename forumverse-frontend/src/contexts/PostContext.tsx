import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { set } from 'date-fns';
import socket from '@/lib/socket';
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: {
    id: string;
    username: string;
    avatar: string;
    role: 'user' | 'moderator' | 'admin';
    joinDate: string;
    reputation: number;
  };
  upvotes: number;
  downvotes: number;
  votes: {
    id: string;
    type: 'UP' | 'DOWN';
    userId: string;
  }[];
  isBookmarked: boolean;
  comments: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
      avatar: string;
      role: 'user' | 'moderator' | 'admin';
      joinDate: string;
      reputation: number;
    };
    postId: string;
    parentId?: string;
    createdAt: string;
    replies: [];
    upvotes: number;
    downvotes: number;
    userVote?: 'UP' | 'DOWN' | null;
  }[];
  tags: { postId: string; tagId: string; tag: { id: string; name: string } }[];
  createdAt: string;
  updatedAt: string;
  _count: {
    comments: number;
    votes: number;
  };
  topLevelCommentCount?: number;
  userVote?: 'UP' | 'DOWN' | null;
}

export interface PostContextType {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  fetchPosts: (params?: any, append?: boolean) => Promise<Post[]>;
  createPost: (data: { title: string; content: string; tags: string[] }) => Promise<void>;
  bookmarkPost: (id: string) => Promise<void>;
  unbookmarkPost: (id: string) => Promise<void>;
  votePost: (id: string, vote: 'UP' | 'DOWN' | 'remove') => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}

export const PostContext = createContext<PostContextType | undefined>(undefined);


export const PostProvider = ({ children }: { children: React.ReactNode }) => {  
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

 const fetchPosts = async (params: any = {}, append = false) => {
    const response = await axios.get('/posts', { params });
    const fetched = response.data;

   setPosts(prev => {
  const updated = fetched.map(newPost => {
  const existing = prev.find(p => p.id === newPost.id);
  return existing
    ? {
        ...existing,
        ...newPost,
        topLevelCommentCount: newPost.topLevelCommentCount ?? existing.topLevelCommentCount ?? 0,
      }
    : {
        ...newPost,
        topLevelCommentCount: newPost.topLevelCommentCount ?? 0,
      };
});

  // Only add posts that are truly new
  const newPosts = fetched.filter(p => !prev.some(existing => existing.id === p.id));

  return append ? [...prev.filter(p => !fetched.some(fp => fp.id === p.id)), ...updated] : fetched;
});


    return fetched;
  };

  const createPost = async (data: { title: string; content: string; tags: string[] }) => {
    await axios.post('/posts', data);
    await fetchPosts();
  };

  const bookmarkPost = async (id: string) => {
    await axios.post(`/posts/${id}/bookmark`);

     // Update the post's isBookmarked status in global state
    setPosts(prev =>
          prev.map(p =>
            p.id === id ? { ...p, isBookmarked: true } : p
          )
        );
  };

  const unbookmarkPost = async (id: string) => {
    await axios.delete(`/posts/${id}/bookmark`);
    // Update the post's isBookmarked status in global state
    setPosts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isBookmarked: false } : p
      )
    );
  }

  // voting functionality
const votePost = async (id: string, vote: 'UP' | 'DOWN' | 'remove') => {
  try {
    await axios.post(`/posts/${id}/vote`, { vote });

    setPosts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;

        let upvotes = p.upvotes;
        let downvotes = p.downvotes;
        let userVote: 'UP' | 'DOWN' | null = p.userVote ?? null;

        if (vote === 'remove') {
          if (userVote === 'UP') upvotes = upvotes - 1;
          if (userVote === 'DOWN') downvotes = downvotes - 1;
          userVote = null;
        } else {
          if (userVote === 'UP') upvotes = upvotes - 1;
          if (userVote === 'DOWN') downvotes = downvotes - 1;
          if (vote === 'UP') upvotes = upvotes + 1;
          if (vote === 'DOWN') downvotes = downvotes + 1;
          userVote = vote;
        }

        return { ...p, upvotes, downvotes, userVote };
      })
    );
  } catch (error) {
    console.error('Error voting on post:', error);
  }
};

  const deletePost = async (id: string) => {
    await axios.delete(`/posts/${id}`);
    await fetchPosts();
    setPosts(prev => prev.filter(post => post.id !== id));
    
  };

  // Listen for post  events from the socket
    useEffect(() => {
     socket.on('postDeleted', ({ postId }) => {
    console.log('Socket postDeleted received:', postId);
    setPosts(prev => prev.filter(post => post.id !== postId));
  });
    socket.on('postCreated', (newPost: Post) => {
      setPosts(prev => [newPost, ...prev]);
    });

    return () => {
      socket.off('postDeleted');
      socket.off('postCreated');
    };
  }, []);

 useEffect(() => {
  if (isAuthenticated) {
    fetchPosts();
  }

const handleVoteUpdate = (updatedPost: Post) => {
  console.log('postVoted socket update received:', updatedPost);
  setPosts(prev =>
    prev.map(p => {
      if (p.id !== updatedPost.id) return p;
      
      return {
        ...updatedPost,
        userVote: p.userVote ?? null // preserve user's local vote
      };
    })
  );
};





  socket.on('postVoted', handleVoteUpdate);
  socket.on('postUnvoted', handleVoteUpdate);

  return () => {
    socket.off('postVoted', handleVoteUpdate);
    socket.off('postUnvoted', handleVoteUpdate);
  };
}, [isAuthenticated]);

  

  return (
    <PostContext.Provider
      value={{ posts, setPosts, fetchPosts, createPost, bookmarkPost, votePost, deletePost, unbookmarkPost }}
    >
      {children}
    </PostContext.Provider>
  );
};

