import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReportModal } from '@/components/ReportModal';
import { 
  MessageSquare, 
  ArrowUp, 
  ArrowDown, 
  Bookmark, 
  BookmarkCheck,
  Share2,
  Flag,
  Clock,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { Post } from '@/types';

// Lazy loading image component
const LazyImage = memo(({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy"
      />
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export const PostCard = memo(({ post, compact = false }: PostCardProps) => {
  const {deletePost} = usePosts();
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [localVotes, setLocalVotes] = useState({
    upvotes: post.upvotes,
    downvotes: post.downvotes
  });

  const { bookmarkPost, unbookmarkPost, votePost } = usePosts();
  const { user } = useAuth();

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) return;

    const newVote = userVote === voteType ? null : voteType;
    const oldVote = userVote;
    
    // Optimistic update
    setUserVote(newVote);
    setLocalVotes(prev => {
      let newUpvotes = prev.upvotes;
      let newDownvotes = prev.downvotes;
      
      // Remove old vote
      if (oldVote === 'up') newUpvotes--;
      if (oldVote === 'down') newDownvotes--;
      
      // Add new vote
      if (newVote === 'up') newUpvotes++;
      if (newVote === 'down') newDownvotes++;
      
      return { upvotes: newUpvotes, downvotes: newDownvotes };
    });

    try {
      await votePost(post.id, newVote ? newVote.toUpperCase() as 'UP' | 'DOWN' : 'remove');
    } catch (error) {
      // Revert on error
      setUserVote(oldVote);
      setLocalVotes({ upvotes: post.upvotes, downvotes: post.downvotes });
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    
    try {
      if (newBookmarkState) {
        await bookmarkPost(post.id);
      } else {
        await unbookmarkPost(post.id);
      }
    } catch (error) {
      setIsBookmarked(!newBookmarkState);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + '...',
          url: `/post/${post.id}`,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    }
  };

  const handleDelete = async () => {
  if (!user || user.id !== post.author.id) return;

  const confirmDelete = window.confirm('Are you sure you want to delete this post?');
  if (!confirmDelete) return;

  try {
    await deletePost(post.id);
    // Optionally: trigger re-fetch or remove from local state if you're caching
  } catch (error) {
    console.error('Failed to delete post:', error);
  }
};

  return (
    <Card className="hover:shadow-md transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.avatar} alt={post.author.username} />
              <AvatarFallback>
                {post.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <Link 
                to={`/profile/${post.author.id}`}
                className="font-medium hover:text-primary transition-colors text-sm"
              >
                {post.author.username}
              </Link>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReportModal(true)}
          >
            <Flag className="w-4 h-4" />
          </Button>

          {user?.id === post.author.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Link to={`/post/${post.id}`}>
            <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors cursor-pointer">
              {post.title}
            </h3>
          </Link>
          
          {!compact && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
              {post.content?.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {post.tags?.slice(0, compact ? 2 : 4).map((tag) => (
            <Badge key={tag.tag?.id || tag.tagId} variant="secondary" className="text-xs">
              {tag.tag?.name}
            </Badge>
          ))}
          {post.tags?.length > (compact ? 2 : 4) && (
            <Badge variant="outline" className="text-xs">
              +{post.tags.length - (compact ? 2 : 4)} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('up')}
                className={`p-1 h-8 ${userVote === 'up' ? 'text-green-600' : 'text-muted-foreground'}`}
              >
                <ArrowUp className="w-4 h-4" />
                <span className="ml-1 text-sm">{localVotes.upvotes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('down')}
                className={`p-1 h-8 ${userVote === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}
              >
                <ArrowDown className="w-4 h-4" />
                <span className="ml-1 text-sm">{localVotes.downvotes}</span>
              </Button>
            </div>

            <Link to={`/post/${post.id}`}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-1 h-8">
                <MessageSquare className="w-4 h-4" />
                <span className="ml-1 text-sm">{post.comments?.length || 0}</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground p-2 h-8"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`p-2 h-8 ${isBookmarked ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="post"
        targetId={post.id}
        targetTitle={post.title}
      />
    </Card>
  );
});

PostCard.displayName = 'PostCard';