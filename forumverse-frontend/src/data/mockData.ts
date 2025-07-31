
import { User, Post, Comment, ReportReason } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'techguru42',
    email: 'tech@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    role: 'admin',
    bio: 'Full-stack developer with 10+ years of experience in modern web technologies',
    joinDate: '2023-01-15',
    reputation: 2847,
  },
  {
    id: '2',
    username: 'designlover',
    email: 'design@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a6fd32?w=100&h=100&fit=crop&crop=face',
    role: 'moderator',
    bio: 'UI/UX designer passionate about creating beautiful and accessible digital experiences',
    joinDate: '2023-03-22',
    reputation: 1653,
  },
  {
    id: '3',
    username: 'codewarrior',
    email: 'code@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    role: 'user',
    bio: 'Backend developer specializing in Node.js, Python, and cloud architecture',
    joinDate: '2023-06-10',
    reputation: 892,
  },
  {
    id: '4',
    username: 'pixelartist',
    email: 'pixel@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    role: 'user',
    bio: 'Creative developer exploring the intersection of art and technology',
    joinDate: '2023-08-05',
    reputation: 543,
  },
];

export const mockComments: Comment[] = [
  {
    id: '1',
    content: 'Great post! This really helped me understand the concept better.',
    author: mockUsers[1],
    postId: '1',
    createdAt: '2024-01-15T10:30:00Z',
    replies: [
      {
        id: '2',
        content: 'I agree! The examples were particularly helpful.',
        author: mockUsers[2],
        postId: '1',
        parentId: '1',
        createdAt: '2024-01-15T11:15:00Z',
        replies: [],
        upvotes: 8,
        downvotes: 0,
      }
    ],
    upvotes: 23,
    downvotes: 1,
  },
  {
    id: '3',
    content: 'Has anyone tried implementing this in a production environment?',
    author: mockUsers[3],
    postId: '1',
    createdAt: '2024-01-15T14:20:00Z',
    replies: [],
    upvotes: 12,
    downvotes: 0,
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Building Modern React Applications with TypeScript',
    content: `# Building Modern React Applications with TypeScript

React and TypeScript have become the gold standard for building robust, scalable web applications. In this comprehensive guide, we'll explore best practices, patterns, and techniques for creating modern React applications.

## Why TypeScript?

TypeScript brings static typing to JavaScript, which provides several benefits:

- **Better Developer Experience**: Enhanced IDE support with autocomplete, refactoring, and error detection
- **Catch Errors Early**: Type checking at compile time prevents runtime errors
- **Self-Documenting Code**: Types serve as inline documentation
- **Better Refactoring**: Large codebases become easier to maintain

## Key Concepts

### 1. Component Props

\`\`\`typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', onClick }) => {
  return (
    <button 
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
\`\`\`

### 2. State Management

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const [user, setUser] = useState<User | null>(null);
\`\`\`

This approach ensures type safety throughout your application while maintaining the flexibility and power of React.`,
    excerpt: 'Learn how to build robust, scalable React applications using TypeScript. This guide covers best practices, patterns, and real-world examples.',
    author: mockUsers[0],
    tags: [
      { postId: '1', tagId: '1', tag: { id: '1', name: 'React' } },
      { postId: '1', tagId: '2', tag: { id: '2', name: 'TypeScript' } },
      { postId: '1', tagId: '3', tag: { id: '3', name: 'Frontend' } },
      { postId: '1', tagId: '4', tag: { id: '4', name: 'JavaScript' } }
    ],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    comments: mockComments,
    upvotes: 124,
    downvotes: 3,
    isSticky: true,
    isBookmarked: false,
    userVote: null,
  },
  {
    id: '2',
    title: 'The Future of Web Design: Trends to Watch in 2024',
    content: `# The Future of Web Design: Trends to Watch in 2024

The web design landscape is constantly evolving, and 2024 promises to bring exciting new trends and technologies. Let's explore what's coming next.

## Major Trends

### 1. AI-Powered Design Tools
Artificial intelligence is revolutionizing how we approach design...

### 2. Micro-Interactions
Small animations and interactions that enhance user experience...

### 3. Sustainable Design
Creating environmentally conscious digital experiences...`,
    excerpt: 'Discover the latest trends shaping web design in 2024, from AI-powered tools to sustainable design practices.',
    author: mockUsers[1],
    tags: [
      { postId: '2', tagId: '5', tag: { id: '5', name: 'Design' } },
      { postId: '2', tagId: '6', tag: { id: '6', name: 'Trends' } },
      { postId: '2', tagId: '7', tag: { id: '7', name: 'UI/UX' } },
      { postId: '2', tagId: '8', tag: { id: '8', name: 'Web Design' } }
    ],
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z',
    comments: [],
    upvotes: 87,
    downvotes: 2,
    isBookmarked: false,
    userVote: null,
  },
  {
    id: '3',
    title: 'Debugging Complex JavaScript Applications',
    content: `# Debugging Complex JavaScript Applications

Debugging is an essential skill for any JavaScript developer. Here are proven strategies and tools to help you identify and fix issues efficiently.

## Essential Debugging Tools

### Browser DevTools
The most powerful debugging tool is right in your browser...

### Console Methods
Beyond console.log(), there are many useful console methods...

### Debugger Statement
Strategic placement of debugger statements can save hours...`,
    excerpt: 'Master the art of debugging JavaScript applications with these proven strategies and tools.',
    author: mockUsers[2],
    tags: [
      { postId: '3', tagId: '4', tag: { id: '4', name: 'JavaScript' } },
      { postId: '3', tagId: '9', tag: { id: '9', name: 'Debugging' } },
      { postId: '3', tagId: '10', tag: { id: '10', name: 'DevTools' } },
      { postId: '3', tagId: '11', tag: { id: '11', name: 'Programming' } }
    ],
    createdAt: '2024-01-13T11:20:00Z',
    updatedAt: '2024-01-13T11:20:00Z',
    comments: [],
    upvotes: 56,
    downvotes: 1,
    isBookmarked: true,
    userVote: 'UP',
  },
  {
    id: '4',
    title: 'Creating Stunning Visual Effects with CSS',
    content: `# Creating Stunning Visual Effects with CSS

CSS has evolved far beyond simple styling. Modern CSS can create amazing visual effects that were once only possible with JavaScript.

## Advanced Techniques

### CSS Animations
Creating smooth, performant animations...

### Transform and Transition
Understanding the power of CSS transforms...

### CSS Grid and Flexbox
Layout techniques for modern web design...`,
    excerpt: 'Learn how to create amazing visual effects using modern CSS techniques and properties.',
    author: mockUsers[3],
    tags: [
      { postId: '4', tagId: '12', tag: { id: '12', name: 'CSS' } },
      { postId: '4', tagId: '13', tag: { id: '13', name: 'Animation' } },
      { postId: '4', tagId: '14', tag: { id: '14', name: 'Visual Effects' } },
      { postId: '4', tagId: '3', tag: { id: '3', name: 'Frontend' } }
    ],
    createdAt: '2024-01-12T08:45:00Z',
    updatedAt: '2024-01-12T08:45:00Z',
    comments: [],
    upvotes: 78,
    downvotes: 0,
    isBookmarked: false,
    userVote: null,
  },
];

export const mockTags = [
  'React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Node.js',
  'Python', 'Design', 'UI/UX', 'Frontend', 'Backend', 'DevOps',
  'Mobile', 'Web Development', 'Programming', 'Tutorial', 'Guide',
  'Tips', 'Best Practices', 'Performance', 'Security', 'Testing'
];

export const reportReasons: ReportReason[] = [
  { id: 'spam', label: 'Spam', description: 'Unwanted commercial content or repetitive posts' },
  { id: 'harassment', label: 'Harassment', description: 'Bullying, threatening, or abusive behavior' },
  { id: 'hate', label: 'Hate Speech', description: 'Content that promotes hatred based on identity' },
  { id: 'violence', label: 'Violence', description: 'Content that promotes or glorifies violence' },
  { id: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
  { id: 'copyright', label: 'Copyright', description: 'Unauthorized use of copyrighted material' },
  { id: 'other', label: 'Other', description: 'Other violations not listed above' },
];
