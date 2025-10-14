import { Bell, CheckCheck, Trash2, MessageCircle, ThumbsUp, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Notification, NotificationType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'POST_VOTE':
    case 'COMMENT_VOTE':
      return <ThumbsUp className="h-4 w-4" />;
    case 'POST_COMMENT':
    case 'COMMENT_REPLY':
      return <MessageCircle className="h-4 w-4" />;
    case 'POST_SAVED':
      return <Bookmark className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'POST_VOTE':
    case 'COMMENT_VOTE':
      return 'text-blue-500';
    case 'POST_COMMENT':
    case 'COMMENT_REPLY':
      return 'text-green-500';
    case 'POST_SAVED':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
};

export const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: Notification, e: React.MouseEvent) => {
    // Prevent dropdown from closing
    e.preventDefault();
    e.stopPropagation();
    
    // Delete notification (this will automatically update unread count if it was unread)
    await deleteNotification(notification.id);

    // Navigate to the relevant post or comment
    if (notification.postId) {
      if (notification.commentId) {
        navigate(`/post/${notification.postId}#comment-${notification.commentId}`);
      } else {
        navigate(`/post/${notification.postId}`);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await markAllAsRead();
                await deleteAllNotifications();
              }}
              className="h-auto p-1 text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer",
                  !notification.read && "bg-muted/50"
                )}
                onSelect={(e) => e.preventDefault()}
                onClick={(e) => handleNotificationClick(notification, e)}
              >
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={notification.triggerer?.avatar} />
                  <AvatarFallback>
                    {notification.triggerer?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("rounded-full p-1", getNotificationColor(notification.type))}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  
                  <p className="text-sm leading-tight">
                    {notification.message}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  title="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};



