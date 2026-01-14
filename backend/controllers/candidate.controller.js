import Position from "../models/position.model.js";
import Candidate from "../models/candidate.model.js";
import Notification from "../models/notification.model.js";
import sendEmail from "../utils/send-email.js";
import { formatDateTime } from "../utils/date-time.format.js";

//create candidate
export const nominateCandidate = async (req, res, next) => {
  try {
    //destructure
    const { userId, positionId } = req.body;
    const admin = req.user; // from authentication mIddleware

    const missingFields = [];
    if (!userId) missingFields.push("userId");
    if (!positionId) missingFields.push("positionId");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    const position = await Position.findById(positionId);
    const nominee = await User.findById(userId);
    if (!position || !nominee) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
      });
    }

    //create the candidate
    const candidate = await Candidate.create({
      userId,
      positionId,
      electionId: position.electionId,
      nominated_by: admin?._id,
    });

    //notify
    await Promise.all([
      //notify admin
      Notification.create({
        userId: admin?._id,
        type: "CANDIDATE_NOMINATED",
        message: `You have successfully nominated ${nominee?.name} to position ${position?.position}`,
        metadata: { groupId, electionId: election?._id, positionId },
      }),
      //email to admin
      sendEmail({
        to: admin?.email,
        subject: "Candidate Nomination",
        message: `You have successfully nominated ${nominee?.name} to position ${position?.position}`,
        html: `
               <p>You have successfully nominated <strong>${nominee?.name}</strong> to position <strong>${position?.position}</strong></p>`,
      }),
      //notify nominee
      Notification.create({
        userId: nominee?._id,
        type: "CANDIDATE_NOMINATED",
        message: `You have been nominated to position ${position?.position} by ${admin?.name}`,
        metadata: { groupId, electionId: election?._id, positionId },
      }),
      //email to nominee
      sendEmail({
        to: nominee?.email,
        subject: "Candidate Nomination",
        message: `You have been nominated to position ${position?.position} by ${admin?.name}`,
        html: `
               <p>You have been nominated to position <strong>${position?.position}</strong> by <strong>${admin?.name}</strong></p>`,
      }),
    ]);

    //return
    res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      data: candidate,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//list candidate
export const getCandidates = async (req, res, next) => {
  try {
    //get all records
    const candidates = await Candidate.find()
      .populate("userId", "name email role")
      .populate("positionId", "position")
      .populate("electionId", "date_to date_from groupId")
      .populate("nominated_by", "name")
      .lean();
    const transformed = candidates.map((candidate) => {
      const { userId, positionId, electionId, ...rest } = candidate;
      return {
        ...rest,
        nominated: userId,
        position: positionId,
        election: electionId,
      };
    });

    // return all records
    res.status(200).json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};

//get one candidate
export const getCandidateById = async (req, res, next) => {
  try {
    const candidateId = req.params.candidateId;
    const candidate = await Candidate.findById(candidateId)
    .populate("userId", "name email role")
    .populate("positionId", "position")
    .populate("electionId", "date_to date_from groupId")
      .populate("nominated_by", "name")
      .lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // rename groupId → group
    const { userId, positionId, electionId, ...rest } = candidate;
    const transformed = {
      ...rest,
      nominated: userId,
      position: positionId,
      election: electionId,
    };

    res.status(200).json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
