# Group Lending Backend - PostgreSQL (Sequelize)

This backend application manages groups, elections, voting, notifications, and chat functionality. It uses **Node.js**, **Express**, and **PostgreSQL** via **Sequelize**.  

---

## Deployment

### Backend Deployment (Railway)

The backend is deployed on **Railway** with the following configuration:

- **Platform**: Railway
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

#### Required Environment Variables:

```env
DATABASE_URL=postgresql://username:password@host:port/dbname
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

#### CORS Configuration:

Ensure CORS is configured to allow requests from the frontend:

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


# Database Schema: Voting & Group Management System

This document outlines the database models and their architectural relationships for the backend system.

---

## 1. Core Models

### User
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key (Auto-increment) |
| **name** | String | Required, 2-30 chars |
| **email** | String | Required, Unique, Valid format |
| **password** | String | Required, Min 6 chars |
| **role** | Enum | `admin` or `member` |
| **resetPasswordToken** | String | Optional |
| **resetPasswordExpires** | Date | Optional |

### Group
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **name** | String | Required |
| **description** | String | Optional |
| **created_by** | Integer | FK → `User.id` |

---

## 2. Membership & Communication

### GroupMember
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **userId** | Integer | FK → `User.id` |
| **groupId** | Integer | FK → `Group.id` |
| **joined_at** | Date | Default `now()` |

### GroupInvite
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **senderId** | Integer | FK → `User.id` |
| **receiverId** | Integer | FK → `User.id` |
| **groupId** | Integer | FK → `Group.id` |
| **status** | Enum | `pending`, `accepted`, `declined` |

### GroupChat
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **content** | String | Required |
| **senderId** | Integer | FK → `User.id` |
| **groupId** | Integer | FK → `Group.id` |

### GroupMeeting
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **location** | String | Required |
| **created_by** | Integer | FK → `User.id` |
| **groupId** | Integer | FK → `Group.id` |
| **invited** | JSONB | Array of invited users |
| **time** | JSONB | `{ from: Date, to: Date }` |

---

## 3. Election & Voting System

### Election
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **date_from** | Date | Required |
| **date_to** | Date | Required |
| **groupId** | Integer | FK → `Group.id` |
| **created_by** | Integer | FK → `User.id` |

### Position
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **position** | String | Required |
| **electionId** | Integer | FK → `Election.id` |
| **created_by** | Integer | FK → `User.id` |

### Candidate
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **userId** | Integer | FK → `User.id` |
| **positionId** | Integer | FK → `Position.id` |
| **electionId** | Integer | FK → `Election.id` |
| **nominated_by** | Integer | FK → `User.id` |

### VotingRight
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **userId** | Integer | FK → `User.id` |
| **electionId** | Integer | FK → `Election.id` |
| **positionId** | Integer | FK → `Position.id` |
| **has_voted** | Boolean | Default `false` |

### Vote
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **electionId** | Integer | FK → `Election.id` |
| **positionId** | Integer | FK → `Position.id` |
| **candidateId** | Integer | FK → `Candidate.id` |

---

## 4. Utility Models

### Notification
| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Integer | Primary Key |
| **userId** | Integer | FK → `User.id` |
| **type** | String | Enum of notification types |
| **message** | String | Required |
| **metadata** | JSONB | Optional related references |
| **isRead** | Boolean | Default `false` |

---

# Database Relationships

This document outlines the relational structure of the application database. The system is built using **Sequelize ORM**, utilizing `one-to-many` and `many-to-many` patterns to manage users, groups, elections, and meetings.

---

## Relationships Diagram (Simplified)

User ──< VotingRight >── Election
User ──< GroupMember >── Group
User ──< GroupInvite >── User
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



---


## 1. User Associations
The `User` model is the primary actor. It interacts with almost every other entity as either a creator, a participant, or a recipient.

| Entity | Relationship | Foreign Key | Logic / Alias |
| :--- | :--- | :--- | :--- |
| **VotingRight** | One-to-Many | `userId` | Permissions granted to a user. |
| **Candidate** | One-to-Many | `userId` | A user's own profile as a candidate. |
| **Candidate** | One-to-Many | `nominated_by` | Tracks who nominated the candidate (`nominations`). |
| **Group** | One-to-Many | `created_by` | Groups owned by the user (`groupsCreated`). |
| **GroupMember** | One-to-Many | `userId` | User's group memberships (`memberships`). |
| **GroupInvite** | One-to-Many | `senderId` | Invites sent by the user (`sentInvites`). |
| **GroupInvite** | One-to-Many | `receiverId` | Invites received by the user (`receivedInvites`). |
| **GroupChat** | One-to-Many | `senderId` | User as the message author (`sender`). |
| **Vote** | One-to-Many | `userId` | Votes cast by the user. |
| **Position** | One-to-Many | `created_by` | Positions defined by the user. |
| **Election** | One-to-Many | `created_by` | Elections organized by the user. |
| **Notification** | One-to-Many | `userId` | Notifications sent to the user. |
| **GroupMeeting** | One-to-Many | `created_by` | Meetings scheduled by the user. |
| **MeetingInvite**| One-to-Many | `userId` | Meetings the user is invited to. |

---

## 2. Group & Communication
Groups act as containers for members, communication, and organizational events.

* **Members & Invites**: A `Group` manages its population via `GroupMember` and `GroupInvite`.
* **Communication**: `GroupChat` messages are linked to a specific `Group`.
* **Events**: Both `Election` and `GroupMeeting` belong to a `Group`.
* **Integrity**: Deleting a `Group` triggers a **CASCADE** delete for its members, invites, chats, elections, and meetings.

---

## 3. Election & Voting System
The voting logic is tiered: **Election > Position > Candidate > Vote**.



### Hierarchy:
1.  **Election**: The top-level event. Belongs to a `Group` and a `User` (creator).
2.  **Position**: Specific roles within an election (e.g., "President"). Belongs to an `Election`.
3.  **Candidate**: Users running for a `Position` within an `Election`.
4.  **Vote**: The final record. Linked to the `User` (voter), `Election`, `Position`, and `Candidate`.

---

## 4. Meetings & Invites
Meetings are organized within groups and involve specific user invitations.

* **GroupMeeting**: Created by a `User` for a `Group`.
* **GroupMeetingInvite**: Links a `User` to a `GroupMeeting`.
    * **Alias**: Accessed via `meeting.invited` in the `GroupMeeting` model.
    * **Integrity**: If a meeting is deleted, all associated invites are **CASCADED**.

---

## 5. Data Integrity Rules

| Rule | Applied To | Result |
| :--- | :--- | :--- |
| **CASCADE** | Most Associations | When a parent (Group, Election, Meeting) is deleted, all related child records are automatically removed to prevent orphaned data. |
| **SET NULL** | Creator Fields | If a `User` is deleted, their `Groups`, `Elections`, and `Meetings` remain in the system, but the `created_by` field is set to `null` for historical record keeping. |

---

