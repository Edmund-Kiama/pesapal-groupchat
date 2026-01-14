import express from "express";
import errorMiddleware from "./middleware/error.middleware.js";
import { authenticate } from "./middleware/auth.middleware.js";
import authRouter from "./router/auth.route.js";
import groupRouter from "./router/group.route.js";
import cookieParser from "cookie-parser";
import userRouter from "./router/user.route.js";
import electionRouter from "./router/election.route.js";
import positionRouter from "./router/position.route.js";
import candidateRouter from "./router/candidate.route.js";
import groupChatRouter from "./router/group-chat.route.js"
import voteRouter from "./router/vote.route.js";
import groupInviteRouter from "./router/group-invite.route.js";
import groupMeetingRouter from "./router/group-meeting.route.js";
import notificationRouter from "./router/notification.route.js";
import { connectDB } from "./database/connect-db.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Routes
app.get("/", (req, res) => res.send("Welcome to Group Lending"));

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/notification", authenticate, notificationRouter);
app.use("/api/v1/user", authenticate, userRouter);

app.use("/api/v1/group", authenticate, groupRouter);
app.use("/api/v1/group-chat", authenticate, groupChatRouter);
app.use("/api/v1/group-invite", authenticate, groupInviteRouter);
app.use("/api/v1/group-meeting", authenticate, groupMeetingRouter);

app.use("/api/v1/election", authenticate, electionRouter);
app.use("/api/v1/position", authenticate, positionRouter);
app.use("/api/v1/candidate", authenticate, candidateRouter);
app.use("/api/v1/vote", authenticate, voteRouter);

//middleware
app.use(errorMiddleware);

//listener
async function startServer() {
  try {
    await connectDB();

    app.listen(3000, () => {
      console.log("🚀 Server running on port 3000");
    });
  } catch (error) {
    console.error("🚫 Server startup aborted (DB failed)");
    process.exit(1);
  }
}

startServer();

export default app;
 