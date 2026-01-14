import mongoose from "mongoose";

const postionSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: [true, "Position name is required"],
      trim: true,
      minLength: 2,
      maxLength: 30,
    },
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
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

const Position = mongoose.model("Position", postionSchema);

export default Position;
