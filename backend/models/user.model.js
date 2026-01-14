import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minLength: 2,
      maxLength: 30,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: 6,
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "member"],
        message: "{VALUE} is not a valid role",
      },
      default: "member",
      lowercase: true,
      trim: true,
    },
    voting_rights: [
      {
        electionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Election",
          required: true,
        },
        positionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Position",
          required: true,
        },
        has_voted: {
          type: Boolean,
          required: true,
          default: false
        }
      }
    ],
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
