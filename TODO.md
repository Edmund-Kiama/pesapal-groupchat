# TODO - Group Meetings Feature Implementation

## Task
Implement group meetings functionality allowing admins to create meetings with invite options (all members or specific members), and members to respond to invites.

## Status: COMPLETED ✓

## API Layer
- [x] 1. Add group meeting API functions to `frontend/src/lib/api/groups-api.ts`

## New Components
- [x] 2. Create `create-meeting-form.tsx` - Form to create meetings with invite options
- [x] 3. Create `pending-meeting-invites.tsx` - Component to show user's meeting invites with accept/decline
- [x] 4. Create `meeting-list.tsx` - Component to display meetings for a group
- [x] 5. Create `checkbox.tsx` - UI component for checkboxes

## Integration
- [x] 6. Update `group-card.tsx` - Add "Manage Meetings" button for admins
- [x] 7. Update `groups/page.tsx` - Add "My Meetings" tab with pending invites
- [x] 8. Update `groups/index.ts` - Export new components

## Groups Page Tabs Fix - COMPLETED ✓
- Fixed local custom Tabs component definitions that were shadowing imports
- Changed `Tabs value={activeTab}` to `Tabs defaultValue="my-groups"`
- Removed unnecessary `onClick` handlers from `TabsTrigger` components
- Tabs now display correctly: "My Groups", "My Invitations", "My Meetings", "Sent Invites" (admin), "Invite Users" (admin)

## Files Created
- `frontend/src/components/ui/checkbox.tsx`
- `frontend/src/components/groups/create-meeting-form.tsx`
- `frontend/src/components/groups/pending-meeting-invites.tsx`
- `frontend/src/components/groups/meeting-list.tsx`

## Files Edited
- `frontend/src/lib/api/groups-api.ts`
- `frontend/src/components/groups/group-card.tsx`
- `frontend/src/app/groups/page.tsx` - Added "My Meetings" tab
- `frontend/src/components/groups/index.ts` - Added exports
- `frontend/src/components/groups/create-meeting-form.tsx` - Type fixes

## Groups Page Tabs (Final)
1. **My Groups** - Shows all groups user is a member of
2. **My Invitations** - Shows pending group invites
3. **My Meetings** - Shows pending meeting invites with accept/decline
4. **Sent Invites** (admin only) - Shows invites sent to other users
5. **Invite Users** (admin only) - Form to invite users to groups

