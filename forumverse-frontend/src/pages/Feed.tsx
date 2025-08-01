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
import { mockTags } from '@/data/mockData'; 
import { Link } from 'react-router-dom';
import axios from '@/lib/axios';
import debounce from 'lodash/debounce';


export default function Feed() {
  const [searchQuery, setSearchQuery] = useState('');
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


  const debouncedSetSearch = useMemo(
  () => debounce((value: string) => {
    setSearchQuery(value);
  }, 500), []
);

useEffect(() => {
  if (posts.length === 0) {
    loadPosts(true);
  }
}, []);

useEffect(() => {
  if (page > 1) {
    loadPosts(false);
  }
}, [page]);



useEffect(() => {
  if (didMountRef.current) {
    setPage(1);
    setHasMore(true);
    setPosts([]); // reset
    loadPosts(true); // manually load first page
  } else {
    didMountRef.current = true;
  }
}, [searchQuery, selectedTags, sortBy]);

const previousFilters = useRef({
  searchQuery,
  selectedTags,
  sortBy,
});

useEffect(() => {
  const filtersChanged =
    previousFilters.current.searchQuery !== searchQuery ||
    previousFilters.current.sortBy !== sortBy ||
    JSON.stringify(previousFilters.current.selectedTags) !== JSON.stringify(selectedTags);

  if (didMountRef.current && filtersChanged) {
    previousFilters.current = { searchQuery, selectedTags, sortBy };
    setPage(1);
    setHasMore(true);
    setPosts([]);
    loadPosts(true);
  } else {
    didMountRef.current = true;
  }
}, [searchQuery, selectedTags, sortBy]);


const loadPosts = async (isInitial = false) => {
  if (loading) return;

  if (isInitial) {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }
  

  setLoading(true);

  try {
    const params = {
      page,
      limit,
      search: searchQuery.trim(),
      tags: selectedTags.map(t => t.tag.name).join(','),
      sort: sortBy,
    };

    const response = await fetchPosts(params, true);

    if (response.length < limit) {
      setHasMore(false);
    }
  } catch (err) {
    console.error(err);
  }

  setLoading(false);
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
                  defaultValue={searchQuery}
                  onChange={(e) => debouncedSetSearch(e.target.value)}
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
              {mockTags.slice(0, 15).map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.some(t => t.tag.name === tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Community Stats */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Posts</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Users</span>
                <span className="font-medium">892</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today's Posts</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Online Now</span>
                <span className="font-medium text-green-500">156</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">
                  <span className="font-medium">techguru42</span> posted in <span className="font-medium">React</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">
                  <span className="font-medium">designlover</span> commented on <span className="font-medium">Web Design</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-muted-foreground">
                  <span className="font-medium">codewarrior</span> started a discussion
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}