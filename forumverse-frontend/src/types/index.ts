
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  role: 'user' | 'moderator' | 'admin';
  bio?: string;
  joinDate: string;
  reputation: number;
}

export type Tag = {
  postId: string;
  tagId: string;
  tag: {
    id: string;
    name: string;
  };
};

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: User;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  upvotes: number;
  downvotes: number;
  isSticky?: boolean;
  isLocked?: boolean;
  isBookmarked?: boolean;
  userVote?: 'UP' | 'DOWN' | null;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  createdAt: string;
  replies: Comment[];
  upvotes: number;
  downvotes: number;
  userVote?: 'UP' | 'DOWN' | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface ReportReason {
  id: string;
  label: string;
  description: string;
}
