# Notification System Documentation

## Overview

The notification system provides real-time notifications to users when:
- Someone votes on their post or comment
- Someone comments on their post
- Someone replies to their comment
- Someone bookmarks their post

## Architecture

### Backend Components

#### 1. Database Schema (`forumverse-backend/prisma/schema.prisma`)

**Notification Model:**
```prisma
model Notification {
  id          String           @id @default(cuid())
  type        NotificationType
  message     String
  read        Boolean          @default(false)
  recipientId String
  triggererId String?
  postId      String?
  commentId   String?
  
  recipient User  @relation("NotificationRecipient", ...)
  triggerer User? @relation("NotificationTriggerer", ...)
}

enum NotificationType {
  POST_VOTE
  COMMENT_VOTE
  POST_COMMENT
  COMMENT_REPLY
  POST_SAVED
}
```

#### 2. Notification Controller (`forumverse-backend/controllers/notificationController.ts`)

**Endpoints:**
- `GET /api/notifications` - Get all notifications for logged-in user
- `GET /api/notifications/unread-count` - Get unread notification count
- `PATCH /api/notifications/:id/read` - Mark a notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete a notification
- `DELETE /api/notifications` - Delete all notifications

**Helper Function:**
- `createNotification()` - Used by other controllers to create notifications

#### 3. Socket.IO Integration (`forumverse-backend/index.ts`)

**Events:**
- `join` - User joins their notification room
- `leave` - User leaves their notification room
- `notification` - Emitted when a new notification is created

#### 4. Updated Controllers

**Post Controller:**
- Creates notifications when someone votes on a post
- Creates notifications when someone bookmarks a post

**Comment Controller:**
- Creates notifications when someone comments on a post
- Creates notifications when someone replies to a comment
- Creates notifications when someone votes on a comment

### Frontend Components

#### 1. Types (`forumverse-frontend/src/types/index.ts`)

```typescript
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  recipientId: string;
  triggererId?: string;
  postId?: string;
  commentId?: string;
  triggerer?: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

#### 2. Notification Context (`forumverse-frontend/src/contexts/NotificationContext.tsx`)

Provides notification state and functions:
- `notifications` - Array of notifications
- `unreadCount` - Count of unread notifications
- `fetchNotifications()` - Fetch all notifications
- `markAsRead(id)` - Mark a notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete a notification
- `deleteAllNotifications()` - Delete all notifications

**Real-time Updates:**
- Joins user's Socket.IO room on login
- Listens for `notification` events
- Automatically updates UI when new notifications arrive

#### 3. Notification Dropdown (`forumverse-frontend/src/components/NotificationDropdown.tsx`)

**Features:**
- Bell icon with unread count badge
- Dropdown menu showing all notifications
- Mark individual notifications as read
- Mark all notifications as read
- Delete individual notifications
- Click notification to navigate to relevant post/comment
- Visual indicators for notification types and read status
- Time stamps showing "X minutes ago" format

#### 4. Integration in Navbar

The NotificationDropdown is integrated into the main Navbar component and is visible to all authenticated users.

## How It Works

### Creating a Notification

1. User performs an action (vote, comment, bookmark)
2. Controller creates the action in database
3. Controller calls `createNotification()` helper function
4. Notification is saved to database
5. Socket.IO emits notification to recipient's room
6. Frontend receives notification via Socket.IO
7. UI updates in real-time

### Flow Example: User A votes on User B's post

1. User A clicks upvote button
2. POST request to `/api/posts/:id/vote`
3. `votePost()` controller function:
   - Creates/updates vote in database
   - Fetches post author (User B)
   - Fetches voter username (User A)
   - Calls `createNotification()`:
     ```typescript
     createNotification(
       'POST_VOTE',
       'User A upvoted your post',
       userId_B,  // recipient
       userId_A,  // triggerer
       postId
     )
     ```
4. `createNotification()` saves notification and returns it
5. Socket.IO emits to User B's room:
   ```typescript
   io.to(userId_B).emit('notification', notification)
   ```
6. User B's frontend receives the event
7. Notification context adds it to state
8. Bell icon badge updates (+1 unread)
9. Dropdown shows new notification

### Preventing Self-Notifications

The `createNotification()` function includes a check:
```typescript
if (recipientId === triggererId) {
  return null;
}
```
This prevents users from receiving notifications for their own actions.

## UI Features

### Notification Types & Icons

- **POST_VOTE / COMMENT_VOTE** - 👍 Thumbs up icon (blue)
- **POST_COMMENT / COMMENT_REPLY** - 💬 Message icon (green)
- **POST_SAVED** - 🔖 Bookmark icon (yellow)

### Visual States

- **Unread**: Background highlight + blue dot indicator
- **Read**: Normal background, no dot

### User Actions

1. **Click notification** - Navigate to post/comment & mark as read
2. **Click checkmark** - Mark individual notification as read
3. **Click trash** - Delete individual notification
4. **Click "Mark all read"** - Mark all notifications as read

## Testing the System

### Manual Testing Steps

1. **Setup**: Have two user accounts (User A & User B)

2. **Test Post Vote Notification:**
   - User A creates a post
   - User B votes on the post
   - User A should receive notification

3. **Test Comment Notification:**
   - User A creates a post
   - User B comments on the post
   - User A should receive notification

4. **Test Reply Notification:**
   - User A comments on a post
   - User B replies to User A's comment
   - User A should receive notification

5. **Test Comment Vote Notification:**
   - User A creates a comment
   - User B votes on the comment
   - User A should receive notification

6. **Test Bookmark Notification:**
   - User A creates a post
   - User B bookmarks the post
   - User A should receive notification

7. **Test Real-time Updates:**
   - Have both users logged in simultaneously
   - Perform actions as User B
   - Verify User A sees notifications appear in real-time

### Expected Behavior

- ✅ Notifications appear instantly via Socket.IO
- ✅ Unread count badge updates in real-time
- ✅ No notifications for own actions
- ✅ Clicking notification navigates to correct post/comment
- ✅ Marking as read updates UI immediately
- ✅ Deleting notification removes from list

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get all notifications | ✅ |
| GET | `/api/notifications/unread-count` | Get unread count | ✅ |
| PATCH | `/api/notifications/:id/read` | Mark as read | ✅ |
| PATCH | `/api/notifications/read-all` | Mark all as read | ✅ |
| DELETE | `/api/notifications/:id` | Delete notification | ✅ |
| DELETE | `/api/notifications` | Delete all | ✅ |

## Socket.IO Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join` | Client → Server | `userId` | Join user's notification room |
| `leave` | Client → Server | `userId` | Leave user's notification room |
| `notification` | Server → Client | `Notification` | New notification received |

## Future Enhancements

Possible improvements for the notification system:

1. **Email Notifications** - Send emails for important notifications
2. **Push Notifications** - Browser push notifications
3. **Notification Preferences** - Let users customize what they want to be notified about
4. **Notification Groups** - Group similar notifications ("User A and 5 others liked your post")
5. **Notification Sound** - Audio alert for new notifications
6. **Notification History** - Archive old notifications instead of deleting
7. **Digest Emails** - Daily/weekly notification summaries
8. **In-app Notification Center** - Dedicated page for viewing all notifications

## Troubleshooting

### Notifications not appearing in real-time

**Check:**
1. Socket.IO connection status
2. User is joined to their room
3. Backend is emitting to correct room
4. CORS settings allow Socket.IO

### Notifications not persisting

**Check:**
1. Database connection
2. Prisma schema is migrated
3. createNotification function returns successfully

### Count badge not updating

**Check:**
1. Unread count is calculated correctly
2. NotificationContext is properly wrapping the app
3. Socket.IO listener is updating the count



