# Group Lending Platform - Frontend

A modern, full-featured group lending and management platform built with **Next.js 16** (TypeScript) for the frontend and **Node.js** with **PostgreSQL** for the backend. This platform enables groups to manage elections, voting, meetings, and real-time group chat functionality.

**Live Demo**: [https://pesapal-groupchat.vercel.app](https://pesapal-groupchat.vercel.app)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Frontend-Backend Architecture](#frontend-backend-architecture)
- [Tech Stack](#tech-stack)
- [API Communication Flow](#api-communication-flow)
- [Database Schema](#database-schema)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup & Configuration](#setup--configuration)
- [Deployment](#deployment)

---

## Project Overview

The Group Lending Platform is a comprehensive solution for managing group-based organizations, elections, and decision-making processes. The frontend is a **Next.js 16** application that provides a responsive, modern user interface for interacting with the backend PostgreSQL database.

### Core Functionality

- **Group Management**: Create, join, and manage groups with role-based access control
- **Real-time Chat**: Group chat functionality for communication within groups
- **Elections & Voting**: Complete election management system with candidates and voting rights
- **Meetings**: Schedule and manage group meetings with invite systems
- **Notifications**: Real-time notifications for group activities, invites, and elections
- **User Authentication**: Secure JWT-based authentication with role management (Admin/Member)

---

## Frontend-Backend Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 16)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ React Query  │  │   Zustand    │  │   React Components   │   │
│  │   (Data)     │  │  (State)     │  │      (UI)            │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│         └─────────────────┼──────────────────────┘               │
│                           ▼                                      │
│              ┌─────────────────────────────┐                     │
│              │   API Service Layer         │                     │
│              │   (src/lib/api/)            │                     │
│              └─────────────┬───────────────┘                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTPS (REST API)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Node.js + Express)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Routes     │  │ Controllers  │  │    Middleware        │   │
│  │  (/api/v1)   │  │  (Logic)     │  │  (Auth, Error)       │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│         └─────────────────┼──────────────────────┘               │
│                           ▼                                      │
│              ┌─────────────────────────────┐                     │
│              │   Sequelize ORM             │                     │
│              └─────────────┬───────────────┘                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database (14-model)                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │  User   │ │  Group  │ │Election │ │ Position│ │Candidate│    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │   Vote  │ │Voting   │ │ Group   │ │ Group   │ │ Group   │    │
│  │         │ │  Right  │ │ Member  │ │  Chat   │ │ Meeting │    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action**: User interacts with the React UI (e.g., clicking "Create Group")
2. **State Management**: Zustand manages authentication state; React Query caches server state
3. **API Call**: Frontend sends HTTP request to backend REST API with JWT token
4. **Authentication**: Backend middleware validates JWT and checks user roles
5. **Business Logic**: Controller processes request and interacts with Sequelize models
6. **Database Operation**: Sequelize executes PostgreSQL queries with proper relationships
7. **Response**: Backend returns JSON response to frontend
8. **UI Update**: React Query updates cached data and triggers re-render

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

## API Communication Flow

### Authentication Flow

```
┌─────────────┐                         ┌────────────────┐
│   Frontend  │                         │    Backend     │
└──────┬──────┘                         └───────┬────────┘
       │                                        │
       │  POST /api/v1/auth/log-in              │
       │  { email, password }                   │
       │ ──────────────────────────────────────►│
       │                                        │
       │                            Validate    │
       │                            credentials │
       │                            Generate    │
       │                            JWT token   │
       │                                        │
       │  { success: true, data: { user, token }│
       │◄───────────────────────────────────────│
       │                                        │
       │  Store token in Zustand + LocalStorage │
       │  (auth-storage)                        │
       │                                        │
       │  Subsequent requests include:          │
       │  Authorization: Bearer <token>         │
       ▼                                        ▼
```

### API Endpoints Reference

#### Authentication API (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/sign-up` | Register new member | No |
| POST | `/auth/admin/sign-up` | Register new admin | No |
| POST | `/auth/log-in` | User login | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password/:token` | Reset password | No |

#### Group Management API (`/api/v1/group`)

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

#### Group Invite API (`/api/v1/group-invite`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/group-invite` | Create group invite | Admin Only |
| GET | `/group-invite/receiver/:receiverId` | Get received invites | Yes |
| GET | `/group-invite/sender/:senderId` | Get sent invites | Yes |
| POST | `/group-invite/response` | Accept/decline invite | Yes |
| DELETE | `/group-invite/:inviteId` | Cancel invite | Admin Only |

#### Group Chat API (`/api/v1/group-chat`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/group-chat/group/:groupId` | Get group chats | Yes |
| POST | `/group-chat` | Send chat message | Yes |
| DELETE | `/group-chat/:chatId` | Delete chat message | Yes |

#### Group Meeting API (`/api/v1/group-meeting`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/group-meeting` | Get all meetings | Yes |
| POST | `/group-meeting` | Create meeting | Admin Only |
| GET | `/group-meeting/group/:groupId` | Get group meetings | Yes |
| POST | `/group-meeting/response` | Respond to meeting invite | Yes |

#### User API (`/api/v1/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user` | Get all users | Admin Only |
| DELETE | `/user/:userId` | Delete user | Admin Only |

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

## Features

### User Features

1. **Authentication**
   - Secure signup and login with email/password
   - JWT-based session management with 7-day expiration
   - Password reset via email
   - Role-based access control (Admin/Member)

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
   - Invite specific users or all group members
   - Accept/decline meeting invitations
   - View meeting history and upcoming meetings

5. **Invitations**
   - Send group invitations to users
   - Accept/decline pending invitations
   - View sent and received invitations
   - Cancel pending invitations (admin)

6. **Notifications**
   - Real-time notifications for:
     - Group creations and membership changes
     - Invites (group and meeting)
     - Election announcements
     - Candidate nominations
   - Mark as read functionality

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

### Election & Voting (Backend Ready)

- Create elections with date ranges
- Define positions within elections
- Nominate candidates for positions
- Grant voting rights to eligible members
- Cast votes for candidates
- Track voting status per user/position

---

## Project Structure

```
frontend/
├── public/                     # Static assets
│   ├── next.svg
│   ├── vercel.svg
│   └── ...
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── groups/             # Group pages (list, detail)
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── groups-table.tsx
│   │   │   ├── invites-table.tsx
│   │   │   ├── meetings-table.tsx
│   │   │   ├── members-table.tsx
│   │   │   ├── notifications-table.tsx
│   │   │   ├── users-table.tsx
│   │   │   └── dialogs/        # Dialog components
│   │   ├── groups/             # Group-related components
│   │   │   ├── chat/           # Chat components
│   │   │   ├── create-group-form.tsx
│   │   │   ├── create-meeting-form.tsx
│   │   │   ├── invite-user-form.tsx
│   │   │   ├── meeting-list.tsx
│   │   │   └── ...
│   │   ├── providers/          # Context providers
│   │   ├── ui/                 # UI component library
│   │   └── navbar.tsx          # Navigation bar
│   ├── lib/                    # Utility functions and configurations
│   │   ├── api/                # API service modules
│   │   │   ├── auth-api.ts
│   │   │   ├── groups-api.ts
│   │   │   ├── invites-api.ts
│   │   │   ├── memberships-api.ts
│   │   │   ├── notifications-api.ts
│   │   │   └── users-api.ts
│   │   ├── context/            # React contexts
│   │   ├── hooks/              # Custom React hooks
│   │   ├── stores/             # Zustand state stores
│   │   │   ├── auth-store.ts   # Authentication state
│   │   │   └── ...
│   │   ├── typings/            # TypeScript type definitions
│   │   │   └── models.ts       # Database model types
│   │   ├── validations/        # Form validation schemas
│   │   └── utils.ts            # Utility functions
│   └── ...
├── package.json
├── next.config.ts              # Next.js configuration
├── tailwind.config.mjs         # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── eslint.config.mjs           # ESLint configuration
```

### Key Directories

- **`src/lib/api/`** - Centralized API service layer for all backend communication
- **`src/lib/stores/`** - Zustand stores for managing authentication and application state
- **`src/lib/typings/`** - TypeScript interfaces matching backend database models
- **`src/components/ui/`** - Reusable UI components built with Radix UI and Tailwind

---

## Setup & Configuration

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm
- Access to PostgreSQL 14 database
- Running backend server (default: `http://localhost:3001`)

### Environment Variables

Create a `.env.local` file in the frontend root directory:

```env
# Backend Server URL (required for API calls)
NEXT_PUBLIC_SERVER_URL=http://localhost:3001/api/v1

# Optional: Override default server URL for production
# NEXT_PUBLIC_SERVER_URL=https://your-backend-domain.com/api/v1
```

### Installation

1. **Clone the repository and navigate to frontend:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Run development server:**

```bash
npm run dev
```

4. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the Next.js application
npm run build

# Start production server
npm start
```

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

#### Vercel Configuration (vercel.json):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

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

## API Communication Example

### Example: Creating a Group

```typescript
// Frontend: Using the groups-api service
import { groupApi } from "@/lib/api/groups-api";

async function createNewGroup() {
  try {
    const response = await groupApi.createGroup({
      name: "Community Lending Group",
      description: "A group for community savings and lending"
    });
    
    if (response.success) {
      console.log("Group created:", response.data);
      // React Query automatically invalidates and refetches groups list
    }
  } catch (error) {
    console.error("Failed to create group:", error);
  }
}
```

### Example: Authentication State Management

```typescript
// Frontend: Using Zustand for authentication
import { useAuthStore } from "@/lib/stores/auth-store";

// Check authentication status
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

// Get current user
const currentUser = useAuthStore((state) => state.user);

// Get auth token for API calls
const token = useAuthStore((state) => state.token);

// Login action
useAuthStore.getState().setAuth(user, token);

// Logout action
useAuthStore.getState().logout();
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

## Support

For support, please open an issue in the repository or contact the development team.

---

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [Sequelize ORM](https://sequelize.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

