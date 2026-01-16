# Group Management Implementation Plan

## Backend Updates

### Step 1: Add leaveGroup endpoint
- [x] Add `leaveGroup` function in `backend/controllers/group.controller.js`
- [x] Add route in `backend/router/group.route.js`

### Step 2: Add cancelInvite endpoint
- [x] Add `cancelGroupInvite` function in `backend/controllers/group-invite.controller.js`
- [x] Add route in `backend/router/group-invite.route.js`

## Frontend API Updates

### Step 3: Update groups-api.ts
- [x] Add `getUsers` API method
- [x] Add `leaveGroup` API method
- [x] Add `cancelInvite` API method

## Frontend Components

### Step 4: Create new components
- [x] Create `leave-group-dialog.tsx` - Confirmation dialog for leaving groups
- [x] Create `delete-group-dialog.tsx` - Confirmation dialog for deleting groups
- [x] Create `sent-group-invites.tsx` - View invites sent by admin
- [x] Create `received-invites.tsx` - View all received invites with filters
- [x] Create `invite-users-to-group.tsx` - Invite users to groups you created
- [x] Create `dialog.tsx` - Dialog UI component

### Step 5: Update existing components
- [x] Update `group-card.tsx` - Add onDeleteGroup prop, use proper handlers
- [x] Update `group-list.tsx` - Add onDeleteGroup callback
- [x] Update `index.ts` - Export new components
- [x] Update `groups/page.tsx` - Add tabs for Sent Invites and Invite Users

## Progress Log
- [x] Analyzed codebase
- [x] Created implementation plan
- [x] Implemented backend leaveGroup endpoint
- [x] Implemented backend cancelInvite endpoint
- [x] Updated frontend API
- [x] Created new frontend components
- [x] Updated existing frontend components

## Summary of Changes

### Backend Changes:
1. `backend/controllers/group.controller.js` - Added `leaveGroup` function
2. `backend/router/group.route.js` - Added `POST /group/:groupId/leave` route
3. `backend/controllers/group-invite.controller.js` - Added `cancelGroupInvite` function
4. `backend/router/group-invite.route.js` - Added `DELETE /group-invite/:inviteId` route

### Frontend Changes:
1. `frontend/src/lib/api/groups-api.ts` - Added `getUsers`, `leaveGroup`, `cancelInvite` methods
2. `frontend/src/components/ui/dialog.tsx` - Created Dialog UI component
3. `frontend/src/components/groups/leave-group-dialog.tsx` - Created confirmation dialog for leaving groups
4. `frontend/src/components/groups/delete-group-dialog.tsx` - Created confirmation dialog for deleting groups
5. `frontend/src/components/groups/sent-group-invites.tsx` - Admin can view sent invites and cancel pending ones
6. `frontend/src/components/groups/received-invites.tsx` - Users can view all received invites with filter
7. `frontend/src/components/groups/invite-users-to-group.tsx` - Admin can invite users to their groups
8. `frontend/src/components/groups/group-card.tsx` - Added onDeleteGroup prop
9. `frontend/src/components/groups/group-list.tsx` - Added onDeleteGroup callback
10. `frontend/src/components/groups/index.ts` - Exported new components
11. `frontend/src/app/groups/page.tsx` - Added new tabs for Sent Invites and Invite Users

