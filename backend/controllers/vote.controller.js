import {User, Vote, Position,Candidate, VotingRight} from "../models/index.js";
import { sequelize } from "../database/db.js";
import { Sequelize } from "sequelize";

export const castVote = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { electionId, candidateId, positionId } = req.body;
    const userId = req.user.id; 

    // Check for missing fields
    const missingFields = [];
    if (!electionId) missingFields.push("electionId");
    if (!candidateId) missingFields.push("candidateId");
    if (!positionId) missingFields.push("positionId");

    if (missingFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // Check if user has already voted for this position in this election
    const existingVote = await VotingRight.findOne({
      where: {
        userId,
        electionId,
        positionId,
      },
      transaction,
    });

    if (existingVote) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "User has already voted for this position",
      });
    }

    // Record the user's voting right
    await VotingRight.create(
      {
        userId,
        electionId,
        positionId,
        hasVoted: true,
      },
      { transaction }
    );

    // Create the vote
    const vote = await Vote.create(
      {
        electionId,
        candidateId,
        positionId,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Vote created successfully",
      data: vote?.toJSON(),
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getVotesByCandidate = async (req, res, next) => {
  try {
    const { candidateId } = req.params;

    // Get all votes for this candidate with associated candidate, nominator, and position
    const candidateVotes = await Vote.findAll({
      where: { candidateId },
      include: [
        {
          model: Candidate,
          as: "candidate",
          include: [
            {
              model: User,
              as: "nominated",
              attributes: ["id", "name"],
            },
            {
              model: User,
              as: "nominator",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Position,
          as: "position",
          attributes: ["id", "position"],
        },
      ],
    });

    if (candidateVotes.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          candidate: candidateId,
          total_votes: 0,
        },
      });
    }

    // Extract candidate info from the first vote (all votes are for same candidate)
    const candidateData = candidateVotes[0].candidate.toJSON();
    const positionData = candidateVotes[0].position.toJSON();

    res.status(200).json({
      success: true,
      data: {
        candidate: candidateData,
        position: positionData,
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

    // Votes per candidate
    const votesByCandidate = await Vote.findAll({
      attributes: [
        "candidateId",
        "positionId",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total_votes"],
      ],
      where: { electionId },
      group: [
        "candidateId",
        "positionId",
        "candidate.id",
        "candidate->nominated.id",
        "candidate->nominated_by.id",
        "position.id",
      ],
      include: [
        {
          model: Candidate,
          as: "candidate",
          attributes: ["id"],
          include: [
            { model: User, as: "nominated", attributes: ["id", "name"] },
            { model: User, as: "nominator", attributes: ["id", "name"] },
          ],
        },
        {
          model: Position,
          as: "position",
          attributes: ["id", "position"],
        },
      ],
    });

    // 2️⃣ Votes per position
    const votesByPosition = await Vote.findAll({
      attributes: [
        "positionId",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total_votes"],
      ],
      where: { electionId },
      group: ["positionId", "position.id"],
      include: [
        {
          model: Position,
          as: "position",
          attributes: ["id", "position"],
        },
      ],
    });

    // Transform candidate votes into desired shape
    const votesByCandidateTransformed = votesByCandidate.map((vote) => {
      return vote.toJSON()
    });

    const votesByPositionTransformed = votesByPosition.map((vote) => {
      return vote.toJSON();
    });

    res.status(200).json({
      success: true,
      data: {
        votes_by_candidate: votesByCandidateTransformed,
        votes_by_position: votesByPositionTransformed,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

