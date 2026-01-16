# Minimal Meeting Card Implementation

## Goal
Make meeting details in the group chat minimal and simple, taking less space.

## Changes

### 1. Create MinimalMeetingCard Component
**File:** `frontend/src/components/groups/minimal-meeting-card.tsx`

- Compact single-line layout where possible
- Date + Time combined (e.g., "Mon, Dec 15 • 2:00-3:30 PM")
- Location (compact)
- Status badge (small)
- Attendee count (e.g., "3/5")
- Expandable for full details (admin sees attendees list)

### 2. Update MeetingList Component
**File:** `frontend/src/components/groups/meeting-list.tsx`

- Import and use `MinimalMeetingCard` instead of inline meeting card
- Remove verbose layout, use minimal design

## Implementation Steps

- [x] Create `minimal-meeting-card.tsx` with compact design
- [x] Update `meeting-list.tsx` to use the new component
- [x] Test the new minimal meeting display

