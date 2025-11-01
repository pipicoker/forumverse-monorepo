import { useState, useMemo, useEffect, useRef } from 'react';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, TrendingUp, Clock, Plus } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { Link } from 'react-router-dom';
import axios from '@/lib/axios';
import debounce from 'lodash/debounce';


interface CommunityStats {
  totalPosts: number;
  totalUsers: number;
  todaysPosts: number;
  activeUsers: number;
  onlineNow: number;
}

interface PopularTag {
  id: string;
  name: string;
  _count: {
    posts: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'post' | 'comment';
  username: string;
  userId: string;
  action: string;
  target: string;
  postId: string;
  postTitle: string;
  createdAt: string;
}

export default function Feed() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<{ tag: { id: string; name: string } }[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');

  const {posts, fetchPosts, setPosts} = usePosts();
  const [page, setPage] = useState(1);
  const [limit] = useState(4);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const didMountRef = useRef(false);
  const isInitialLoad = loading && page === 1;
  const isLoadMore = loading && page > 1;

  // Stats state
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);


  const debouncedSetSearch = useMemo(
  () => debounce((value: string) => {
    setSearchQuery(value);
  }, 500), []
);

// Fetch stats functions
const fetchCommunityStats = async () => {
  try {
    console.log('Fetching community stats...');
    const response = await axios.get('/stats/community');
    console.log('Community stats response:', response.data);
    setCommunityStats(response.data);
  } catch (error) {
    console.error('Error fetching community stats:', error);
    // Set empty stats to stop loading spinner
    setCommunityStats({
      totalPosts: 0,
      totalUsers: 0,
      todaysPosts: 0,
      activeUsers: 0,
      onlineNow: 0
    });
  }
};

const fetchPopularTags = async () => {
  try {
    console.log('Fetching popular tags...');
    const response = await axios.get('/stats/popular-tags?limit=15');
    console.log('Popular tags response:', response.data);
    setPopularTags(response.data);
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    setPopularTags([]); // Set empty array to stop loading
  }
};

const fetchRecentActivity = async () => {
  try {
    console.log('Fetching recent activity...');
    const response = await axios.get('/stats/recent-activity?limit=5');
    console.log('Recent activity response:', response.data);
    setRecentActivity(response.data);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    setRecentActivity([]); // Set empty array to stop loading
  }
};

// Initial load - fetch posts
useEffect(() => {
  if (posts.length === 0 && !didMountRef.current) {
    didMountRef.current = true;
    loadPosts(1);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Always fetch stats on mount (separate from posts)
useEffect(() => {
  fetchCommunityStats();
  fetchPopularTags();
  fetchRecentActivity();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// When filters change, reset to page 1
useEffect(() => {
  if (didMountRef.current) {
    setPage(1);
    setHasMore(true);
    setPosts([]);
    loadPosts(1);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchQuery, selectedTags, sortBy]);

// When page changes (for load more), fetch that page
useEffect(() => {
  if (didMountRef.current && page > 1) {
    loadPosts(page);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [page]);


const loadPosts = async (pageToLoad: number) => {
  if (loading) return;

  setLoading(true);

  try {
    const params = {
      page: pageToLoad,
      limit,
      search: searchQuery.trim(),
      tags: selectedTags.map(t => t.tag.name).join(','),
      sort: sortBy,
    };

    const isAppend = pageToLoad > 1;
    const response = await fetchPosts(params, isAppend);

    if (response.length < limit) {
      setHasMore(false);
    }
  } catch (err) {
    console.error('Error loading posts:', err);
  } finally {
    setLoading(false);
  }
};


// Call this manually when you want to load next page
const handleLoadMore = () => {
  if (!loading && hasMore) {
    setPage(prev => prev + 1);
  }
};

  

  const filteredAndSortedPosts = posts;


  const toggleTag = (tagName: string) => {
    const tagObj = { tag: { id: tagName, name: tagName } };
    setSelectedTags(prev => 
      prev.some(t => t.tag.name === tagName)
        ? prev.filter(t => t.tag.name !== tagName)
        : [...prev, tagObj]
    );
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case 'popular':
        return <TrendingUp className="w-4 h-4" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Community Feed</h1>
              <p className="text-muted-foreground">
                Discover the latest discussions and trending topics
              </p>
            </div>
            <Link to="/create">
              <Button className="mt-4 sm:mt-0">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search posts, users, or topics..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    debouncedSetSearch(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value: 'newest' | 'popular' | 'trending') => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <div className="flex items-center space-x-2">
                    {getSortIcon()}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Newest</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="trending">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Trending</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {selectedTags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <Badge 
                      key={tag.tag.id} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => toggleTag(tag.tag.name)}
                    >
                      {tag.tag.name} ×
                    </Badge>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTags([])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

         {/* Posts */}
        <div className="space-y-4">
          {loading && filteredAndSortedPosts.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin" />
            </div>
          ) : filteredAndSortedPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                No posts found matching your criteria
              </div>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSearchInput('');
                setSelectedTags([]);
                setPage(1);
              }}>
                Clear filters
              </Button>
            </div>
          ) : (
            filteredAndSortedPosts.map((post, index) => (
              <div key={post.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <PostCard post={post} />
              </div>
            ))
          )}
        </div>


         {hasMore && (
          <div className="text-center mt-6">
            <Button onClick={handleLoadMore} disabled={loading}>
              {isLoadMore ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}


        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Popular Tags */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.length > 0 ? (
                popularTags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.some(t => t.tag.name === tag.name) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => toggleTag(tag.name)}
                  >
                    {tag.name} <span className="ml-1 text-xs opacity-70">({tag._count.posts})</span>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tags yet</p>
              )}
            </div>
          </div>

          {/* Community Stats */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Community Stats</h3>
            {communityStats ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-medium">{communityStats.totalPosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="font-medium">{communityStats.activeUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Today's Posts</span>
                  <span className="font-medium">{communityStats.todaysPosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Users</span>
                  <span className="font-medium">{communityStats.totalUsers.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-t-transparent border-primary rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3 text-sm">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center space-x-2 group"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      index % 3 === 0 ? 'bg-green-500' : 
                      index % 3 === 1 ? 'bg-blue-500' : 
                      'bg-purple-500'
                    }`}></div>
                    <span className="text-muted-foreground">
                      <Link 
                        to={`/profile/${activity.userId}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {activity.username}
                      </Link>
                      {' '}{activity.action}{' '}
                      <Link
                        to={`/post/${activity.postId}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {activity.target}
                      </Link>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-t-transparent border-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}