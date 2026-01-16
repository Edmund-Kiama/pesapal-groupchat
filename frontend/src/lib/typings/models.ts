// ============================================
// Enums
// ============================================

export enum UserRole {
  ADMIN = "admin",
  MEMBER = "member",
}

export enum GroupInviteStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

export enum MeetingInviteStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

export enum NotificationType {
  GROUP_CREATED = "GROUP_CREATED",
  GROUP_MEMBER_ADDED = "GROUP_MEMBER_ADDED",
  GROUP_INVITE_CREATED = "GROUP_INVITE_CREATED",
  GROUP_INVITE_DECLINED = "GROUP_INVITE_DECLINED",
  GROUP_INVITE_ACCEPTED = "GROUP_INVITE_ACCEPTED",
  GROUP_MEETING_CREATED = "GROUP_MEETING_CREATED",
  GROUP_MEETING_INVITATION = "GROUP_MEETING_INVITATION",
  GROUP_MEETING_ACCEPTED = "GROUP_MEETING_ACCEPTED",
  GROUP_MEETING_DECLINED = "GROUP_MEETING_DECLINED",
  POSITION_CREATED = "POSITION_CREATED",
  POSITION_DELETED = "POSITION_DELETED",
  ELECTION_CREATED = "ELECTION_CREATED",
  ELECTION_DELETED = "ELECTION_DELETED",
  CANDIDATE_NOMINATED = "CANDIDATE_NOMINATED",
  USER_CREATION = "USER_CREATION",
  ADMIN_CREATION = "ADMIN_CREATION",
}

// ============================================
// Interfaces
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  votingRights?: VotingRight[];
  candidates?: Candidate[];
  nominations?: Candidate[];
  groupsCreated?: Group[];
  memberships?: GroupMember[];
  sentInvites?: GroupInvite[];
  receivedInvites?: GroupInvite[];
  sentGroupChats?: GroupChat[];
  votes?: Vote[];
  positionsCreated?: Position[];
  electionsCreated?: Election[];
  notifications?: Notification[];
  meetingsCreated?: GroupMeeting[];
  meetingInvites?: GroupMeetingInvite[];
}

export interface Group {
  id: number;
  name: string;
  description?: string | null;
  created_by: number;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  creator?: User;
  members?: GroupMember[];
  invites?: GroupInvite[];
  chats?: GroupChat[];
  elections?: Election[];
  meetings?: GroupMeeting[];

  // Additional fields from API
  memberCount?: number;
}

export interface GroupMember {
  id: number;
  userId: number;
  groupId: number;
  joined_at: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  user?: User;
  group?: Group;
}

export interface GroupInvite {
  id: number;
  senderId: number;
  receiverId: number;
  groupId: number;
  status: GroupInviteStatus;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  sender?: User;
  receiver?: User;
  group?: Group;
}

export interface GroupChat {
  id: number;
  content: string;
  senderId: number;
  groupId: number;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  sender?: User;
  group?: Group;
}

export interface GroupMeeting {
  id: number;
  location: string;
  created_by: number;
  groupId: number;
  time_from: Date;
  time_to: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  creator?: User;
  group?: Group;
  invited?: GroupMeetingInvite[];
}

export interface GroupMeetingInvite {
  id: number;
  userId: number;
  meetingId: number;
  status: MeetingInviteStatus;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  user?: User;
  meeting?: GroupMeeting;
}

export interface Election {
  id: number;
  date_from: Date;
  date_to: Date;
  groupId: number;
  created_by: number;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  group?: Group;
  creator?: User;
  positions?: Position[];
  candidates?: Candidate[];
  votes?: Vote[];
}

export interface Position {
  id: number;
  position: string;
  electionId: number;
  created_by: number;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  election?: Election;
  creator?: User;
  candidates?: Candidate[];
  votes?: Vote[];
}

export interface Candidate {
  id: number;
  userId: number;
  positionId: number;
  electionId: number;
  nominated_by: number;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  user?: User;
  position?: Position;
  election?: Election;
  nominator?: User;
  votes?: Vote[];
}

export interface Vote {
  id: number;
  electionId: number;
  candidateId: number;
  positionId: number;
  userId?: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  election?: Election;
  candidate?: Candidate;
  position?: Position;
  user?: User;
}

export interface VotingRight {
  id: number;
  userId: number;
  electionId: number;
  positionId: number;
  has_voted: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  user?: User;
}

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  message: string;
  groupId?: number | null;
  meetingId?: number | null;
  inviteId?: number | null;
  positionId?: number | null;
  electionId?: number | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  user?: User;
}
