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
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar: true,
        reputation: true,
        role: true,
        createdAt: true,
        savedPosts: {
          take: 10, // Limit saved posts
          select: {
            post: {
              select: {
                id: true,
                title: true,
                excerpt: true,
                createdAt: true,
                tags: {
                  select: {
                    tag: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  },
                  take: 3 // Limit tags per post
                },
                author: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
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

    // Enrich savedPosts with vote counts (simplified)
    if (user.savedPosts && user.savedPosts.length > 0) {
      try {
        const postIds = user.savedPosts
          .map((sp: any) => sp.post?.id)
          .filter(Boolean);
        
        if (postIds.length > 0) {
          const votes = await prisma.vote.findMany({
            where: { postId: { in: postIds } },
            select: { postId: true, type: true, userId: true }
          });
          
          user.savedPosts = user.savedPosts.map((savedPost: any) => {
            const postVotes = votes.filter(v => v.postId === savedPost.post?.id);
            const upvotes = postVotes.filter(v => v.type === 'UP').length;
            const downvotes = postVotes.filter(v => v.type === 'DOWN').length;
            const userVote = postVotes.find(v => v.userId === req.user?.userId)?.type ?? null;
            
            return {
              ...savedPost,
              post: {
                ...savedPost.post,
                upvotes,
                downvotes,
                userVote
              }
            };
          });
        }
      } catch (enrichError) {
        console.error('Error enriching saved posts:', enrichError);
        // Continue with unenriched data rather than failing completely
      }
    }

    io.emit('userProfileRetrieved', user);
    res.json(user);
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
    res.status(500).json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
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


