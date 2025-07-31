import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createCommentSchema } from '../middlewares/validator';
import { io } from '../index';

const prisma = new PrismaClient();


function enrichComment(comment: any, userId: string | undefined) {
  const upvotes = comment.votes ? comment.votes.filter((v: any) => v.type === 'UP').length : 0;
  const downvotes = comment.votes ? comment.votes.filter((v: any) => v.type === 'DOWN').length : 0;
  const userVote = userId
    ? (comment.votes?.find((v: any) => v.userId === userId)?.type ?? null)
    : null;

  // Recursively enrich replies if present
  const replies = comment.replies
    ? comment.replies.map((reply: any) => enrichComment(reply, userId))
    : [];

  return {
    ...comment,
    upvotes,
    downvotes,
    userVote,
    replies,
  };
}

// Get all comments for a post
export const getCommentsForPost = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    try {
        const postId = req.params.id;
        if (!postId) {
            return res.status(400).json({ error: 'Post ID is required' });
        }

        // Fetch only top-level comments with pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(20, parseInt(req.query.limit as string) || 10);
        const skip = (page - 1) * limit;

        const comments = await prisma.comment.findMany({
            where: { 
                postId,
                parentId: null // Only top-level comments
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true
                    },

                },
                _count: { select: { votes: true, replies: true } },
                 replies: {
                    take: 3, // Limit initial replies shown
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                                role: true
                            }
                        },
                        _count: { select: { votes: true } }
                    }
                },

            }
        });

        // Batch fetch vote counts and user votes
        const commentIds = comments.flatMap(c => [c.id, ...c.replies.map(r => r.id)]);
        
        let userVotes: Map<string, string> = new Map();
        let voteCounts: Map<string, { upvotes: number; downvotes: number }> = new Map();
        
        if (commentIds.length > 0) {
            const [votes, userVoteData] = await Promise.all([
                prisma.vote.groupBy({
                    by: ['commentId', 'type'],
                    where: { commentId: { in: commentIds } },
                    _count: { id: true }
                }),
                userId ? prisma.vote.findMany({
                    where: { userId, commentId: { in: commentIds } },
                    select: { commentId: true, type: true }
                }) : Promise.resolve([])
            ]);
            
            // Build vote count map
            commentIds.forEach(id => voteCounts.set(id, { upvotes: 0, downvotes: 0 }));
            votes.forEach(({ commentId, type, _count }) => {
                if (commentId) {
                    const counts = voteCounts.get(commentId);
                    if (counts) {
                        if (type === 'UP') counts.upvotes = _count.id;
                        if (type === 'DOWN') counts.downvotes = _count.id;
                    }
                }
            });
            
            // Build user vote map
            userVoteData.forEach(({ commentId, type }) => {
                if (commentId) userVotes.set(commentId, type);
            });
        }

        // Enrich comments with vote data
        const enriched = comments.map(comment => {
            const counts = voteCounts.get(comment.id) || { upvotes: 0, downvotes: 0 };
            const userVote = userVotes.get(comment.id) || null;
            
            return {
                ...comment,
                upvotes: counts.upvotes,
                downvotes: counts.downvotes,
                userVote,
                replies: comment.replies.map(reply => {
                    const replyCounts = voteCounts.get(reply.id) || { upvotes: 0, downvotes: 0 };
                    const replyUserVote = userVotes.get(reply.id) || null;
                    
                    return {
                        ...reply,
                        upvotes: replyCounts.upvotes,
                        downvotes: replyCounts.downvotes,
                        userVote: replyUserVote,
                    };
                })
            };
        });
        
    res.json(enriched);

    } catch (error) {
        console.error('Error in getCommentsForPost:', error);
        res.status(500).json({ error: 'Server error' });
        
    }
}

// Get a single comment by ID
export const getSingleComment = async (req: Request, res: Response) => {
    try {
        const comment = await prisma.comment.findUnique({
            where: {id: req.params.id},
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true
                    },
                    
                },
                replies: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                                role: true
                            }
                        }
                    }
                },

                
            }
        })
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(comment);
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
        
    }
}

// Create a new comment
export const createComment = async (req: Request, res: Response) => {
    try {
        const {content, postId, parentId} = createCommentSchema.parse(req.body)
        const userId = req.user!.userId    
        
        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                authorId: userId,
                parentId: parentId || null
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true
                    },
            
                }
            }
        })
        // Emit a socket event for new comment
        io.emit('commentCreated', comment); 

        res.status(201).json(comment);
    } catch (error: any) {
        console.error(error);
         res.status(500).json({
            error: 'Server error',
            message: error.message,
        });
        
    }

}

// Delete a comment
export const deleteComment = async (req: Request, res: Response) => {

    try {
        const commentId = req.params.id;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.authorId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

         // delete associated votes
        await prisma.vote.deleteMany({
            where: { commentId }
        });
       
        
        // delete all replies to this comment
        await prisma.comment.deleteMany({
            where: { parentId: commentId }
        });
       
        // delete the comment itself
        await prisma.comment.delete({
            where: { id: commentId }
        });

        // Emit a socket event for deleted comment
        io.emit('commentDeleted', commentId);

        res.status(204).send();
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}

// vote on a comment
export const voteComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const commentId = req.params.id;
    const { vote } = req.body; // 'UP' | 'DOWN' | 'remove'

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (vote === 'remove') {
      if (existingVote) {
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        io.emit('commentUnvoted', { commentId, userId });
        return res.status(200).json({ message: 'Vote removed' });
      }
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
          io.emit('commentVoted', { commentId, voteType: vote, userId });
          return res.status(200).json({ message: `Vote changed to ${vote}` });
        } else {
          // If same vote, remove it (toggle)
          await prisma.vote.delete({
            where: { id: existingVote.id },
          });
          io.emit('commentUnvoted', { commentId, userId });
          return res.status(200).json({ message: 'Vote removed' });
        }
      } else {
        // No vote yet, create new
        await prisma.vote.create({
          data: {
            userId,
            commentId,
            type: vote,
          },
        });
        io.emit('commentVoted', { commentId, voteType: vote, userId });
        return res.status(201).json({ message: `Comment ${vote === 'UP' ? 'upvoted' : 'downvoted'}` });
      }
    }

    return res.status(400).json({ error: 'Invalid vote type' });
  } catch (error) {
     console.error('Vote comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};



