import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
      },
    positionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      required: true,
    },
  },
  { timestamps: true }
);

const Vote = mongoose.model("Vote", voteSchema);

export default Vote;
