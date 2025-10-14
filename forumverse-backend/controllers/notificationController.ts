import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: { userId: string };
}

// Get all notifications for the logged-in user
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: userId,
      },
      include: {
        triggerer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get unread notification count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const count = await prisma.notification.count({
      where: {
        recipientId: userId,
        read: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// Mark a notification as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.recipientId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
      include: {
        triggerer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete a notification
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.recipientId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Delete all notifications for the user
export const deleteAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.notification.deleteMany({
      where: {
        recipientId: userId,
      },
    });

    res.json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ error: 'Failed to delete all notifications' });
  }
};

// Helper function to create a notification (used by other controllers)
export const createNotification = async (
  type: string,
  message: string,
  recipientId: string,
  triggererId?: string,
  postId?: string,
  commentId?: string
) => {
  try {
    // Don't create notification if user is triggering their own action
    if (recipientId === triggererId) {
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        type: type as any,
        message,
        recipientId,
        triggererId,
        postId,
        commentId,
      },
      include: {
        triggerer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};



