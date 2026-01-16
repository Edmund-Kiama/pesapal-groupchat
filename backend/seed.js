import bcrypt from "bcryptjs";
import { sequelize } from "./database/db.js";
import { connectDB } from "./database/connect-db.js";
import {
  User,
  Group,
  GroupMember,
  GroupInvite,
  GroupMeeting,
  GroupMeetingInvite,
  GroupChat,
  Notification,
  VotingRight,
  Election,
  Position,
} from "./models/index.js";

const seedDatabase = async () => {
  const transaction = await sequelize.transaction();

  try {
    console.log("🌱 Starting database seeding...");

    // First, connect to the database
    console.log("📦 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected successfully");

    // Sync database (force: true will drop tables - use with caution)
    await sequelize.sync({ force: true });
    console.log("✅ Database synced successfully");

    // ============================================
    // 1. CREATE USERS (all with password: Password123)
    // ============================================
    const hashedPassword = await bcrypt.hash("Password123", 10);

    const admin = await User.create(
      {
        name: "Admin User",
        email: "admin@grouplending.com",
        password: hashedPassword,
        role: "admin",
      },
      { transaction }
    );
    console.log("✅ Admin user 'Admin User' has been created successfully");

    const user1 = await User.create(
      {
        name: "John Doe",
        email: "john@example.com",
        password: hashedPassword,
        role: "member",
      },
      { transaction }
    );
    console.log("✅ User 'John Doe' has been created successfully");

    const user2 = await User.create(
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: hashedPassword,
        role: "member",
      },
      { transaction }
    );
    console.log("✅ User 'Jane Smith' has been created successfully");

    const user3 = await User.create(
      {
        name: "Bob Johnson",
        email: "bob@example.com",
        password: hashedPassword,
        role: "member",
      },
      { transaction }
    );
    console.log("✅ User 'Bob Johnson' has been created successfully");

    const user4 = await User.create(
      {
        name: "Alice Williams",
        email: "alice@example.com",
        password: hashedPassword,
        role: "member",
      },
      { transaction }
    );
    console.log("✅ User 'Alice Williams' has been created successfully");

    const user5 = await User.create(
      {
        name: "Charlie Brown",
        email: "charlie@example.com",
        password: hashedPassword,
        role: "member",
      },
      { transaction }
    );
    console.log("✅ User 'Charlie Brown' has been created successfully");

    // ============================================
    // 2. CREATE GROUPS FIRST (needed before election)
    // ============================================

    // Admin creates the main group with all users except 2 who will be invited
    const adminGroup = await Group.create(
      {
        name: "Main Group",
        description: "The main group created by admin for all users",
        created_by: admin.id,
      },
      { transaction }
    );
    console.log(
      "✅ Group 'Main Group' created by Admin has been created successfully"
    );

    // Group 1: Tech Discussion Group (created by John)
    const group1 = await Group.create(
      {
        name: "Tech Discussion Group",
        description: "A group for discussing the latest in technology",
        created_by: user1.id,
      },
      { transaction }
    );
    console.log(
      "✅ Group 'Tech Discussion Group' has been created successfully"
    );

    // Group 2: Book Club (created by Bob)
    const group2 = await Group.create(
      {
        name: "Book Club",
        description: "Monthly book discussions and reviews",
        created_by: user3.id,
      },
      { transaction }
    );
    console.log("✅ Group 'Book Club' has been created successfully");

    // ============================================
    // 3. CREATE DUMMY ELECTIONS AND POSITIONS
    // (Required for VotingRight foreign key constraints)
    // ============================================

    // Create a dummy election (linked to Main Group)
    const election1 = await Election.create(
      {
        date_from: new Date(),
        date_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        groupId: adminGroup.id,
        created_by: admin.id,
      },
      { transaction }
    );
    console.log("✅ Election 'Demo Election' has been created successfully");

    // Create a dummy position
    const position1 = await Position.create(
      {
        position: "Demo Position",
        electionId: election1.id,
        created_by: admin.id,
      },
      { transaction }
    );
    console.log("✅ Position 'Demo Position' has been created successfully");

    // ============================================
    // 4. CREATE VOTING RIGHTS
    // ============================================

    for (const user of [admin, user1, user2, user3, user4, user5]) {
      await VotingRight.create(
        {
          userId: user.id,
          electionId: election1.id,
          positionId: position1.id,
          has_voted: false,
        },
        { transaction }
      );
    }
    console.log(
      "✅ Voting rights for all users have been created successfully"
    );

    // ============================================
    // 5. ADD GROUP MEMBERS
    // ============================================

    // Add admin as member of Main Group
    await GroupMember.create(
      { userId: admin.id, groupId: adminGroup.id },
      { transaction }
    );
    console.log(
      "✅ Admin has been added as member of 'Main Group' successfully"
    );

    // Add John, Jane, Bob as members of Main Group (3 users)
    await GroupMember.create(
      { userId: user1.id, groupId: adminGroup.id },
      { transaction }
    );
    await GroupMember.create(
      { userId: user2.id, groupId: adminGroup.id },
      { transaction }
    );
    await GroupMember.create(
      { userId: user3.id, groupId: adminGroup.id },
      { transaction }
    );
    console.log(
      "✅ Users 'John Doe', 'Jane Smith', 'Bob Johnson' have been added as members of 'Main Group' successfully"
    );

    // Tech Discussion Group members
    await GroupMember.create(
      { userId: user1.id, groupId: group1.id },
      { transaction }
    );
    await GroupMember.create(
      { userId: user2.id, groupId: group1.id },
      { transaction }
    );
    await GroupMember.create(
      { userId: user5.id, groupId: group1.id },
      { transaction }
    );
    console.log(
      "✅ Members for 'Tech Discussion Group' have been created successfully"
    );

    // Book Club members
    await GroupMember.create(
      { userId: user3.id, groupId: group2.id },
      { transaction }
    );
    await GroupMember.create(
      { userId: user4.id, groupId: group2.id },
      { transaction }
    );
    await GroupMember.create(
      { userId: user5.id, groupId: group2.id },
      { transaction }
    );
    console.log("✅ Members for 'Book Club' have been created successfully");

    // ============================================
    // 6. CREATE GROUP INVITES (Admin invites 2 users)
    // ============================================

    // Admin invites Alice to Main Group
    const invite1 = await GroupInvite.create(
      {
        senderId: admin.id,
        receiverId: user4.id,
        groupId: adminGroup.id,
        status: "pending",
      },
      { transaction }
    );
    console.log(
      "✅ Admin has created a group invite for 'Alice Williams' to join 'Main Group' successfully"
    );

    // Admin invites Charlie to Main Group
    const invite2 = await GroupInvite.create(
      {
        senderId: admin.id,
        receiverId: user5.id,
        groupId: adminGroup.id,
        status: "pending",
      },
      { transaction }
    );
    console.log(
      "✅ Admin has created a group invite for 'Charlie Brown' to join 'Main Group' successfully"
    );

    // ============================================
    // 7. CREATE ADDITIONAL GROUP INVITES
    // ============================================

    // Pending invite: Jane -> Bob for Tech Discussion Group
    const invite3 = await GroupInvite.create(
      {
        senderId: user2.id,
        receiverId: user3.id,
        groupId: group1.id,
        status: "pending",
      },
      { transaction }
    );
    console.log(
      "✅ Group invite from Jane to Bob for 'Tech Discussion Group' has been created successfully"
    );

    // Accepted invite: John -> Jane for Book Club
    await GroupInvite.create(
      {
        senderId: user1.id,
        receiverId: user2.id,
        groupId: group2.id,
        status: "accepted",
      },
      { transaction }
    );
    console.log(
      "✅ Group invite from John to Jane for 'Book Club' has been created successfully"
    );

    // Declined invite: Bob -> Alice for Tech Discussion Group
    await GroupInvite.create(
      {
        senderId: user3.id,
        receiverId: user4.id,
        groupId: group1.id,
        status: "declined",
      },
      { transaction }
    );
    console.log(
      "✅ Group invite from Bob to Alice for 'Tech Discussion Group' has been created successfully"
    );

    // ============================================
    // 8. CREATE GROUP MEETINGS
    // ============================================

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Meeting 1: Main Group - All Hands Meeting (ALL members: admin, John, Jane, Bob)
    // Note: Alice and Charlie are NOT members yet (pending invites)
    const meeting1 = await GroupMeeting.create(
      {
        location: "Main Conference Hall",
        created_by: admin.id,
        groupId: adminGroup.id,
        time_from: tomorrow,
        time_to: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
      },
      { transaction }
    );
    console.log(
      "✅ Meeting 'All Hands Meeting' for 'Main Group' has been created successfully"
    );

    // Meeting 2: Tech Discussion Group - Small team sync (John, Jane, Charlie)
    const meeting2 = await GroupMeeting.create(
      {
        location: "Virtual - Zoom",
        created_by: user1.id,
        groupId: group1.id,
        time_from: nextWeek,
        time_to: new Date(nextWeek.getTime() + 60 * 60 * 1000), // 1 hour later
      },
      { transaction }
    );
    console.log(
      "✅ Meeting 'Team Sync' for 'Tech Discussion Group' has been created successfully"
    );

    // Meeting 3: Book Club - Monthly Discussion (Bob, Alice, Charlie)
    const meeting3 = await GroupMeeting.create(
      {
        location: "Community Library",
        created_by: user3.id,
        groupId: group2.id,
        time_from: nextMonth,
        time_to: new Date(nextMonth.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
      },
      { transaction }
    );
    console.log(
      "✅ Meeting 'Monthly Discussion' for 'Book Club' has been created successfully"
    );

    // ============================================
    // 9. CREATE GROUP MEETING INVITES
    // ============================================

    // Meeting 1: All Hands Meeting - ALL 4 current members invited
    await GroupMeetingInvite.create(
      { userId: admin.id, meetingId: meeting1.id, status: "accepted" },
      { transaction }
    );
    await GroupMeetingInvite.create(
      { userId: user1.id, meetingId: meeting1.id, status: "accepted" },
      { transaction }
    );
    await GroupMeetingInvite.create(
      { userId: user2.id, meetingId: meeting1.id, status: "pending" },
      { transaction }
    );
    await GroupMeetingInvite.create(
      { userId: user3.id, meetingId: meeting1.id, status: "accepted" },
      { transaction }
    );
    console.log(
      "✅ Meeting invites for 'All Hands Meeting' have been created successfully"
    );

    // Meeting 2: Team Sync - 3 members (John, Jane, Charlie)
    await GroupMeetingInvite.create(
      { userId: user1.id, meetingId: meeting2.id, status: "accepted" },
      { transaction }
    );
    await GroupMeetingInvite.create(
      { userId: user2.id, meetingId: meeting2.id, status: "pending" },
      { transaction }
    );
    await GroupMeetingInvite.create(
      { userId: user5.id, meetingId: meeting2.id, status: "declined" },
      { transaction }
    );
    console.log(
      "✅ Meeting invites for 'Team Sync' have been created successfully"
    );

    // Meeting 3: Monthly Discussion - 3 members (Bob, Alice, Charlie)
    await GroupMeetingInvite.create(
      { userId: user3.id, meetingId: meeting3.id, status: "accepted" },
      { transaction }
    );
    await GroupMeetingInvite.create(
      { userId: user4.id, meetingId: meeting3.id, status: "accepted" },
      { transaction }
    );
    await GroupMeetingInvite.create(
      { userId: user5.id, meetingId: meeting3.id, status: "pending" },
      { transaction }
    );
    console.log(
      "✅ Meeting invites for 'Monthly Discussion' have been created successfully"
    );

    // ============================================
    // 10. CREATE GROUP CHAT MESSAGES
    // ============================================

    // Main Group chat
    await GroupChat.create(
      {
        content:
          "Welcome to Main Group! This is the primary group for all members.",
        senderId: admin.id,
        groupId: adminGroup.id,
      },
      { transaction }
    );
    await GroupChat.create(
      {
        content:
          "Thanks for creating this group, Admin! Looking forward to great collaboration.",
        senderId: user1.id,
        groupId: adminGroup.id,
      },
      { transaction }
    );
    await GroupChat.create(
      {
        content: "Excited to be part of this group!",
        senderId: user2.id,
        groupId: adminGroup.id,
      },
      { transaction }
    );
    await GroupChat.create(
      {
        content: "Great to have everyone here!",
        senderId: user3.id,
        groupId: adminGroup.id,
      },
      { transaction }
    );
    console.log(
      "✅ Chat messages for 'Main Group' have been created successfully"
    );

    // Tech Discussion Group chat
    await GroupChat.create(
      {
        content: "Welcome to the Tech Discussion Group! 🎉",
        senderId: user1.id,
        groupId: group1.id,
      },
      { transaction }
    );
    await GroupChat.create(
      {
        content: "Has anyone seen the latest AI developments?",
        senderId: user3.id,
        groupId: group1.id,
      },
      { transaction }
    );
    await GroupChat.create(
      {
        content: "Yes! The new GPT models are impressive.",
        senderId: user1.id,
        groupId: group1.id,
      },
      { transaction }
    );
    console.log(
      "✅ Chat messages for 'Tech Discussion Group' have been created successfully"
    );

    // Book Club chat
    await GroupChat.create(
      {
        content: "Welcome to the Book Club! 📚",
        senderId: user3.id,
        groupId: group2.id,
      },
      { transaction }
    );
    await GroupChat.create(
      {
        content: "What books are we reading this month?",
        senderId: user4.id,
        groupId: group2.id,
      },
      { transaction }
    );
    await GroupChat.create(
      {
        content: "I suggest we read 'The Great Gatsby' for our next meeting.",
        senderId: user5.id,
        groupId: group2.id,
      },
      { transaction }
    );
    console.log(
      "✅ Chat messages for 'Book Club' have been created successfully"
    );

    // ============================================
    // 11. CREATE NOTIFICATIONS
    // ============================================

    // Admin notifications
    await Notification.create(
      {
        userId: admin.id,
        type: "ADMIN_CREATION",
        message: "Welcome Admin! You have full access to the system.",
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: admin.id,
        type: "GROUP_CREATED",
        message: "You created the Main Group",
        groupId: adminGroup.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: admin.id,
        type: "GROUP_MEETING_CREATED",
        message: "You created the All Hands Meeting",
        groupId: adminGroup.id,
        meetingId: meeting1.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: admin.id,
        type: "GROUP_INVITE_CREATED",
        message: "You invited Alice Williams to join Main Group",
        groupId: adminGroup.id,
        inviteId: invite1.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: admin.id,
        type: "GROUP_INVITE_CREATED",
        message: "You invited Charlie Brown to join Main Group",
        groupId: adminGroup.id,
        inviteId: invite2.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: admin.id,
        type: "USER_CREATION",
        message: "5 new users have been added to the system.",
      },
      { transaction }
    );
    console.log(
      "✅ Notifications for 'Admin User' have been created successfully"
    );

    // User notifications for John (user1)
    await Notification.create(
      {
        userId: user1.id,
        type: "USER_CREATION",
        message: "Welcome to Group Lending!",
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user1.id,
        type: "GROUP_MEMBER_ADDED",
        message: "You were added to Main Group",
        groupId: adminGroup.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user1.id,
        type: "GROUP_MEETING_ACCEPTED",
        message: "You accepted the meeting invitation for All Hands Meeting",
        groupId: adminGroup.id,
        meetingId: meeting1.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user1.id,
        type: "GROUP_MEETING_INVITATION",
        message: "You have been invited to Team Sync",
        groupId: group1.id,
        meetingId: meeting2.id,
      },
      { transaction }
    );
    console.log(
      "✅ Notifications for 'John Doe' have been created successfully"
    );

    // User notifications for Jane (user2)
    await Notification.create(
      {
        userId: user2.id,
        type: "USER_CREATION",
        message: "Welcome to Group Lending!",
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user2.id,
        type: "GROUP_MEMBER_ADDED",
        message: "You were added to Main Group",
        groupId: adminGroup.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user2.id,
        type: "GROUP_MEETING_INVITATION",
        message: "You have been invited to All Hands Meeting",
        groupId: adminGroup.id,
        meetingId: meeting1.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user2.id,
        type: "GROUP_INVITE_CREATED",
        message: "You invited Bob Johnson to join Tech Discussion Group",
        groupId: group1.id,
        inviteId: invite3.id,
      },
      { transaction }
    );
    console.log(
      "✅ Notifications for 'Jane Smith' have been created successfully"
    );

    // User notifications for Bob (user3)
    await Notification.create(
      {
        userId: user3.id,
        type: "USER_CREATION",
        message: "Welcome to Group Lending!",
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user3.id,
        type: "GROUP_MEMBER_ADDED",
        message: "You were added to Main Group",
        groupId: adminGroup.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user3.id,
        type: "GROUP_MEETING_ACCEPTED",
        message: "You accepted the meeting invitation for All Hands Meeting",
        groupId: adminGroup.id,
        meetingId: meeting1.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user3.id,
        type: "GROUP_INVITE_CREATED",
        message: "You have a pending invite to join Tech Discussion Group",
        groupId: group1.id,
        inviteId: invite3.id,
      },
      { transaction }
    );
    console.log(
      "✅ Notifications for 'Bob Johnson' have been created successfully"
    );

    // User notifications for Alice (user4)
    await Notification.create(
      {
        userId: user4.id,
        type: "USER_CREATION",
        message: "Welcome to Group Lending!",
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user4.id,
        type: "GROUP_INVITE_CREATED",
        message: "Admin User invited you to join Main Group",
        groupId: adminGroup.id,
        inviteId: invite1.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user4.id,
        type: "GROUP_MEETING_ACCEPTED",
        message: "You accepted the meeting invitation for Monthly Discussion",
        groupId: group2.id,
        meetingId: meeting3.id,
      },
      { transaction }
    );
    console.log(
      "✅ Notifications for 'Alice Williams' have been created successfully"
    );

    // User notifications for Charlie (user5)
    await Notification.create(
      {
        userId: user5.id,
        type: "USER_CREATION",
        message: "Welcome to Group Lending!",
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user5.id,
        type: "GROUP_INVITE_CREATED",
        message: "Admin User invited you to join Main Group",
        groupId: adminGroup.id,
        inviteId: invite2.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user5.id,
        type: "GROUP_MEETING_DECLINED",
        message: "You declined the meeting invitation for Team Sync",
        groupId: group1.id,
        meetingId: meeting2.id,
      },
      { transaction }
    );
    await Notification.create(
      {
        userId: user5.id,
        type: "GROUP_MEETING_INVITATION",
        message: "You have been invited to Monthly Discussion",
        groupId: group2.id,
        meetingId: meeting3.id,
      },
      { transaction }
    );
    console.log(
      "✅ Notifications for 'Charlie Brown' have been created successfully"
    );

    // ============================================
    // COMMIT TRANSACTION
    // ============================================
    await transaction.commit();
    console.log("✅ Transaction has been committed successfully");

    // ============================================
    // SUMMARY
    // ============================================
    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Seed Summary:");
    console.log("├── Users: 6 (1 admin + 5 members)");
    console.log("├── Groups: 3");
    console.log("│   ├── Main Group (created by Admin) - 4 members");
    console.log("│   ├── Tech Discussion Group - 3 members");
    console.log("│   └── Book Club - 3 members");
    console.log("├── Dummy Election: 1 (linked to Main Group)");
    console.log("├── Dummy Position: 1");
    console.log("├── Voting Rights: 6");
    console.log("├── Group Invites: 4");
    console.log(
      "│   ├── Main Group: 2 pending invites (Alice, Charlie - from Admin)"
    );
    console.log("│   └── Others: 1 pending, 1 accepted, 1 declined");
    console.log("├── Group Meetings: 3");
    console.log("│   ├── All Hands Meeting (4 members - Main Group)");
    console.log("│   ├── Team Sync (3 members - Tech Discussion Group)");
    console.log("│   └── Monthly Discussion (3 members - Book Club)");
    console.log("├── Group Meeting Invites: 10");
    console.log("├── Group Chat Messages: 10");
    console.log("└── Notifications: 24");
    console.log("\n🔑 Default Password for all users: Password123");
    console.log("\n📧 Test Accounts:");
    console.log("├── admin@grouplending.com (admin)");
    console.log("├── john@example.com");
    console.log("├── jane@example.com");
    console.log("├── bob@example.com");
    console.log("├── alice@example.com");
    console.log("└── charlie@example.com");

    process.exit(0);
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error("❌ Seeding failed. Transaction has been rolled back.");
    console.error("Error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
