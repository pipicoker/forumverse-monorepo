import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { io } from '../index'; // Import the socket.io instance

import { createPostSchema } from '../middlewares/validator';

const prisma = new PrismaClient();

// function enrichComment(comment, userId) {
//   const upvotes = comment.votes ? comment.votes.filter(v => v.type === 'UP').length : 0;
//   const downvotes = comment.votes ? comment.votes.filter(v => v.type === 'DOWN').length : 0;
//   const userVote = userId
//     ? (comment.votes?.find(v => v.userId === userId)?.type ?? null)
//     : null;

//   // Recursively enrich replies if present
//   const replies = comment.replies
//     ? comment.replies.map(reply => enrichComment(reply, userId))
//     : [];

//   return {
//     ...comment,
//     upvotes,
//     downvotes,
//     userVote,
//     replies,
//   };
// }

// get all posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 10, search, tags, sort = 'newest' } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (tags) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: (tags as string).split(',')
            }
          }
        }
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'popular') {
      orderBy = { votes: { _count: 'desc' } };
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true
          }
        },
        votes: {
          select: {
            id: true,
            type: true,
            userId: true
          }
        },
        comments: {
            include: {
                author: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    role: true
                }
                },
                votes: true,
                replies: {
                include: {
                    author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true
                    }
                    },
                    votes: true,
                }
                }
            }
        },
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        },
        ...(userId && {
          savedBy: {
            where: { userId },
            select: { userId: true }
          }
        })
      },
    });

    // Get all post IDs
    const postIds = posts.map((post: any) => post.id);

    // Fetch all votes by this user for these posts
    let userVotes: { postId: string, type: string }[] = [];
  // After fetching userVotes
    if (userId) {
    userVotes = (await prisma.vote.findMany({
        where: {
        userId,
        postId: { in: postIds }
        },
        select: { postId: true, type: true }
    }))
    // Filter out any votes with null postId
    .filter(v => v.postId !== null) as { postId: string, type: string }[];
    }

    // Map postId to vote type for current user
    const voteMap = Object.fromEntries(
      userVotes.map(v => [v.postId, v.type])
    );

const postsWithVotes = posts.map((post: any) => {
  const upvotes = post.votes.filter((v: any) => v.type === 'UP').length;
  const downvotes = post.votes.filter((v: any) => v.type === 'DOWN').length;
  const userVote = userId
    ? post.votes.find((v: any) => v.userId === userId)?.type ?? null
    : null;


  return {
    ...post,
    upvotes,
    downvotes,
    userVote,
    isBookmarked: userId ? post.savedBy?.length > 0 : false,
  };
});

res.json(postsWithVotes);

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// get single post
export const getSinglePost = async(req: Request, res:Response) => {
    try {
        const userId = req.user?.userId;
        const post = await prisma.post.findUnique({
            where: {id: req.params.id},
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                comments: {
                include: {
                    author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true
                    }
                    },
                    votes: true,
                    replies: {
                    include: {
                        author: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            role: true
                        }
                        },
                        votes: true,
                    }
                    }
                },
                where: {
                    parentId: null
                }
                },
                votes: {
                    select: {
                        id: true,
                        type: true,
                        userId: true
                    }
                },
                ...(userId && {
                    savedBy: {
                        where: { userId },
                        select: { userId: true }
                    }
                })
            }
        });

        if(!post) {
            return res.status(404).json({error: 'Post not found'})
        }

        // Calculate upvotes and downvotes
        const upvotes = post.votes.filter((v: any) => v.type === 'UP').length;
        const downvotes = post.votes.filter((v: any) => v.type === 'DOWN').length;

        // Get current user's vote
        let userVote: 'upvote' | 'downvote' | null = null;
        if (userId) {
            const vote = post.votes.find((v: any) => v.userId === userId);
            if (vote?.type === 'UP') userVote = 'upvote';
            else if (vote?.type === 'DOWN') userVote = 'downvote';
        }

    

        res.json({
        ...post,
        upvotes,
        downvotes,
        userVote,
        isBookmarked: userId ? post.savedBy?.length > 0 : false,
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}


// create post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, tags } = createPostSchema.parse(req.body);

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!title || !content || !tags) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt: content.substring(0, 200) + '...',
        authorId: userId,
        tags: {
          create: tags.map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName },
              },
            },
          })),
        },
      },
      include: {
        votes: true,
        comments: true,
        savedBy: {
          where: { userId },
          select: { userId: true }
        },
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
          
        },
      },
    });

    const upvotes = post.votes.filter(v => v.type === 'UP').length;
    const downvotes = post.votes.filter(v => v.type === 'DOWN').length;
    const commentsCount = post.comments.length;
    // Emit a socket event for new post
    io.emit('postCreated', {
      ...post,
      upvotes,  
      downvotes,
      commentsCount,
      isBookmarked: post.savedBy.length > 0,

    });

    res.status(201).json(post);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// bookmark post
export const bookmarkPost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const postId = req.params.id;

    const bookmark = await prisma.savedPost.create({
      data: {
        userId,
        postId,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            isBookmarked: true
          },
        },
      },
    });

    // Emit a socket event for new bookmark
    io.emit('postBookmarked', bookmark);

    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// unbookmark post
export const unbookmarkPost = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const postId = req.params.id;

        await prisma.savedPost.deleteMany({
            where: {
                userId,
                postId
            }
        });

        // Emit a socket event for bookmark removal
        io.emit('postUnbookmarked', { userId, postId });

        res.status(200).json({ message: 'Post unbookmarked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}

// vote post (like/unlike only)
export const votePost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const postId = req.params.id;
    const { vote } = req.body; // 'UP' | 'DOWN' | 'remove'
    console.log(`Vote request: userId=${userId}, postId=${postId}, vote=${vote}`);

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    console.log('Existing vote:', existingVote);

    if (vote === 'remove') {
      if (existingVote) {
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        console.log('Vote removed');
        io.emit('postUnvoted', { postId, userId });
        return res.status(200).json({ message: 'Vote removed' });
      }
      console.log('No vote to remove');
      return res.status(200).json({ message: 'No vote to remove' });
    }

    if (vote === 'UP' || vote === 'DOWN') {
      if (existingVote) {
        if (existingVote.type !== vote) {
          // Update vote type if different
          await prisma.vote.update({
            where: { id: existingVote.id },
            data: { type: vote },
          });
          console.log(`Vote updated from ${existingVote.type} to ${vote}`);
          io.emit('postVoted', { postId, voteType: vote, userId });
          return res.status(200).json({ message: `Vote changed to ${vote}` });
        } else {
          // If same vote, remove it (toggle)
          await prisma.vote.delete({
            where: { id: existingVote.id },
          });
          console.log('Vote toggled off (removed)');
          io.emit('postUnvoted', { postId, userId });
          return res.status(200).json({ message: 'Vote removed' });
        }
      } else {
        // No vote yet, create new
        await prisma.vote.create({
          data: {
            userId,
            postId,
            type: vote,
          },
        });
        console.log(`New vote created: ${vote}`);
        io.emit('postVoted', { postId, voteType: vote, userId });
        return res.status(201).json({ message: `Post ${vote === 'UP' ? 'upvoted' : 'downvoted'}` });
      }
    }

    console.log('Invalid vote type:', vote);
    return res.status(400).json({ error: 'Invalid vote type' });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// delete post
export const deletePost = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const postId = req.params.id;

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });

        if (!post || post.authorId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        //  delete associated votes and comments
        await prisma.vote.deleteMany({
            where: { postId }
        });

        await prisma.comment.deleteMany({
            where: { postId }
        });
        await prisma.savedPost.deleteMany({
            where: { postId }
        });
        // Optionally delete associated tags if no longer used
        await prisma.postTag.deleteMany({
            where: { postId }
        });

        await prisma.post.delete({
            where: { id: postId }
        });

        // Emit a socket event for post deletion
        console.log('Emitting postDeleted for:', postId);
        io.emit('postDeleted', {postId});

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete Post Error:', error);

        res.status(500).json({ error: 'Server error' });
    }
};

