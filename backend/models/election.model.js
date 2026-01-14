import mongoose from "mongoose";

const electionSchema = new mongoose.Schema(
  {
    date_to: {
      type: Date,
      required: [true, "Date to is required"],
    },
    date_from: {
      type: Date,
      required: [true, "Date from is required"],
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Election = mongoose.model("Election", electionSchema);

export default Election;
