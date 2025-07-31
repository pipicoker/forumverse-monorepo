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
// user.posts = await Promise.all(user.posts.map(async (post: any) => {
//   const votes = await prisma.vote.findMany({
//     where: { postId: post.id },
//     select: { type: true, userId: true }
//   });
//   const upvotes = votes.filter(v => v.type === 'UP').length;
//   const downvotes = votes.filter(v => v.type === 'DOWN').length;
//   const userVote = votes.find(v => v.userId === req.user?.userId)?.type ?? null;
//   return { ...post, upvotes, downvotes, userVote };
// }));

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

//get user posts
// GET /user/:id/posts?limit=3&offset=0
// GET /user/:id/posts?limit=3&offset=0
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id || req.user?.userId;
    const currentUserId = req.user?.userId;

    const limit = parseInt(req.query.limit as string) || 3;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }


    const userPosts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
        tags: { include: { tag: true } },
        votes: true,
        ...(currentUserId && {
          savedBy: {
            where: { userId: currentUserId },
            select: { userId: true },
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    const totalCount = await prisma.post.count({
      where: { authorId: userId },
    });

    const postIds = userPosts.map((post: any) => post.id);

    const topLevelCommentCounts = await prisma.comment.groupBy({
      by: ['postId'],
      where: {
        postId: { in: postIds },
        parentId: null,
      },
      _count: { _all: true },
    });

    const commentCountMap = Object.fromEntries(
      topLevelCommentCounts.map((c) => [c.postId, c._count._all])
    );

    let userVotes: { postId: string; type: string }[] = [];
    if (currentUserId) {
      userVotes = await prisma.vote.findMany({
        where: {
          userId: currentUserId,
          postId: { in: postIds },
        },
        select: {
          postId: true,
          type: true,
        },
      });
    }

    const voteMap = Object.fromEntries(userVotes.map((v) => [v.postId, v.type]));

    const postsWithExtras = userPosts.map((post: any) => {
      const upvotes = post.votes.filter((v: any) => v.type === 'UP').length;
      const downvotes = post.votes.filter((v: any) => v.type === 'DOWN').length;
      const userVote = currentUserId ? voteMap[post.id] ?? null : null;

      return {
        ...post,
        upvotes,
        downvotes,
        userVote,
        topLevelCommentCount: commentCountMap[post.id] ?? 0,
        isBookmarked: currentUserId ? post.savedBy?.length > 0 : false,
      };
    });

    return res.json({ posts: postsWithExtras, totalCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
};




// get user comments
// GET /user/:id/comments?limit=5&offset=0
export const getUserComments = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id || req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 3;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: { 
          authorId: userId,
          parentId: null
         },
        include: {
          post: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),

      prisma.comment.count({
        where: { 
          authorId: userId,
          parentId: null
         },
      }),
    ]);

    return res.json({ comments, totalCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch user comments' });
  }
};


