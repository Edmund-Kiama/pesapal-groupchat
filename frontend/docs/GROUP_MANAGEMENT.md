# Group Management Module

This document describes the Group Management module for the PesaPal application, based on the backend models.

## Overview

The Group Management module allows users to:
- View groups they belong to
- Create new groups (Admin only)
- Invite users to groups (Admin only)
- Accept/Decline group invitations
- View pending invitations

## Backend Models Analysis

### Group (`backend/models/group.model.js`)
- `id` - Primary key
- `name` - Group name (2-30 characters, required)
- `description` - Group description (optional, max 50 chars)
- `created_by` - User ID of the group creator (Admin)
- `createdAt` / `updatedAt` - Timestamps

### GroupMember (`backend/models/group-member.model.js`)
- `id` - Primary key
- `userId` - Reference to User
- `groupId` - Reference to Group
- `joined_at` - Timestamp when user joined

### GroupInvite (`backend/models/group-invite.model.js`)
- `id` - Primary key
- `senderId` - User who sent the invite (Admin)
- `receiverId` - User receiving the invite
- `groupId` - Reference to Group
- `status` - ENUM: `pending`, `accepted`, `declined` (default: `pending`)

## Role-Based Access Control

### Admin Role (`admin`)
**Capabilities:**
1. **Create Groups**
   - Endpoint: `POST /api/v1/group`
   - Creates group and automatically adds creator as member
   - Sends notification and email confirmation

2. **Invite Users**
   - Endpoint: `POST /api/v1/group-invite`
   - Creates a pending invitation for the target user
   - User receives notification and email

3. **Add Members Directly**
   - Endpoint: `POST /api/v1/group/add-member`
   - Bulk add users to groups (bypasses invite flow)

### Member Role (`member`)
**Capabilities:**
1. **View Groups**
   - See all groups via `GET /api/v1/group`
   - View their own memberships via `GET /api/v1/group/memberships`

2. **Respond to Invitations**
   - Endpoint: `POST /api/v1/group-invite/response`
   - Can `accept` or `decline` pending invitations
   - On accept: Creates GroupMember record and updates invite status
   - On decline: Updates invite status to `declined`

3. **View Pending Invites**
   - Endpoint: `GET /api/v1/group-invite/receiver/:receiverId`

## Frontend Architecture

### API Layer (`frontend/src/lib/api/groups-api.ts`)

```typescript
// Group API
groupApi.createGroup(data)      // Admin only
groupApi.getAllGroups()         // All authenticated users
groupApi.getGroupById(id)       // All authenticated users
groupApi.getMyGroups()          // Get user's memberships
groupApi.getGroupMembers(id)    // Get group members
groupApi.addMember(data)        // Admin only

// Group Invite API
groupInviteApi.createInvite(data)      // Admin only
groupInviteApi.getReceivedInvites(id)  // Get pending invites
groupInviteApi.getSentInvites(id)      // Get sent invites
groupInviteApi.respondToInvite(data)   // Accept/Decline
```

### Components Structure

```
frontend/src/components/groups/
├── group-card.tsx              # Display group info in card format
├── group-list.tsx              # Grid of groups user belongs to
├── create-group-form.tsx       # Admin: Create new group
├── invite-user-form.tsx        # Admin: Invite user to group
├── pending-group-invites.tsx   # Show & respond to invites
└── admin-group-actions.tsx     # Admin: Manage group members

frontend/src/app/groups/
└── page.tsx                    # Main groups page (all users)

frontend/src/app/admin/groups/
└── page.tsx                    # Admin-only group management
```

## User Flow

### Admin Flow
1. Navigate to `/admin/groups`
2. Click "Create Group" tab
3. Fill form and submit
4. Go to "Manage Groups" tab
5. Select a group
6. Use "Invite User" form to send invitations

### Member Flow
1. Navigate to `/groups`
2. View "My Groups" in card grid
3. Check "Pending Group Invites" section
4. Click "Accept" or "Decline" on invites
5. View newly joined group in "My Groups"

## API Integration Examples

### Creating a Group (Admin)
```typescript
const response = await groupApi.createGroup({
  name: "Development Team",
  description: "Backend and frontend developers"
});
// Backend: Creates group + creator as member + notification
```

### Inviting a User (Admin)
```typescript
const response = await groupInviteApi.createInvite({
  receiverId: 5,
  groupId: 1
});
// Backend: Creates GroupInvite(status='pending') + notification
```

### Accepting an Invite (Member)
```typescript
const response = await groupInviteApi.respondToInvite({
  groupInviteId: 10,
  status: "accepted"
});
// Backend transaction:
// 1. Update GroupInvite status to 'accepted'
// 2. Create GroupMember record
// 3. Send notifications to both parties
```

## Database Transactions

The backend uses Sequelize transactions for:
1. **Group Creation**: Atomic - group + member creation
2. **Invite Response**: Atomic - invite update + member creation (on accept)

This ensures data integrity across related tables.

## Notification Types

The module triggers these notifications:
- `GROUP_CREATED` - When admin creates a group
- `GROUP_INVITE_CREATED` - When user receives invite
- `GROUP_INVITE_ACCEPTED` - When invite is accepted
- `GROUP_INVITE_DECLINED` - When invite is declined
- `GROUP_MEMBER_ADDED` - When member is added

## Next Steps

1. **Group Details Page** - View group members, chat, meetings
2. **Group Chat Integration** - Real-time chat per group
3. **Group Meetings** - Schedule and invite to meetings
4. **Group Elections** - Conduct elections within groups
5. **Leave Group** - Allow members to leave groups
6. **Remove Member** - Allow admins to remove members

