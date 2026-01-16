# Dashboard Tables Refactoring - Feedback Implementation

## Changes Based on User Feedback

### 1. Filter Tables by Admin's Created Groups
- Groups Table: Show only groups where `created_by === current user id`
- Meetings Table: Show only meetings for groups the user created
- Members Table: Show only memberships for groups the user created

### 2. Add Popup Dialogs for Actions
- `confirm-delete-user-dialog.tsx` - Delete user confirmation
- `confirm-delete-group-dialog.tsx` - Delete group confirmation
- `confirm-remove-member-dialog.tsx` - Remove member from group
- `respond-invite-dialog.tsx` - Accept/Decline invite

### 3. Refactor Dashboard Navigation
- Remove duplicate "Groups" navigation items
- Add proper admin-only menu structure:
  - Dashboard - Overview for all users
  - My Groups - Groups user belongs to
  - Admin Panel - Only for admins with sub-items:
    - Manage Groups (created by admin)
    - Manage Users
    - View All Meetings

### 4. Backend API Updates
- Add `GET /group/creator/:userId` - Get groups created by a user
- Add `GET /group-meeting/creator/:userId` - Get meetings for groups created by user
- Add `GET /group/memberships/creator/:userId` - Get memberships for groups created by user

## Implementation Steps

### Phase 1: Backend API Updates
- [ ] 1.1 Add endpoint to get groups by creator ID
- [ ] 1.2 Add endpoint to get meetings for groups created by user
- [ ] 1.3 Add endpoint to get memberships for groups created by user

### Phase 2: Frontend API Updates
- [ ] 2.1 Update `frontend/src/lib/api/memberships-api.ts` with new endpoints
- [ ] 2.2 Update `frontend/src/lib/api/groups-api.ts` with new endpoints

### Phase 3: Dialog Components
- [ ] 3.1 Create `confirm-delete-user-dialog.tsx`
- [ ] 3.2 Create `confirm-delete-group-dialog.tsx`
- [ ] 3.3 Create `confirm-remove-member-dialog.tsx`
- [ ] 3.4 Create `respond-invite-dialog.tsx`
- [ ] 3.5 Export dialogs from `frontend/src/components/dashboard/`

### Phase 4: Refactored Dashboard Tables
- [ ] 4.1 Update `users-table.tsx` - Add delete dialog
- [ ] 4.2 Update `groups-table.tsx` - Filter by creator, add delete dialog
- [ ] 4.3 Update `meetings-table.tsx` - Filter by creator's groups
- [ ] 4.4 Update `members-table.tsx` - Filter by creator's groups, add remove dialog
- [ ] 4.5 Update `invites-table.tsx` - Add respond dialog
- [ ] 4.6 Update `notifications-table.tsx` - Add mark read dialog (optional)

### Phase 5: Navigation Refactor
- [ ] 5.1 Update `navbar.tsx` - Remove duplicate groups, add admin panel structure
- [ ] 5.2 Update `page.tsx` - Adjust dashboard layout

## API Endpoints Reference

### Current Backend Routes
```
GET    /api/v1/group                    - Get all groups (all authenticated)
POST   /api/v1/group                    - Create group (admin only)
POST   /api/v1/group/add-member         - Add member (admin only)
GET    /api/v1/group/memberships        - Get all memberships (all authenticated)
DELETE /api/v1/group/:groupId           - Delete group (admin only)
POST   /api/v1/group/:groupId/leave     - Leave group (any member)

GET    /api/v1/group-meeting            - Get all meetings (all authenticated)
POST   /api/v1/group-meeting            - Create meeting (admin only)
POST   /api/v1/group-meeting/response   - Respond to meeting invite

GET    /api/v1/user                     - Get all users (all authenticated)
DELETE /api/v1/user/:userId             - Delete user (admin only)

GET    /api/v1/notification/user        - Get user notifications (all authenticated)
PATCH  /api/v1/notification/:id/read    - Mark as read (owner only)
```

### New Endpoints to Add
```
GET    /api/v1/group/creator/:userId    - Get groups created by user
GET    /api/v1/group-meeting/creator/:userId - Get meetings for user's groups
GET    /api/v1/group/memberships/creator/:userId - Get memberships for user's groups
```

## Permission Matrix

| Feature | Admin | Member |
|---------|-------|--------|
| View all groups | Yes (all) | Yes (all) |
| View own created groups | Yes | Yes |
| Delete own created groups | Yes | No |
| View all users | Yes | Yes (limited) |
| Delete users | Yes | No |
| View all meetings | Yes | Yes |
| View meetings for own groups | Yes | Yes |
| View members of own groups | Yes | Yes |

