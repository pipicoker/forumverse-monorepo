# Voting System Implementation

## Overview
The voting system has been fully implemented with proper constraints and realtime updates. Users can upvote or downvote posts and comments, with the following rules:

## Rules

### 1. **One Vote Per Post/Comment**
- Each user can only have ONE vote (either upvote OR downvote) per post or comment
- This is enforced by unique constraints in the database:
  - `@@unique([userId, postId])` for post votes
  - `@@unique([userId, commentId])` for comment votes

### 2. **Vote Switching**
- If you have an upvote and click downvote → your upvote is removed and replaced with a downvote
- If you have a downvote and click upvote → your downvote is removed and replaced with an upvote
- If you click the same vote type twice → your vote is removed (toggle off)

### 3. **No Double Voting**
- The database constraints prevent duplicate votes
- The backend logic checks for existing votes before creating new ones
- The frontend provides optimistic updates with proper state management

### 4. **Realtime Updates**
- All voting actions are broadcast via Socket.io
- Other users see vote count updates in real-time
- Socket events:
  - `postVoted` - Emitted when a post is voted on
  - `postUnvoted` - Emitted when a post vote is removed
  - `commentVoted` - Emitted when a comment is voted on
  - `commentUnvoted` - Emitted when a comment vote is removed

## Backend Implementation

### Database Schema (Prisma)
```prisma
model Vote {
  id        String   @id @default(cuid())
  userId    String
  postId    String?
  commentId String?
  type      VoteType

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post    Post?    @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment Comment? @relation(fields: [commentId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, postId])
  @@unique([userId, commentId])
  @@map("votes")
}

enum VoteType {
  UP
  DOWN
}
```

### Controller Logic
**Location**: `forumverse-backend/controllers/postController.ts` and `commentController.ts`

The voting logic:
1. Checks for existing vote using unique constraint
2. If same vote type → removes it (toggle off)
3. If different vote type → updates it
4. If no existing vote → creates new vote
5. Emits Socket.io events for realtime updates
6. Creates notifications for the post/comment author

## Frontend Implementation

### PostCard Component
**Location**: `forumverse-frontend/src/components/PostCard.tsx`

Features:
- Initializes vote state from `post.userVote`
- Optimistic updates for instant feedback
- Realtime Socket.io listeners for other users' votes
- Proper error handling with rollback on failure
- Visual feedback (green for upvote, red for downvote)

### PostDetail Page
**Location**: `forumverse-frontend/src/pages/PostDetail.tsx`

Features:
- Post voting with optimistic updates
- Comment voting with nested comment support
- Realtime updates for all votes
- Proper state synchronization
- Error handling with user-friendly toasts

## How It Works

### User Clicks Upvote:
1. **Frontend**:
   - Checks current vote state
   - If already upvoted → remove vote (toggle off)
   - If downvoted → switch to upvote
   - If no vote → add upvote
   - Updates UI optimistically
   - Sends request to backend

2. **Backend**:
   - Receives vote request
   - Checks for existing vote in database
   - Updates or creates vote record
   - Emits Socket.io event: `postVoted` or `commentVoted`
   - Creates notification for author
   - Returns success response

3. **Realtime Update**:
   - All connected clients receive Socket.io event
   - Other users' UIs update vote counts automatically
   - Voting user's optimistic update is confirmed

### Error Handling:
- If backend request fails, frontend rolls back optimistic update
- User sees error toast
- Vote counts return to previous state

## Testing Checklist

To verify the voting system works correctly:

- [ ] Click upvote on a post → vote count increases
- [ ] Click upvote again → vote is removed, count decreases
- [ ] Click downvote after upvoting → upvote removed, downvote added
- [ ] Refresh page → vote state persists
- [ ] Vote on a comment → same behavior as post
- [ ] Open same post in two browsers → see realtime updates
- [ ] Vote in one browser → other browser updates immediately
- [ ] Check database → only one vote record per user per post/comment

## Files Modified

### Backend
- ✅ `forumverse-backend/controllers/postController.ts` (already had correct logic)
- ✅ `forumverse-backend/controllers/commentController.ts` (already had correct logic)
- ✅ `forumverse-backend/prisma/schema.prisma` (unique constraints already in place)

### Frontend
- ✅ `forumverse-frontend/src/components/PostCard.tsx` (updated with proper state management and realtime)
- ✅ `forumverse-frontend/src/pages/PostDetail.tsx` (updated post and comment voting with realtime)
- ✅ `forumverse-frontend/src/types/index.ts` (already had correct types)

## Notes

- The backend already had the correct voting logic implemented
- The database schema already had proper unique constraints
- The main fixes were in the frontend to properly sync state and add realtime updates
- Optimistic updates provide instant feedback while waiting for server response
- Socket.io ensures all users see changes in real-time

