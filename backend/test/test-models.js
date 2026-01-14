import { connectDB, closeDB } from "../database/connect-db.js";
import {
  User,
  VotingRight,
  Group,
  GroupMember,
  GroupInvite,
  GroupChat,
  Election,
  Position,
  Candidate,
  Vote,
  Notification,
  GroupMeeting,
  GroupMeetingInvite,
} from "../models/index.js";

async function testModels() {
  try {
    await connectDB();

    // -------- USER --------
    const user = await User.create({
      name: "Mike Doe",
      email: "mike@example.com",
      password: "123456",
      role: "member",
    });
    console.log("✅ User created:", user.toJSON());

    // -------- GROUP --------
    const group = await Group.create({
      name: "Test Group",
      description: "A test group",
      created_by: user.id,
    });
    console.log("✅ Group created:", group.toJSON());

    // -------- GROUP MEMBER --------
    const member = await GroupMember.create({
      userId: user.id,
      groupId: group.id,
    });
    console.log("✅ Group member created:", member.toJSON());

    // -------- GROUP INVITE --------
    const invite = await GroupInvite.create({
      senderId: user.id,
      receiverId: user.id,
      groupId: group.id,
    });
    console.log("✅ Group invite created:", invite.toJSON());

    // -------- GROUP CHAT --------
    const chat = await GroupChat.create({
      content: "Hello Group!",
      senderId: user.id,
      groupId: group.id,
    });
    console.log("✅ Group chat created:", chat.toJSON());

    // -------- GROUP MEETING --------
    const meeting = await GroupMeeting.create({
      location: "Conference Room",
      created_by: user.id,
      groupId: group.id,
      time_from: new Date(),
      time_to: new Date(Date.now() + 3600 * 1000),
    });
    console.log("✅ Group meeting created:", meeting.toJSON());

    // -------- GROUP MEETING INVITE --------
    const meetingInvite = await GroupMeetingInvite.create({
      userId: user.id,
      meetingId: meeting.id,
    });
    console.log("✅ Group meeting invite created:", meetingInvite.toJSON());

    // -------- ELECTION --------
    const election = await Election.create({
      date_from: new Date(),
      date_to: new Date(Date.now() + 86400 * 1000),
      groupId: group.id,
      created_by: user.id,
    });
    console.log("✅ Election created:", election.toJSON());

    // -------- POSITION --------
    const position = await Position.create({
      position: "President",
      electionId: election.id,
      created_by: user.id,
    });
    console.log("✅ Position created:", position.toJSON());

    // -------- CANDIDATE --------
    const candidate = await Candidate.create({
      userId: user.id,
      positionId: position.id,
      electionId: election.id,
      nominated_by: user.id,
    });
    console.log("✅ Candidate created:", candidate.toJSON());

    // -------- VOTING RIGHT --------
    const votingRight = await VotingRight.create({
      userId: user.id,
      electionId: election.id,
      positionId: position.id,
    });
    console.log("✅ Voting right created:", votingRight.toJSON());

    // -------- VOTE --------
    const vote = await Vote.create({
      electionId: election.id,
      candidateId: candidate.id,
      positionId: position.id,
      userId: user.id,
    });
    console.log("✅ Vote created:", vote.toJSON());

    // -------- NOTIFICATION --------
    const notification = await Notification.create({
      userId: user.id,
      type: "USER_CREATION",
      message: "New user created",
      metadata: { groupId: group.id, electionId: election.id },
    });
    console.log("✅ Notification created:", notification.toJSON());

    // -------- FETCH ALL WITH ASSOCIATIONS --------
    const allUsers = await User.findAll({
      include: [
        GroupMember,
        { model: GroupInvite, as: "sentInvites" },
        { model: GroupInvite, as: "receivedInvites" },
        GroupChat,
        GroupMeeting,
        { model: GroupMeetingInvite },
        VotingRight,
        Vote,
        Candidate,
        Position,
        Notification,
      ],
    });

    console.log(
      "📋 All users with associations:",
      allUsers.map((u) => u.toJSON())
    );

    await closeDB();
    console.log("🔒 DB connection closed");
  } catch (error) {
    console.error("❌ Error testing models:", error);
  }
}

testModels();
