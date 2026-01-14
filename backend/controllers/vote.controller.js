import User from "../models/user.model.js";
import Vote from "../models/vote.model.js";
import mongoose from "mongoose";

export const castVote = async (req, res, next) => {
  try {
    //destructure
    const { electionId, candidateId, positionId } = req.body;
    const userId = req.user._id; // from authentication mIddleware

    const missingFields = [];
    if (!electionId) missingFields.push("electionId");
    if (!candidateId) missingFields.push("candidateId");
    if (!positionId) missingFields.push("positionId");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    //check if user has already voted for that position in that electionId
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        voting_rights: {
          $not: {
            $elemMatch: { electionId, positionId },
          },
        },
      },
      {
        $push: { voting_rights: { electionId, positionId, has_voted: true } },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(409).json({
        success: false,
        message: "User has already voted for this position",
      });
    }

    //create the chat
    const vote = await Vote.create({
      electionId,
      candidateId,
      positionId,
    });

    //return
    res.status(201).json({
      success: true,
      message: "Vote created successfully",
      data: vote,
    });
  } catch (error) {
    next(error);
  }
};

export const getVotesByCandidate = async (req, res, next) => {
  try {
    const { candidateId } = req.params;

    // Get all votes for this candidate
    const candidateVotes = await Vote.find({ candidateId })
      .populate({
        path: "candidateId",
        select: "userId nominated_by",
        populate: [
          { path: "userId", select: "name" }, // candidate's name
          { path: "nominated_by", select: "name" }, // nominated_by user's name
        ],
      })
      .populate("positionId", "position")
      .lean();

    if (!candidateVotes || candidateVotes.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          candidate: candidateId,
          total_votes: 0,
        },
      });
    }

    const candidateInfo = candidateVotes[0].candidateId.userId; // populated user
    const positionInfo = candidateVotes[0].positionId;

    res.status(200).json({
      success: true,
      data: {
        candidate: {
          _id: candidateVotes[0].candidateId._id,
          name: candidateInfo.name,
          nominated_by: candidateVotes[0].candidateId.nominated_by,
        },
        position: positionInfo,
        total_votes: candidateVotes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getVotesByElection = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const electionObjectId = new mongoose.Types.ObjectId(electionId);

    const results = await Vote.aggregate([
      { $match: { electionId: electionObjectId } },

      {
        $facet: {
          // 1️⃣ Votes per candidate
          votes_by_candidate: [
            {
              $group: {
                _id: {
                  candidateId: "$candidateId",
                  positionId: "$positionId",
                },
                total_votes: { $sum: 1 },
              },
            },
            { $sort: { total_votes: 1 } }, // ascending

            // Lookup candidate document
            {
              $lookup: {
                from: "candidates",
                localField: "_id.candidateId",
                foreignField: "_id",
                as: "candidate",
              },
            },
            { $unwind: "$candidate" },

            // Lookup candidate's user info
            {
              $lookup: {
                from: "users",
                localField: "candidate.userId",
                foreignField: "_id",
                as: "candidate_user",
              },
            },
            { $unwind: "$candidate_user" },

            // Lookup nominated_by user info
            {
              $lookup: {
                from: "users",
                localField: "candidate.nominated_by",
                foreignField: "_id",
                as: "nominated_by_user",
              },
            },
            { $unwind: "$nominated_by_user" },

            // Lookup position document
            {
              $lookup: {
                from: "positions",
                localField: "_id.positionId",
                foreignField: "_id",
                as: "position",
              },
            },
            { $unwind: "$position" },

            // Shape the output
            {
              $project: {
                _id: 0,
                total_votes: 1,
                candidate: {
                  _id: "$candidate._id",
                  name: "$candidate_user.name",
                  nominated_by: {
                    _id: "$nominated_by_user._id",
                    name: "$nominated_by_user.name",
                  },
                },
                position: {
                  _id: "$position._id",
                  position: "$position.position",
                },
              },
            },
          ],

          // 2️⃣ Votes per position (optional, keeps your original logic)
          votes_by_position: [
            {
              $group: {
                _id: "$positionId",
                total_votes: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: "positions",
                localField: "_id",
                foreignField: "_id",
                as: "position",
              },
            },
            { $unwind: "$position" },
            {
              $project: {
                _id: 0,
                position: {
                  _id: "$position._id",
                  position: "$position.position",
                },
                total_votes: 1,
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
