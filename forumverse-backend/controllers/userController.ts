import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { io } from '../index'; // Import the socket.io instance

import { updateUserSchema } from '../middlewares/validator';

const prisma = new PrismaClient();

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const {username, bio, avatar} = updateUserSchema.parse(req.body);
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                username,
                bio,
                avatar
            },
            select: {
                id: true,
                username: true,
                bio: true,
                avatar: true
            }
        });
        // Emit a socket event for user profile update
        io.emit('userProfileUpdated', updatedUser);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
        
    }
}

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
                role: true,
              },
            },
            tags: {
              include: { tag: true },
            },
            reports: true,
            comments: true,
          },
        },
        comment: {
          orderBy: { createdAt: 'desc' }, // ✅ SORT COMMENTS
          select: {
            id: true,
            content: true,
            postId: true,
            createdAt: true,
            post: {
              select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
              },
            },
          },
        },
        reports: {
          select: {
            id: true,
            reason: true,
            status: true,
            createdAt: true,
          },
        },
        votes: {
          select: {
            id: true,
            postId: true,
            type: true,
            userId: true,
            commentId: true,
          },
        },
        savedPosts: {
        //   orderBy: { createdAt: 'desc' },
          include: {
            post: {
              select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                tags: {
                  include: { tag: true },
                },
                author: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
  return res.status(404).json({ error: 'User not found' });
}

// Enrich posts
user.posts = await Promise.all(user.posts.map(async (post: any) => {
  const votes = await prisma.vote.findMany({
    where: { postId: post.id },
    select: { type: true, userId: true }
  });
  const upvotes = votes.filter(v => v.type === 'UP').length;
  const downvotes = votes.filter(v => v.type === 'DOWN').length;
  const userVote = votes.find(v => v.userId === req.user?.userId)?.type ?? null;
  return { ...post, upvotes, downvotes, userVote };
}));

// Enrich savedPosts
user.savedPosts = await Promise.all((user.savedPosts || []).map(async (savedPost: any) => {
  const post = savedPost.post;
  const votes = await prisma.vote.findMany({
    where: { postId: post.id },
    select: { type: true, userId: true }
  });
  const upvotes = votes.filter(v => v.type === 'UP').length;
  const downvotes = votes.filter(v => v.type === 'DOWN').length;
  const userVote = votes.find(v => v.userId === req.user?.userId)?.type ?? null;
  return {
    ...savedPost,
    post: { ...post, upvotes, downvotes, userVote }
  };
}));

io.emit('userProfileRetrieved', user);
res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

