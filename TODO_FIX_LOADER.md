# Fix Loader Spinning on Both Buttons

## Problem
When responding to group invites and meeting invites, both the accept and decline buttons show the spinning loader icon, even though only one button was clicked.

## Root Cause
Both files use a single `respondingId` state variable. When either button is clicked, it sets `respondingId` to that invite's ID. Since **both buttons check the same condition** (`respondingId === invite.id`), both buttons show the loader.

## Solution
Track the **responding action** (accept/decline) in addition to the invite ID. Only show the loader on the button that was clicked.

## Tasks

### 1. Fix pending-group-invites.tsx
- [x] Change state from `respondingId: number | null` to `respondingInvite: { id: number, action: "accepted" | "declined" } | null`
- [x] Update `setRespondingId` calls to include the action
- [x] Update button conditions to check both ID and action
- [x] Only show loader on the button that was clicked

### 2. Fix pending-meeting-invites.tsx
- [x] Same changes as above

### 3. Fix received-invites.tsx
- [x] Same changes as above

## Expected Result
When user clicks "Accept" on an invite:
- Only the Accept button shows the spinner
- The Decline button remains enabled and clickable

When user clicks "Decline" on an invite:
- Only the Decline button shows the spinner
- The Accept button remains enabled and clickable

