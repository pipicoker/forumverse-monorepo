import {z} from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const createPostSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(10),
  tags: z.array(z.string()).max(5)
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
  postId: z.string(),
  parentId: z.string().optional().nullable()
});

export const createReportSchema = z.object({
  reason: z.string().min(1).max(500),
  details: z.string().optional(),
  commentId: z.string().optional(),
  postId: z.string().optional()
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional()
});



