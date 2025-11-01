import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Simple in-memory cache
const cache = {
  communityStats: { data: null as any, timestamp: 0 },
  popularTags: { data: null as any, timestamp: 0 },
  recentActivity: { data: null as any, timestamp: 0 }
};

const CACHE_TTL = 60000; // 1 minute cache

const isCacheValid = (timestamp: number) => {
  return Date.now() - timestamp < CACHE_TTL;
};

// Get community stats
export const getCommunityStats = async (req: Request, res: Response) => {
  try {
    // Return cached data if valid
    if (cache.communityStats.data && isCacheValid(cache.communityStats.timestamp)) {
      return res.json(cache.communityStats.data);
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalPosts, totalUsers, todaysPosts, activeUsers] = await Promise.all([
      // Total posts
      prisma.post.count(),
      
      // Total users
      prisma.user.count(),
      
      // Today's posts
      prisma.post.count({
        where: {
          createdAt: {
            gte: startOfToday
          }
        }
      }),
      
      // Active users (users who posted or commented in the last 7 days)
      prisma.user.count({
        where: {
          OR: [
            {
              posts: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  }
                }
              }
            },
            {
              comment: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  }
                }
              }
            }
          ]
        }
      })
    ]);

    const stats = {
      totalPosts,
      totalUsers,
      todaysPosts,
      activeUsers,
      onlineNow: 0 // We don't track online status yet
    };

    // Cache the result
    cache.communityStats = {
      data: stats,
      timestamp: Date.now()
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching community stats:', error);
    res.status(500).json({ error: 'Failed to fetch community stats' });
  }
};

// Get popular tags
export const getPopularTags = async (req: Request, res: Response) => {
  try {
    // Return cached data if valid
    if (cache.popularTags.data && isCacheValid(cache.popularTags.timestamp)) {
      return res.json(cache.popularTags.data);
    }

    const limit = parseInt(req.query.limit as string) || 15;

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      take: limit
    });

    // Cache the result
    cache.popularTags = {
      data: tags,
      timestamp: Date.now()
    };

    res.json(tags);
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({ error: 'Failed to fetch popular tags' });
  }
};

// Get recent activity
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    // Return cached data if valid
    if (cache.recentActivity.data && isCacheValid(cache.recentActivity.timestamp)) {
      return res.json(cache.recentActivity.data);
    }

    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent posts
    const recentPosts = await prisma.post.findMany({
      take: Math.ceil(limit / 2),
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true
              }
            }
          },
          take: 1
        }
      }
    });

    // Get recent comments
    const recentComments = await prisma.comment.findMany({
      take: Math.floor(limit / 2),
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true
          }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Combine and sort by time
    const activities = [
      ...recentPosts.map(post => ({
        id: post.id,
        type: 'post' as const,
        username: post.author.username,
        userId: post.author.id,
        action: 'posted',
        target: post.tags[0]?.tag.name || 'General',
        postId: post.id,
        postTitle: post.title,
        createdAt: post.createdAt
      })),
      ...recentComments.map(comment => ({
        id: comment.id,
        type: 'comment' as const,
        username: comment.author.username,
        userId: comment.author.id,
        action: 'commented on',
        target: comment.post.title,
        postId: comment.post.id,
        postTitle: comment.post.title,
        createdAt: comment.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
     .slice(0, limit);

    // Cache the result
    cache.recentActivity = {
      data: activities,
      timestamp: Date.now()
    };

    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

