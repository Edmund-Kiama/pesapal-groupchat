# Dashboard CRUD Tables Implementation Plan

## Overview
Add comprehensive tables to the dashboard demonstrating CRUD operations for User, Notification, Group, Group Meeting, and Group Invite models.

## Excluded Models (Not Yet Implemented on Frontend)
- Candidate
- Election
- Position
- Vote

## Implementation Steps

### Phase 1: Infrastructure & API Layer ✅
- [x] 1.1 Create `frontend/src/lib/api/users-api.ts` - API for user CRUD operations
- [x] 1.2 Create `frontend/src/lib/api/memberships-api.ts` - API for group membership CRUD
- [x] 1.3 Create `frontend/src/lib/api/invites-api.ts` - API for invite CRUD operations

### Phase 2: Reusable Table Components ✅
- [x] 2.1 Create `frontend/src/components/ui/table.tsx` - Reusable DataTable component

### Phase 3: Dashboard Table Components ✅
- [x] 3.1 Create `frontend/src/components/dashboard/users-table.tsx` - Users Management Table
- [x] 3.2 Create `frontend/src/components/dashboard/notifications-table.tsx` - Notifications Table
- [x] 3.3 Create `frontend/src/components/dashboard/groups-table.tsx` - Groups Table
- [x] 3.4 Create `frontend/src/components/dashboard/meetings-table.tsx` - Group Meetings Table
- [x] 3.5 Create `frontend/src/components/dashboard/invites-table.tsx` - Group Invites Table
- [x] 3.6 Create `frontend/src/components/dashboard/members-table.tsx` - Group Members Table
- [x] 3.7 Create `frontend/src/components/dashboard/index.ts` - Export all dashboard components

### Phase 4: Update Dashboard Page ✅
- [x] 4.1 Update `frontend/src/app/page.tsx` - Integrate all tables into dashboard with tabs

## Table Specifications

### Users Table
| Column | Type | Actions |
|--------|------|---------|
| ID | number | - |
| Name | string | - |
| Email | string | - |
| Role | badge | - |
| Created At | date | - |
| Actions | - | Delete |

### Notifications Table
| Column | Type | Actions |
|--------|------|---------|
| ID | number | - |
| Type | badge | - |
| Message | string | - |
| Related Entity | string | - |
| Status | badge | - |
| Created At | date | - |
| Actions | - | Mark Read |

### Groups Table
| Column | Type | Actions |
|--------|------|---------|
| ID | number | - |
| Name | string | - |
| Description | string | - |
| Created By | string | - |
| Member Count | number | - |
| Actions | - | View, Delete |

### Group Meetings Table
| Column | Type | Actions |
|--------|------|---------|
| ID | number | - |
| Meeting | string | - |
| Group | string | - |
| Location | string | - |
| Time From | date | - |
| Time To | date | - |
| Organizer | string | - |
| Invites | badge | - |
| Actions | - | View Details |

### Group Invites Table
| Column | Type | Actions |
|--------|------|---------|
| ID | number | - |
| Sender | string | - |
| Receiver | string | - |
| Group | string | - |
| Status | badge | - |
| Created At | date | - |
| Actions | - | Accept, Decline, Cancel |

### Group Members Table
| Column | Type | Actions |
|--------|------|---------|
| ID | number | - |
| Member Name | string | - |
| Email | string | - |
| Group | string | - |
| Role | badge | - |
| Joined At | date | - |
| Actions | - | Remove |

## Features
- **Tabbed Interface**: Dashboard organized with tabs for easy navigation
- **Admin-Only Sections**: Users and Members tables only visible to admins
- **CRUD Operations**: 
  - Users: View, Delete
  - Notifications: View, Mark as read
  - Groups: View, Delete (admin)
  - Meetings: View, View details
  - Invites: View, Accept/Decline, Cancel
  - Members: View, Remove (admin)
- **Responsive Tables**: Tables with proper styling and actions
- **Loading States**: Loading indicators during API calls
- **Error Handling**: Error messages with retry capability
- **Toast Notifications**: Feedback for user actions

## Dependencies
- Already available UI components (Button, Card, Badge, Input, Dialog, etc.)
- Existing API endpoints in backend
- Existing auth store and hooks
- sonner for toast notifications

## Notes
- All tables are responsive
- Admin-only tables check user role
- Actions show loading states
- Tables handle empty states gracefully
- Uses proper error handling and toast notifications

