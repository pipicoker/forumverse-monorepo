import { useContext } from 'react';
import { PostContext, PostContextType } from '@/contexts/PostContext';

export const usePosts = (): PostContextType => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};
