****# Group Lending Platform

A modern, full-featured group management platform built with **Next.js 16** (TypeScript) for the frontend and **Node.js** with **PostgreSQL** for the backend. This platform enables groups to manage meetings, send invitations, and communicate through real-time group chat functionality.

**Live Demo**:
- Frontend: [https://pesapal-groupchat.vercel.app](https://pesapal-groupchat.vercel.app) (Vercel)
- Backend: [https://pesapal-groupchat-production.up.railway.app](https://pesapal-groupchat-production.up.railway.app) (Railway)

### Demo Accounts

| Email | Name | Role | Password |
|-------|------|------|----------|
| admin@grouplending.com | Admin User | admin | Password123 |
| john@example.com | John Doe | member | Password123 |
| jane@example.com | Jane Smith | member | Password123 |
| bob@example.com | Bob Johnson | member | Password123 |
| alice@example.com | Alice Williams | member | Password123 |
| charlie@example.com | Charlie Brown | member | Password123 |


---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Setup \& Configuration](#setup--configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

The Group Lending Platform is a comprehensive solution for managing group-based organizations and facilitating collaborative decision-making. While the backend fully supports password resets and an election and voting system, the frontend implementation for these features is pending future development.

The system consists of two main components:

### Frontend
A **Next.js 16** application that provides a responsive, modern user interface for interacting with the backend PostgreSQL database.

### Backend
A **Node.js + Express** application that handles API requests, authentication, business logic, and database operations using Sequelize ORM.

---

## Tech Stack

### Frontend Technologies

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router for full-stack capabilities |
| **TypeScript** | Type-safe JavaScript for better developer experience |
| **React Query (TanStack)** | Server state management, caching, and data fetching |
| **Zustand** | Client state management for authentication and UI state |
| **Tailwind CSS** | Utility-first CSS framework for responsive design |
| **Radix UI** | Unstyled, accessible UI components |
| **Lucide React** | Beautiful icon library |
| **React Hook Form + Yup** | Form handling and validation |
| **Sonner** | Toast notifications |
| **clsx & tailwind-merge** | Conditional className utility functions |

### Backend Technologies

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime for server-side execution |
| **Express.js** | Web framework for building REST APIs |
| **PostgreSQL 14** | Relational database with JSONB support |
| **Sequelize** | Promise-based Node.js ORM for PostgreSQL |
| **JWT (jsonwebtoken)** | Token-based authentication |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Email sending capability |
| **pg** | PostgreSQL client for Node.js |

---

## Usage

### Getting Started

1. **Sign Up for an Account**
   - Navigate to the signup page
   - Enter your name, **real email address** (in order to receive notification emails), and password
   - Click "Create Account" to register as a regular member
   - **Note:** If you provide a real email address, you will receive email notifications from the app (e.g., password reset emails, group invitations, meeting reminders, and other important updates)

2. **Log In**
   - Use your registered email and password
   - JWT tokens persist for 7 days for convenient access

### Group Management

**Creating a Group (Admin Only):**
- Click "Create Group" on the dashboard
- Enter a group name and optional description
- Submit to create the group (you become the group creator)

**Joining a Group:**
- Browse available groups on the Groups page
- Request to join or wait for an admin invitation
- Once accepted, you'll see the group in your groups list

**Leaving a Group:**
- Open the group details page
- Click "Leave Group" (not available for group creators)

### Meeting Scheduling

**Creating a Meeting (Admin Only):**
- Navigate to a group page
- Click "Schedule Meeting"
- Set the meeting date, time, and location
- Select members to invite or invite all group members
- Send invitations

**Responding to Meeting Invites:**
- Check your notifications or pending meeting invites
- Accept or decline each invitation
- View accepted meetings in your meetings list

### Group Chat

**Sending Messages:**
- Open any group you're a member of
- Type a message in the chat input
- Press Enter or click Send
- Messages appear in real-time for all group members

**Viewing Message History:**
- All messages are stored per group
- Scroll up to view previous conversations

### Managing Invitations

**Sending Group Invites (Admin Only):**
- Go to a group's management page
- Click "Invite Users"
- Enter the email addresses of users to invite
- Send invitations

**Responding to Invites:**
- Check your notifications or "Received Invites" section
- Accept or decline each invitation
- Accepted invites add you to the group immediately

### Admin Features

**User Management:**
- Admins can view all registered users
- Delete user accounts if needed
- Create new admin accounts

**Group Administration:**
- Create new groups
- Add or remove group members
- Delete existing groups

**Invitation Management:**
- Send invitations to any user
- Cancel pending invitations before they're accepted

---

## Features

### User Features

1. **Authentication**
   - Secure signup and login with email/password
   - JWT-based session management with 7-day expiration
   - Password reset via email (sends reset link to user's email)
   - Role-based access control (Admin/Member)
   - Email notifications for important account events

2. **Group Management**
   - Create and join groups
   - View group members and details
   - Leave groups (non-creator members)
   - Admin-only group creation and deletion

3. **Group Communication**
   - Real-time group chat messaging
   - Chat message history per group
   - Message deletion capability

4. **Meeting Scheduling**
   - Create meetings with date/time and location
   - Invite specific users or all group members via email
   - Accept/decline meeting invitations
   - View meeting history and upcoming meetings
   - Email notifications for meeting invitations and reminders

5. **Invitations**
   - Send group invitations to users via email
   - Accept/decline pending invitations
   - View sent and received invitations
   - Cancel pending invitations (admin)
   - Email notifications for received invitations

6. **Notifications**
   - Real-time notifications for:
     - Group creations and membership changes
     - Invites (group and meeting)
     - Election announcements
     - Candidate nominations
   - Mark as read functionality
   - Email notifications for important updates

### Admin Features

1. **User Management**
   - View all registered users
   - Delete user accounts
   - Create admin accounts

2. **Group Administration**
   - Create new groups
   - Add/remove group members
   - Delete groups

3. **Invitation Management**
   - Send invitations to users
   - Cancel pending invitations

---

## Project Structure

```
pesapal/
├── backend/                      # Node.js + Express Backend
│   ├── app.js                   # Express application entry point
│   ├── package.json             # Backend dependencies
│   ├── config/                  # Configuration files
│   │   ├── config.cjs           # Sequelize configuration
│   │   └── env.js               # Environment variables
│   ├── controllers/             # Request handlers (business logic)
│   │   ├── auth.controller.js
│   │   ├── candidate.controller.js
│   │   ├── election.controller.js
│   │   ├── group-chat.controller.js
│   │   ├── group-invite.controller.js
│   │   ├── group-meeting.controller.js
│   │   ├── group.controller.js
│   │   ├── notification.controller.js
│   │   ├── position.controller.js
│   │   ├── user.controller.js
│   │   └── vote.controller.js
│   ├── database/                # Database connection and setup
│   │   ├── connect-db.js
│   │   └── db.js
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.js   # JWT authentication
│   │   └── error.middleware.js  # Error handling
│   ├── migrations/              # Database migrations
│   ├── models/                  # Sequelize models
│   │   ├── candidate.model.js
│   │   ├── election.model.js
│   │   ├── group-chat.model.js
│   │   ├── group-invite.model.js
│   │   ├── group-meeting-invite.model.js
│   │   ├── group-meeting.model.js
│   │   ├── group-member.model.js
│   │   ├── group.model.js
│   │   ├── index.js
│   │   ├── notification.model.js
│   │   ├── position.model.js
│   │   ├── user.model.js
│   │   ├── vote.model.js
│   │   └── voting-right.model.js
│   ├── router/                  # API routes
│   │   ├── auth.route.js
│   │   ├── candidate.route.js
│   │   ├── election.route.js
│   │   ├── group-chat.route.js
│   │   ├── group-invite.route.js
│   │   ├── group-meeting.route.js
│   │   ├── group.route.js
│   │   ├── notification.route.js
│   │   ├── position.route.js
│   │   ├── user.route.js
│   │   └── vote.route.js
│   ├── test/                    # Test files
│   ├── utils/                   # Utility functions
│   │   ├── date-time.format.js
│   │   └── send-email.js
│   └── README.md                # Backend documentation
│
├── frontend/                    # Next.js 16 Frontend
│   ├── package.json             # Frontend dependencies
│   ├── next.config.ts           # Next.js configuration
│   ├── tailwind.config.mjs      # Tailwind CSS configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── eslint.config.mjs        # ESLint configuration
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── admin/           # Admin dashboard
│   │   │   │   └── groups/      # Admin group management
│   │   │   ├── groups/          # Group pages
│   │   │   │   ├── [id]/        # Group detail page
│   │   │   │   └── page.tsx     # Groups list
│   │   │   ├── login/           # Login page
│   │   │   ├── signup/          # Signup page
│   │   │   ├── globals.css      # Global styles
│   │   │   ├── layout.tsx       # Root layout
│   │   │   └── page.tsx         # Home page
│   │   ├── components/          # React components
│   │   │   ├── dashboard/       # Dashboard components
│   │   │   │   ├── groups-table.tsx
│   │   │   │   ├── invites-table.tsx
│   │   │   │   ├── meetings-table.tsx
│   │   │   │   ├── members-table.tsx
│   │   │   │   ├── notifications-table.tsx
│   │   │   │   ├── users-table.tsx
│   │   │   │   └── dialogs/     # Dialog components
│   │   │   ├── groups/          # Group-related components
│   │   │   │   ├── chat/        # Chat components
│   │   │   │   ├── create-group-form.tsx
│   │   │   │   ├── create-meeting-form.tsx
│   │   │   │   ├── invite-user-form.tsx
│   │   │   │   ├── meeting-list.tsx
│   │   │   │   └── ...
│   │   │   ├── providers/       # Context providers
│   │   │   ├── ui/              # UI component library
│   │   │   ├── navbar.tsx       # Navigation bar
│   │   │   ├── notification-bell.tsx
│   │   │   └── user-selector.tsx
│   │   └── lib/                 # Utility functions and configurations
│   │       ├── api/             # API service modules
│   │       │   ├── auth-api.ts
│   │       │   ├── groups-api.ts
│   │       │   ├── invites-api.ts
│   │       │   ├── memberships-api.ts
│   │       │   ├── notifications-api.ts
│   │       │   └── users-api.ts
│   │       ├── context/         # React contexts
│   │       ├── hooks/           # Custom React hooks
│   │       ├── stores/          # Zustand state stores
│   │       │   ├── auth-store.ts
│   │       │   └── active-user-store.ts
│   │       ├── typings/         # TypeScript type definitions
│   │       │   └── models.ts
│   │       └── validations/     # Form validation schemas
│   └── README.md                # Frontend documentation
│
└── README.md                    # This file
```

---

## Database Schema

The PostgreSQL database uses **Sequelize ORM** with the following core models and relationships:

### Core Models

#### User Model
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Primary key (auto-increment) |
| `name` | String | User's display name (2-30 chars) |
| `email` | String | Unique, valid email format |
| `password` | String | Hashed password (min 6 chars) |
| `role` | Enum | `admin` or `member` |
| `resetPasswordToken` | String | Password reset token (optional) |
| `resetPasswordExpires` | Date | Token expiration (optional) |

#### Group Model
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Primary key |
| `name` | String | Group name (required) |
| `description` | String | Group description (optional) |
| `created_by` | Integer | FK → `User.id` (group creator) |

### Communication Models

#### GroupMember
Links users to groups with many-to-many relationship
- `userId` → FK to `User`
- `groupId` → FK to `Group`
- `joined_at` → Timestamp of joining

#### GroupChat
Real-time messaging within groups
- `content` → Message text
- `senderId` → FK to `User` (message author)
- `groupId` → FK to `Group`

#### GroupInvite
User invitation system
- `senderId` → FK to `User` (who sent invite)
- `receiverId` → FK to `User` (who receives invite)
- `groupId` → FK to `Group`
- `status` → Enum: `pending`, `accepted`, `declined`

#### GroupMeeting
Meeting scheduling with invite tracking
- `location` → Meeting location
- `groupId` → FK to `Group`
- `created_by` → FK to `User`
- `time` → JSONB: `{ from: Date, to: Date }`
- `invited` → JSONB: Array of invited user IDs

### Election & Voting Models

#### Election
Top-level election container
- `date_from` → Election start date
- `date_to` → Election end date
- `groupId` → FK to `Group`
- `created_by` → FK to `User`

#### Position
Specific roles within an election (e.g., "President", "Secretary")
- `position` → Role name
- `electionId` → FK to `Election`
- `created_by` → FK to `User`

#### Candidate
Users running for a position
- `userId` → FK to `User` (candidate)
- `positionId` → FK to `Position`
- `electionId` → FK to `Election`
- `nominated_by` → FK to `User` (who nominated)

#### VotingRight
Permissions to vote
- `userId` → FK to `User`
- `electionId` → FK to `Election`
- `positionId` → FK to `Position`
- `has_voted` → Boolean (default: false)

#### Vote
Actual vote records
- `userId` → FK to `User` (voter)
- `electionId` → FK to `Election`
- `positionId` → FK to `Position`
- `candidateId` → FK to `Candidate`

### Utility Models

#### Notification
User notifications for system events
- `userId` → FK to `User`
- `type` → Enum of notification types (GROUP_CREATED, ELECTION_CREATED, etc.)
- `message` → Notification text
- `metadata` → JSONB with related references
- `isRead` → Boolean (default: false)

### Database Relationships Summary

```
User ──< VotingRight >── Election
User ──< GroupMember >── Group
User ──< GroupInvite >── User (sender/receiver)
User ──< Candidate >── Position
User ──< Vote >── Candidate
User ──< GroupChat >── Group
User ──< GroupMeeting >── Group
User ──< Notification >

Election ──< Position >── Candidate
Election ──< Vote >
Election ──< VotingRight >

Group ──< GroupMember >
Group ──< GroupInvite >
Group ──< GroupChat >
Group ──< GroupMeeting >
Group ──< Election >
```

---

## API Documentation

### Authentication API (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/sign-up` | Register new member | No |
| POST | `/auth/admin/sign-up` | Register new admin | No |
| POST | `/auth/log-in` | User login | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password/:token` | Reset password | No |

### Group Management API (`/api/v1/group`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/group` | Get all groups | Yes |
| POST | `/group` | Create new group | Admin Only |
| GET | `/group/:groupId` | Get group details | Yes |
| GET | `/group/:groupId/members` | Get group members | Yes |
| GET | `/group/user/:userId/groups` | Get user's groups | Yes |
| POST | `/group/add-member` | Add member to group | Admin Only |
| DELETE | `/group/:groupId` | Delete group | Admin Only |
| POST | `/group/:groupId/leave` | Leave group | Yes |

### Group Invite API (`/api/v1/group-invite`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/group-invite` | Create group invite | Admin Only |
| GET | `/group-invite/receiver/:receiverId` | Get received invites | Yes |
| GET | `/group-invite/sender/:senderId` | Get sent invites | Yes |
| POST | `/group-invite/response` | Accept/decline invite | Yes |
| DELETE | `/group-invite/:inviteId` | Cancel invite | Admin Only |

### Group Chat API (`/api/v1/group-chat`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/group-chat/group/:groupId` | Get group chats | Yes |
| POST | `/group-chat` | Send chat message | Yes |
| DELETE | `/group-chat/:chatId` | Delete chat message | Yes |

### Group Meeting API (`/api/v1/group-meeting`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/group-meeting` | Get all meetings | Yes |
| POST | `/group-meeting` | Create meeting | Admin Only |
| GET | `/group-meeting/group/:groupId` | Get group meetings | Yes |
| POST | `/group-meeting/response` | Respond to meeting invite | Yes |

### User API (`/api/v1/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user` | Get all users | Admin Only |
| DELETE | `/user/:userId` | Delete user | Admin Only |

### Election API (`/api/v1/election`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/election` | Get all elections | Yes |
| POST | `/election` | Create election | Admin Only |
| GET | `/election/:electionId` | Get election details | Yes |
| GET | `/election/group/:groupId` | Get group elections | Yes |

### Position API (`/api/v1/position`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/position` | Get all positions | Yes |
| POST | `/position` | Create position | Admin Only |
| GET | `/position/election/:electionId` | Get election positions | Yes |

### Candidate API (`/api/v1/candidate`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/candidate` | Get all candidates | Yes |
| POST | `/candidate` | Nominate candidate | Admin Only |
| GET | `/candidate/election/:electionId` | Get election candidates | Yes |

### Vote API (`/api/v1/vote`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/vote` | Get all votes | Yes |
| POST | `/vote` | Cast vote | Yes |
| GET | `/vote/election/:electionId` | Get election votes | Admin Only |

### Notification API (`/api/v1/notification`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notification` | Get user notifications | Yes |
| POST | `/notification` | Create notification | Yes |
| PUT | `/notification/:notificationId/read` | Mark as read | Yes |

---

## Setup & Configuration

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- PostgreSQL 14 database
- Running backend server (default: `http://localhost:3001`)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file in the backend root directory:
```env
DATABASE_URL=postgresql://username:password@host:port/dbname
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

4. **Start the server:**
```bash
node app.js
```

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env.local` file in the frontend root directory:
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001/api/v1
```

4. **Run development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Frontend Deployment (Vercel)

The frontend is deployed on **Vercel** with the following configuration:

- **Platform**: Vercel (Next.js native hosting)
- **Region**: Auto-selected (usually closest to users)
- **Environment**: Production
- **URL**: [https://pesapal-groupchat.vercel.app](https://pesapal-groupchat.vercel.app)

#### Deployment Steps:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in Vercel
3. Configure environment variables:
   - `NEXT_PUBLIC_SERVER_URL`: Your backend API URL
4. Deploy

### Backend Deployment (Railway)

The backend is deployed on **Railway** with the following configuration:

- **Platform**: Railway
- **Region**: Auto-selected (usually closest to users)
- **Environment**: Production
- **URL**: [https://pesapal-groupchat-production.up.railway.app](https://pesapal-groupchat-production.up.railway.app)

#### Deployment Steps:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in Railway
3. Configure environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Your JWT secret key
   - `JWT_EXPIRES_IN`: Token expiration (e.g., 7d)
   - `EMAIL_USER`: Your email for notifications
   - `EMAIL_PASS`: Your email password or app password
4. Deploy

### Backend Requirements for Production

For the frontend to work properly in production, you need a running backend server:

- **Technology**: Node.js + Express
- **Database**: PostgreSQL 14
- **API URL**: Must be accessible from the Vercel frontend
- **CORS**: Must allow requests from your Vercel domain

Example backend CORS configuration:

```javascript
import cors from "cors";

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://pesapal-groupchat.vercel.app"
  ],
  credentials: true,
}));
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## AI Assistance

The frontend of this project was **partially developed with the assistance of AI**. AI tools were used to optimize components, improve type definitions, and assist with debugging during the development process. All AI-generated code was reviewed, tested, and integrated by the developers to ensure quality and correctness.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [Sequelize ORM](https://sequelize.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

