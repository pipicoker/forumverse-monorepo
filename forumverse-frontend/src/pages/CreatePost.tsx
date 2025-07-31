
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, Eye, Send } from 'lucide-react';
import { mockTags } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';

export default function CreatePost() {
  const {user} = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // const { profile: userProfile } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {createPost} = usePosts();

  const validateForm = () => {
    const newErrors: string[] = [];

    if (title.trim().length < 5) {
      newErrors.push('Title must be at least 10 characters long');
    }

    if (content.trim().length < 5) {
      newErrors.push('Content must be at least 50 characters long');
    }

    if (selectedTags.length === 0) {
      newErrors.push('Please select at least one tag');
    }

    return newErrors;
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleAddCustomTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim()) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsPublishing(true);

    try {
      await createPost({ title, content, tags: selectedTags });
      
      toast({
        title: "Post published!",
        description: "Your post has been published successfully.",
      });
      
      navigate('/feed');
    } catch (err) {
      setErrors(['Failed to publish post. Please try again.']);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your post has been saved as a draft.",
    });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
        <p className="text-muted-foreground">
          Share your knowledge and start a discussion with the community
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Write Your Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="What's your post about? Be specific and descriptive..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg"
                  />
                  <div className="text-xs text-muted-foreground">
                    {title.length}/100 characters
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Tabs defaultValue="write" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="preview">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="write">
                      <Textarea
                        id="content"
                        placeholder="Write your post content here... You can use Markdown formatting."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={15}
                        className="resize-none"
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className="border border-border rounded-md p-4 min-h-[300px] bg-muted/30">
                        {content ? (
                          <div className="prose prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-sm">
                              {content}
                            </pre>
                          </div>
                        ) : (
                          <div className="text-muted-foreground italic">
                            Start writing to see a preview...
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <div className="text-xs text-muted-foreground">
                    {content.length}/5000 characters • Supports Markdown
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Tags ({selectedTags.length}/5)</Label>
                  
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleTagRemove(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a custom tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                      disabled={selectedTags.length >= 5}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAddCustomTag}
                      disabled={!newTag.trim() || selectedTags.length >= 5}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Popular tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {mockTags.slice(0, 12).map(tag => (
                        <Badge 
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleTagSelect(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isPublishing} className="flex-1">
                    {isPublishing ? (
                      'Publishing...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Publish Post
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleSaveDraft}
                    disabled={isPublishing}
                  >
                    Save Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Writing Tips */}
          <Card className="animate-fade-in animate-delay-200">
            <CardHeader>
              <CardTitle className="text-lg">Writing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-1">Title</h4>
                <p className="text-muted-foreground">
                  Be specific and descriptive. Ask yourself: "What would I search for to find this?"
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Content</h4>
                <p className="text-muted-foreground">
                  Include context, examples, and what you've tried. The more details, the better the responses.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Tags</h4>
                <p className="text-muted-foreground">
                  Use relevant tags to help others find your post. Choose 1-5 tags that best describe your topic.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card className="animate-fade-in animate-delay-400">
            <CardHeader>
              <CardTitle className="text-lg">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Be respectful and constructive</p>
              <p>• Search before posting duplicates</p>
              <p>• Use clear, descriptive titles</p>
              <p>• Include relevant code examples</p>
              <p>• Tag appropriately</p>
              <p>• Follow up on responses</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
