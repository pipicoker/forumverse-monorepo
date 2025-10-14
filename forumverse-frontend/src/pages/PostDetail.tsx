
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronUp, 
  ChevronDown, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Flag,
  Reply,
  Edit,
  Pin,
  Lock,
  ArrowLeft,
  Trash,
} from 'lucide-react';
import { mockPosts, mockComments } from '@/data/mockData';
import { Comment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { ReportModal } from '@/components/ReportModal';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';

export default function PostDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const {profile: userProfile} = useUser();
  const { toast } = useToast();

  const [post, setPost] = useState(null)
  const [error, setError] = useState('');
  const {deletePost} = usePosts();

  const handleDeletePost = async () => {
  try {
     await deletePost(post.id); // ✅ use context
    toast({ title: 'Post deleted', description: 'The post has been successfully deleted.' });
    navigate('/feed'); // Redirect to feed
  } catch (err) {
    toast({
      title: 'Error',
      description: 'Failed to delete the post. Please try again.',
      variant: 'destructive',
    });
  }
};

const handleDeleteComment = async (commentId: string) => {
  try {
    await axios.delete(`/comments/${commentId}`);
    setComments(prev => prev.filter(c => c.id !== commentId));
    toast({
      title: 'Comment deleted',
      description: 'The comment has been removed.',
    });
  } catch (err) {
    toast({
      title: 'Error',
      description: 'Failed to delete the comment. Please try again.',
      variant: 'destructive',
    });
  }
};

  useEffect(() => {
    if (!id) return;

    axios.get(`/posts/${id}`)
       .then(res => {
        console.log('post fetched:', res.data);
        setPost(res.data);
        setIsBookmarked(res.data.isBookmarked); // ✅ set bookmark state here
      })

      .catch(err => {
        console.error('Failed to fetch post:', err);
        setError('Post not found');
      });
  }, [id]);

 useEffect(() => {
  if (!id) return;

  console.log('Fetching comments for postId:', id);

  axios.get(`/comments/${id}`)
    .then((res) => {
      console.log('Comments fetched:', res.data);

      // Filter top-level comments (those without parentId)
      const topLevelComments = res.data.filter((comment: Comment) => comment.parentId === null);

      setComments(topLevelComments);
    })
    .catch(err => console.error('Failed to fetch comments:', err));
}, [id]);


  

  const [comments, setComments] = useState<Comment[]>([]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [votes, setVotes] = useState({ upvotes: post?.upvotes || 0, downvotes: post?.downvotes || 0 });
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(null);
  const {bookmarkPost, unbookmarkPost, votePost} = usePosts();
  const [isBookmarked, setIsBookmarked] = useState(false);  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{type: 'post' | 'comment', id: string, title: string} | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState<string | null>(null);

  useEffect(() => {
  if (post) {
    setVotes({ upvotes: post.upvotes, downvotes: post.downvotes });
    setUserVote(post.userVote ?? null);
  }
}, [post]);

if (!post || !user) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Loading post...</h1>
      <p className="text-muted-foreground">Please wait while we fetch the post.</p>
       <div className="flex justify-center items-center h-[50vh]">
      <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin" />
    </div>
    </div>
  );
}


  const handleVote = async (voteType: 'UP' | 'DOWN') => {
    if (post.userVote === voteType) {
      await votePost(post.id, 'remove');
    } else {
      await votePost(post.id, voteType);
    }
    // Refetch post to update votes and userVote
  const res = await axios.get(`/posts/${post.id}`);
  setPost(res.data);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);

    try {
      const res = await axios.post(`/comments`, {
        content: newComment,
        postId: post.id,
      });
      
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      toast({
        title: "Comment posted",
        description: "Your comment has been added to the discussion.",
      });
    } catch (err) {
      console.error('Failed to post comment:', err);
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (parentId: string, content: string) => {
    if (!content.trim() || isSubmittingReply === parentId) return;

    setIsSubmittingReply(parentId);

    try {
      const res = await axios.post(`/comments`, {
        content,
        postId: post.id,
        parentId: parentId,
      });
      
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...comment.replies, res.data] }
          : comment
      ));
      
      toast({
        title: "Reply posted",
        description: "Your reply has been added.",
      });
    } catch (err) {
      console.error('Failed to post reply:', err);
      toast({
        title: "Error",
        description: "Failed to post your reply. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingReply(null);
    }
  };

  const handleReport = (type: 'post' | 'comment', id: string, title: string) => {
    setReportTarget({ type, id, title });
    setShowReportModal(true);
  };

  const CommentComponent = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => {
    const [commentVote, setCommentVote] = useState<'UP' | 'DOWN' | null>(comment.userVote ?? null);
  const [commentVotes, setCommentVotes] = useState({ 
    upvotes: comment.upvotes, 
    downvotes: comment.downvotes 
  });
  const [localReplyContent, setLocalReplyContent] = useState('');

  // Sync with prop changes
  useEffect(() => {
    setCommentVote(comment.userVote ?? null);
    setCommentVotes({ upvotes: comment.upvotes, downvotes: comment.downvotes });
  }, [comment]);

  const handleCommentVote = async (type: 'UP' | 'DOWN') => {
    if (commentVote === type) {
      await axios.post(`/comments/${comment.id}/vote`, { vote: 'remove' });
      setCommentVote(null);
      setCommentVotes(prev => ({
        ...prev,
        [type === 'UP' ? 'upvotes' : 'downvotes']:
          (prev[type === 'UP' ? 'upvotes' : 'downvotes'] ?? 0) - 1
      }));
    } else {
      const prevVote = commentVote;
      await axios.post(`/comments/${comment.id}/vote`, { vote: type });
      setCommentVote(type);
     setCommentVotes(prev => {
  const newVotes = { ...prev };
  if (prevVote) {
    newVotes[prevVote === 'UP' ? 'upvotes' : 'downvotes'] =
      (newVotes[prevVote === 'UP' ? 'upvotes' : 'downvotes'] ?? 0) - 1;
  }
  newVotes[type === 'UP' ? 'upvotes' : 'downvotes'] =
    (newVotes[type === 'UP' ? 'upvotes' : 'downvotes'] ?? 0) + 1;
  return newVotes;
});
    }
  };

    return (
      <div className={`${depth > 0 ? 'ml-8 border-l border-border pl-4' : ''}`}>
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatar} alt={comment.author.username} />
                  <AvatarFallback>{comment.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <Link 
                    to={`/profile/${comment.author.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {comment.author.username}
                  </Link>
                  {comment.author.role === 'admin' && (
                    <Badge variant="destructive" className="ml-2 text-xs">Admin</Badge>
                  )}
                  {comment.author.role === 'moderator' && (
                    <Badge variant="secondary" className="ml-2 text-xs">Mod</Badge>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleReport('comment', comment.id, `Comment by ${comment.author.username}`)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>

                {user?.id === comment.author.id && (
                  <DropdownMenuItem
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}

                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">
              {comment.content}
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Button variant={commentVote === 'UP' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCommentVote('UP')}
                className="h-8 px-2">
                👍 {commentVotes.upvotes}
              </Button>
              <Button variant={commentVote === 'DOWN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCommentVote('DOWN')}
                className="h-8 px-2">
                👎 {commentVotes.downvotes}
              </Button>
              </div>
              
             {user && depth === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="h-8"
                >
                  <Reply className="w-4 h-4 mr-1" />
                  Reply
                </Button>
              )}

            </div>
            
            {replyingTo === comment.id && user && (
              <div className="mt-4 space-y-2">
                <Textarea
                  placeholder="Write your reply..."
                  value={localReplyContent}
                  onChange={(e) => setLocalReplyContent(e.target.value)}
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      handleReplySubmit(comment.id, localReplyContent); 
                      setLocalReplyContent('');
                      setReplyingTo(null);
                    }}
                    disabled={!localReplyContent.trim() || isSubmittingReply === comment.id}
                  >
                    {isSubmittingReply === comment.id ? (
                      <>
                        <span className="mr-2 h-3 w-3 border-2 border-t-transparent border-white rounded-full animate-spin inline-block" />
                        Posting...
                      </>
                    ) : (
                      'Post Reply'
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setReplyingTo(null);
                      setLocalReplyContent('');
                    }}
                    disabled={isSubmittingReply === comment.id}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {comment.replies && comment.replies.map((reply) => (
          <CommentComponent key={reply.id} comment={reply} depth={depth + 1} />
        ))}

      </div>
    );
  };

  const score = votes.upvotes - votes.downvotes;

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/feed">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feed
            </Button>
          </Link>
        </div>

        {/* Post Content */}
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.avatar} alt={post.author.username} />
                  <AvatarFallback>{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Link 
                      to={`/profile/${post.author.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {post.author.username}
                    </Link>
                    {post.author.role === 'admin' && (
                      <Badge variant="destructive" className="text-xs">Admin</Badge>
                    )}
                    {post.author.role === 'moderator' && (
                      <Badge variant="secondary" className="text-xs">Mod</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    {post.createdAt !== post.updatedAt && ' (edited)'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {post.isSticky && <Pin className="w-4 h-4 text-primary" />}
                {post.isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      if (isBookmarked) {
                        unbookmarkPost(post.id);
                        setIsBookmarked(false);
                      } else {
                        bookmarkPost(post.id);
                        setIsBookmarked(true);
                      }
                    }}>
                      <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      {isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    {user?.id === post.author.id && (
                      <>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleDeletePost}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Post
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => handleReport('post', post.id, post.title)}>
                      <Flag className="mr-2 h-4 w-4" />
                      Report
                    </DropdownMenuItem>

                    

                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            
            <div className="prose prose-invert max-w-none mb-6">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {post.content}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tagObj, index) => (
                <Badge key={tagObj.tagId || index} variant="outline">
                  {tagObj.tag.name}
                </Badge>
              ))}

            </div>

            <Separator className="my-6" />

           <div className="flex items-center space-x-1">
          <Button
            variant={userVote === 'UP' ? 'default' : 'outline'}
            onClick={() => handleVote('UP')}
          >
            👍 {votes.upvotes}
          </Button>
          <Button
            variant={userVote === 'DOWN' ? 'default' : 'outline'}
            onClick={() => handleVote('DOWN')}
          >
            👎 {votes.downvotes}
          </Button>
        </div>
          </CardContent>
        </Card>

        {/* Comment Form */}
        {user && !post.isLocked && (
          <Card className="mb-6 animate-fade-in animate-delay-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Add your comment to the discussion..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Be respectful and constructive in your comments
                    </p>
                    <Button 
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      {isSubmittingComment ? (
                        <>
                          <span className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin inline-block" />
                          Posting...
                        </>
                      ) : (
                        'Post Comment'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {post.isLocked && (
          <Card className="mb-6 bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>This post has been locked. No new comments can be added.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Comments ({comments.length})
          </h2>
          
          {comments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No comments yet. Be the first to start the discussion!
                </p>
              </CardContent>
            </Card>
          ) : (
            comments.map((comment, index) => (
              <div key={comment.id} style={{ animationDelay: `${(index + 3) * 0.1}s` }} className="animate-fade-in">
                <CommentComponent comment={comment} />
              </div>
            ))
          )}
        </div>
      </div>

      {reportTarget && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setReportTarget(null);
          }}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          targetTitle={reportTarget.title}
        />
      )}
    </>
  );
}
