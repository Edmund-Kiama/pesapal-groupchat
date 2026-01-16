# Database Seeding Script

This document describes the seed file created to populate the database with demo data for testing and showcasing the project's capabilities.

## Overview

The `seed.js` script creates a comprehensive set of demo data including users, groups, memberships, invites, meetings, chat messages, and notifications. All users are created with the same password for easy testing.

## Running the Seed Script

### Prerequisites

1. Ensure all dependencies are installed:
   ```bash
   cd backend
   npm install
   ```

2. Make sure your database is configured in `.env.development.local` with the `DATABASE_URL` variable.

3. Run the seed script:
   ```bash
   npm run seed
   ```

### Important Notes

- The seed script uses `sequelize.sync({ force: true })` which **drops all existing tables** and recreates them. This means all existing data will be lost.
- Run this script only in development or testing environments.
- All operations are wrapped in a **transaction** - if any step fails, the entire seed process is rolled back, preventing partial/incomplete data and duplicate errors on re-run.

## Seeded Data

### Users (6 total)

| Email | Name | Role | Password |
|-------|------|------|----------|
| admin@grouplending.com | Admin User | admin | Password123 |
| john@example.com | John Doe | member | Password123 |
| jane@example.com | Jane Smith | member | Password123 |
| bob@example.com | Bob Johnson | member | Password123 |
| alice@example.com | Alice Williams | member | Password123 |
| charlie@example.com | Charlie Brown | member | Password123 |

### Dummy Election & Position

Since `VotingRight` has foreign key constraints to `Election` and `Position` tables, the script creates:
- 1 dummy Election: "Demo Election" (linked to Main Group)
- 1 dummy Position: "Demo Position"

These exist solely to satisfy database constraints.

### Voting Rights

All 6 users (including admin) have been granted voting rights linked to the dummy election/position.

### Groups (3 groups)

1. **Main Group** - Created by Admin
   - Description: "The main group created by admin for all users"
   - Members: Admin, John, Jane, Bob (4 members)
   - 2 pending invites: Alice, Charlie

2. **Tech Discussion Group** - Created by John Doe
   - Description: "A group for discussing the latest in technology"
   - Members: John, Jane, Charlie

3. **Book Club** - Created by Bob Johnson
   - Description: "Monthly book discussions and reviews"
   - Members: Bob, Alice, Charlie

### Group Invites (4 invites)

| Sender | Receiver | Group | Status |
|--------|----------|-------|--------|
| Admin User | Alice Williams | Main Group | pending |
| Admin User | Charlie Brown | Main Group | pending |
| Jane Smith | Bob Johnson | Tech Discussion Group | pending |
| Bob Johnson | Alice Williams | Tech Discussion Group | declined |

### Group Meetings (3 meetings)

1. **All Hands Meeting** - Main Group
   - Location: "Main Conference Hall"
   - Date: Tomorrow
   - Created by: Admin
   - Attendees: Admin, John, Jane, Bob (all 4 current members)

2. **Team Sync** - Tech Discussion Group
   - Location: "Virtual - Zoom"
   - Date: Next week
   - Created by: John
   - Attendees: John, Jane, Charlie (3 members)

3. **Monthly Discussion** - Book Club
   - Location: "Community Library"
   - Date: Next month
   - Created by: Bob
   - Attendees: Bob, Alice, Charlie (3 members)

### Group Meeting Invites (10 invites)

| Meeting | User | Status |
|---------|------|--------|
| All Hands Meeting | Admin | accepted |
| All Hands Meeting | John | accepted |
| All Hands Meeting | Jane | pending |
| All Hands Meeting | Bob | accepted |
| Team Sync | John | accepted |
| Team Sync | Jane | pending |
| Team Sync | Charlie | declined |
| Monthly Discussion | Bob | accepted |
| Monthly Discussion | Alice | accepted |
| Monthly Discussion | Charlie | pending |

### Group Chat Messages (10 messages)

**Main Group:**
1. "Welcome to Main Group! This is the primary group for all members." - Admin
2. "Thanks for creating this group, Admin! Looking forward to great collaboration." - John
3. "Excited to be part of this group!" - Jane
4. "Great to have everyone here!" - Bob

**Tech Discussion Group:**
1. "Welcome to the Tech Discussion Group! 🎉" - John
2. "Has anyone seen the latest AI developments?" - Bob
3. "Yes! The new GPT models are impressive." - John

**Book Club:**
1. "Welcome to the Book Club! 📚" - Bob
2. "What books are we reading this month?" - Alice
3. "I suggest we read 'The Great Gatsby' for our next meeting." - Charlie

### Notifications (24 notifications)

Various notifications for all users covering:
- GROUP_CREATED
- GROUP_MEMBER_ADDED
- GROUP_INVITE_CREATED
- GROUP_MEETING_CREATED
- GROUP_MEETING_INVITATION
- GROUP_MEETING_ACCEPTED
- GROUP_MEETING_DECLINED
- USER_CREATION
- ADMIN_CREATION

## Testing Scenarios

The seeded data supports the following testing scenarios:

### Admin Features
- Admin created Main Group with 4 members
- Admin sent 2 group invites (Alice, Charlie)
- Admin created All Hands Meeting with all 4 members

### Group Management
- Main Group has 4 members and 2 pending invites
- View all 3 groups with different member configurations
- See group invites in different states (pending, accepted, declined)

### Meetings
- **Meeting 1 (All Hands)**: All 4 Main Group members invited
- **Meeting 2 (Team Sync)**: 3 Tech Discussion Group members invited
- **Meeting 3 (Monthly Discussion)**: 3 Book Club members invited
- Mix of accepted, pending, and declined meeting invites

### Chat
- See chat history in each group
- Real-world conversation samples

### Notifications
- Each user has personalized notifications
- Different notification types for various events

## Models Not Included in Seeding

As requested, the following models are not seeded since they are not implemented on the frontend:
- **Candidate** - For election candidates
- **Vote** - For voting functionality

The **Position** and **Election** models have 1 dummy record each (created to satisfy VotingRight constraints).

## Transaction Safety

The entire seeding process is wrapped in a Sequelize transaction. This means:
- If any step fails, ALL changes are rolled back
- You can safely re-run the script without worrying about partial data
- No duplicate/incomplete data will remain in the database on error

## Reset and Reseed

To reset the database and reseed:
```bash
npm run seed
```

