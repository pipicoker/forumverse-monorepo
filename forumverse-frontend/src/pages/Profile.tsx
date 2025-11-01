
import { useEffect, useState, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '@/lib/axios'
import socket from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/PostCard';
import { 
  User, 
  Calendar, 
  MessageSquare, 
  Trophy, 
  Edit,
  Settings,
  ArrowLeft,
  Star,
  BookOpen,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { EditProfileModal } from '@/components/EditProfileModal';


const Profile = memo(() => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  const { profile: profileUser , fetchProfile } = useUser();

  const [totalPostCount, setTotalPostCount] = useState(0);
  const [userPosts, setUserPosts] = useState([])
  const [postOffset, setPostOffset] = useState(0);
  const [postHasMore, setPostHasMore] = useState(true);
  const postLimit = 3;
  const [loadingProfile, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const [userComments, setUserComments] = useState([])
  const [commentOffset, setCommentOffset] = useState(0);
  const [commentHasMore, setCommentHasMore] = useState(true);
  const [totalCommentCount, setTotalCommentCount] = useState(0);
  const commentLimit = 3;

  const userSavedPosts = profileUser?.savedPosts || [];

  const isOwnProfile = currentUser?.id === id;

  const [showEditModal, setShowEditModal] = useState(false);

 const fetchUserPosts = async (offset = 0) => {
  try {
    setLoadingPosts(true);
    const res = await axios.get(`/user/${id}/posts`, {
      params: { limit: postLimit, offset },
    });

    const { posts, totalCount } = res.data;

    if (offset === 0) {
      setUserPosts(posts);
    } else {
      setUserPosts((prev) => [...prev, ...posts]);
    }
    setTotalPostCount(totalCount)

    setPostOffset(offset + postLimit);
    setPostHasMore(offset + postLimit < totalCount);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingPosts(false)
  }
};

const fetchUserComments = async (offset = 0) => {
  try {
    setLoadingComments(true)
    const res = await axios.get(`/user/${id}/comments`, {
      params: { limit: commentLimit, offset },
    });

    const { comments, totalCount } = res.data;

    if (offset === 0) {
      setUserComments(comments);
    } else {
      setUserComments((prev) => [...prev, ...comments]);
    }

    setTotalCommentCount(totalCount);
    setCommentOffset(offset + commentLimit);
    setCommentHasMore(offset + commentLimit < totalCount);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingComments(false)
  }
};


  useEffect(() => {
  if (!id) return;

  if (userPosts.length === 0 && !loadingPosts) {
    fetchUserPosts(0);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

useEffect(() => {
  if (profileUser && userComments.length === 0 && !loadingComments) {
    fetchUserComments();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [profileUser?.id]);



  useEffect(() => {
    if (id) {
      // Clear all state to avoid showing stale data when switching profiles
      setLoading(true);
      setUserPosts([]);
      setUserComments([]);
      setPostOffset(0);
      setCommentOffset(0);
      setPostHasMore(true);
      setCommentHasMore(true);
      setTotalPostCount(0);
      setTotalCommentCount(0);
      
      fetchProfile(id).finally(() => setLoading(false));
    }
  }, [id, fetchProfile]);

  if (!profileUser || loadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
         <div className="flex justify-center items-center h-[50vh]">
      <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin" />
    </div>
        <Link to="/feed">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
        </Link>
      </div>
    );
  }
  

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'moderator':
        return <Badge variant="secondary">Moderator</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };

  const getReputationLevel = (reputation: number) => {
    if (reputation >= 5000) return { level: 'Expert', color: 'text-yellow-500' };
    if (reputation >= 2000) return { level: 'Advanced', color: 'text-blue-500' };
    if (reputation >= 500) return { level: 'Intermediate', color: 'text-green-500' };
    return { level: 'Beginner', color: 'text-gray-500' };
  };

  const reputationLevel = getReputationLevel(profileUser.reputation);

  // const mockComments = [
  //   {
  //     id: '1',
  //     content: 'Great explanation! This really helped me understand the concept better.',
  //     postTitle: 'Building Modern React Applications with TypeScript',
  //     createdAt: '2024-01-15T10:30:00Z',
  //     upvotes: 12
  //   },
  //   {
  //     id: '2',
  //     content: 'I had a similar issue and solved it by using useCallback hook to memoize the function.',
  //     postTitle: 'React Performance Optimization Tips',
  //     createdAt: '2024-01-14T15:20:00Z',
  //     upvotes: 8
  //   },
  //   {
  //     id: '3',
  //     content: 'Thanks for sharing! Do you have any recommendations for TypeScript learning resources?',
  //     postTitle: 'Getting Started with TypeScript',
  //     createdAt: '2024-01-13T09:45:00Z',
  //     upvotes: 5
  //   }
  // ];

  // const mockSavedPosts = mockPosts.slice(0, 2);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/feed">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profileUser.avatar} alt={profileUser.username} />
                  <AvatarFallback className="text-2xl">
                    {profileUser.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold mb-2">{profileUser.username}</h1>
                
                {profileUser.bio && (
                  <p className="text-muted-foreground text-sm mb-3 max-w-sm text-center">
                    {profileUser.bio}
                  </p>
                )}
                
                <div className="flex items-center justify-center space-x-2 mb-3">
                  {getRoleBadge(profileUser.role)}
                  <Badge variant="outline" className={reputationLevel.color}>
                    {reputationLevel.level}
                  </Badge>
                </div>

                {isOwnProfile && (
                  <Button variant="outline" size="sm" className="mb-4" onClick={() => setShowEditModal(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
              <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
              />

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                   <span>
                    {profileUser.joinDate
                      ? `Joined ${formatDistanceToNow(new Date(profileUser.joinDate), { addSuffix: true })}`
                      : 'Joined date unknown'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{profileUser.reputation}</div>
                    <div className="text-xs text-muted-foreground">Reputation</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">{totalPostCount}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">{totalCommentCount}</div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">95%</div>
                    <div className="text-xs text-muted-foreground">Helpful Rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="mt-6 animate-fade-in animate-delay-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Top Contributor</p>
                    <p className="text-xs text-muted-foreground">Posted 100+ helpful answers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Great Communicator</p>
                    <p className="text-xs text-muted-foreground">Received 500+ upvotes on comments</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Early Adopter</p>
                    <p className="text-xs text-muted-foreground">Joined in the first month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Posts ({totalPostCount})</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Comments ({totalCommentCount})</span>
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger value="saved" className="flex items-center space-x-2">
                  <Star className="w-4 h-4" />
                  <span>Saved ({userSavedPosts.length})</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="posts" className="mt-6">
              <div className="space-y-4">
                {loadingPosts ? (
                   <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin" />
                  </div>
                ) : userPosts?.length === 0 ? (
                   <Card>
                    <CardContent className="py-12 text-center">
                      <BookOpen className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        {isOwnProfile ? "You haven't created any posts yet." : `${profileUser.username} has no posts.`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {userPosts.map((post, index) => (
                      <div key={index} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
                        <PostCard post={post} />
                      </div>
                    ))}

                    {postHasMore && (
                      <div className="text-center mt-4">
                        <Button onClick={() => fetchUserPosts(postOffset)} disabled={loadingPosts}>
                          {loadingPosts ? 'Loading...' : 'Load More'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>


            <TabsContent value="comments" className="mt-6">
              <div className="space-y-4">
                {loadingComments ? (
                   <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin" />
                  </div>
                ) : userComments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        {isOwnProfile ? "You haven't written any comments yet." : `${profileUser.username} has no comments.`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {userComments.map((comment, index) => (
                      <Card key={comment.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Commented on</span>
                              <Link to={`/post/${comment.post?.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                                {comment.post?.title}
                              </Link>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                              <span>•</span>
                              <span>{comment._count.votes} votes</span>
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed">{comment.content}</p>
                        </CardContent>
                      </Card>
                    ))}

                    {commentHasMore && (
                      <Button onClick={() => fetchUserComments(commentOffset)} disabled={loadingComments}>
                        {loadingComments ? 'Loading...' : 'Load More Comments'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </TabsContent>


            {isOwnProfile && (
              <TabsContent value="saved" className="mt-6">
                <div className="space-y-4">
                  {userSavedPosts.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">You haven't saved any posts yet.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    userSavedPosts.map((savedPost, index) => (
                      <div key={index} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
                        <PostCard post={savedPost.post} />
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
});

Profile.displayName = 'Profile';

export default Profile;
