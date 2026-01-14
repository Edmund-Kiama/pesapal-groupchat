# Group Lending Backend - PostgreSQL (Sequelize)

This backend application manages groups, elections, voting, notifications, and chat functionality. It uses **Node.js**, **Express**, and **PostgreSQL** via **Sequelize**.  

---

## Database Models and Relationships

### 1. User
- **Fields**: `id`, `name`, `email`, `password`, `role` (admin/member), `createdAt`, `updatedAt`
- **Relationships**:
  - Has many `VotingRight`s → tracks which elections/positions the user can vote in
  - Has many `GroupMember`s → tracks membership in groups
  - Has many `GroupInvite`s sent (`senderId`) and received (`receiverId`)
  - Has many `GroupMeeting`s created (`created_by`)
  - Has many `Candidate`s nominated (`userId`) and nominations made (`nominated_by`)
  - Has many `Notification`s

---

### 2. VotingRight
- **Fields**: `id`, `userId`, `electionId`, `positionId`, `has_voted`, `createdAt`, `updatedAt`
- **Relationships**:
  - Belongs to `User`
  - Belongs to `Election`
  - Belongs to `Position`

---

### 3. Election
- **Fields**: `id`, `date_from`, `date_to`, `groupId`, `created_by`, `createdAt`, `updatedAt`
- **Relationships**:
  - Belongs to `Group`
  - Belongs to `User` (`created_by`)
  - Has many `Position`s
  - Has many `Candidate`s
  - Has many `Vote`s
  - Has many `VotingRight`s

---

### 4. Position
- **Fields**: `id`, `position`, `electionId`, `created_by`, `createdAt`, `updatedAt`
- **Relationships**:
  - Belongs to `Election`
  - Belongs to `User` (`created_by`)
  - Has many `Candidate`s
  - Has many `VotingRight`s

---

### 5. Candidate
- **Fields**: `id`, `userId`, `positionId`, `electionId`, `nominated_by`, `createdAt`, `updatedAt`
- **Relationships**:
  - Belongs to `User` (`userId`)
  - Belongs to `Position`
  - Belongs to `Election`
  - Belongs to `User` (`nominated_by`)
  - Has many `Vote`s

---

### 6. Vote
- **Fields**: `id`, `electionId`, `candidateId`, `positionId`, `createdAt`, `updatedAt`
- **Relationships**:
  - Belongs to `Election`
  - Belongs to `Candidate`
  - Belongs to `Position`

---

### 7. Group
- **Fields**: `id`, `name`, `description`, `created_by`, `createdAt`, `updatedAt`
- **Relationships**:
  - Belongs to `User` (`created_by`)
  - Has many `GroupMember`s
  - Has many `GroupInvite`s
  - Has many `GroupChat`s
  - Has many `GroupMeeting`s
  - Has many `Election`s

---

### 8. GroupMember
- **Fields**: `id`, `userId`, `groupId`, `joined_at`, `createdAt`, `updatedAt`
- **Relationships**:
  - Belongs to `User`
  - Belongs to `Group`

---

### 9. GroupInvite
- **Fields**: `id`, `senderId`, `receiverId`, `groupId`, `status`, `createdAt`, `updatedAt`
- **Relationships**:
  - Belongs to `User` (`senderId`)
  - Belongs to `User` (`receiverId`)
  - Belongs to `Group`

---

### 10. GroupChat
- **Fields**: `id`, `content`, `senderId`, `groupId`, `createdAt`, `updatedAt`
- **Relationships**:
  - Belongs to `User` (`senderId`)
  - Belongs to `Group`

---

### 11. GroupMeeting
- **Fields**: `id`, `location`, `created_by`, `groupId`, `time_from`, `time_to`, `createdAt`, `updatedAt`
- **Relationships**:
  - Belongs to `User` (`created_by`)
  - Belongs to `Group`
  - Many-to-many relation with `User` through `invited` array (converted to `GroupMeetingInvite` junction table in PostgreSQL)

---

### 12. Notification
- **Fields**: `id`, `userId`, `type`, `message`, `metadata` (foreign keys to `Group`, `GroupMeeting`, `GroupInvite`, `Position`, `Election`), `isRead`, `createdAt`, `updatedAt`
- **Relationships**:
  - Belongs to `User`
  - References other models optionally through `metadata`

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

## Notes
- All `_id` fields in MongoDB are converted to `id` (auto-increment integer or UUID depending on setup) in PostgreSQL.
- Many-to-many arrays (like `invited` in `GroupMeeting` or `voting_rights` in `User`) are represented as separate tables in PostgreSQL (`VotingRight`, `GroupMeetingInvite`).
- All date fields are mapped to `DATE` or `TIMESTAMP` in PostgreSQL.
- Sequelize manages `createdAt` and `updatedAt` automatically.

---

## Usage

1. Configure `.env` with your PostgreSQL connection:

```env
DATABASE_URL=postgresql://username:password@host:port/dbname
```

1. Start the server:

```
node app.jsv
```


///////////////////////////////


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

## Relationships Summary

### User Associations
* **One-to-Many**: `VotingRight`, `GroupMember`, `GroupChat`, `Candidate`, `Election` (creator), `GroupMeeting` (creator), `Notification`.
* **Many-to-Many via Aliases**: `GroupInvite` (as sender or receiver).

### Group Associations
* **One-to-Many**: `GroupMember`, `GroupInvite`, `GroupChat`, `GroupMeeting`, `Election`.

### Election Associations
* **One-to-Many**: `Position`, `Candidate`, `VotingRight`, `Vote`.
* **BelongsTo**: `Group`, `User` (creator).

### Position Associations
* **One-to-Many**: `Candidate`, `VotingRight`.
* **BelongsTo**: `Election`, `User` (creator).