import {
  User,
  Position,
  Candidate,
  Election,
  Notification,
} from "../models/index.js";
import sendEmail from "../utils/send-email.js";
import { sequelize } from "../database/db.js";

//create candidate
export const nominateCandidate = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { userId, positionId } = req.body;
    const admin = req.user;

    const missingFields = [];
    if (!userId) missingFields.push("userId");
    if (!positionId) missingFields.push("positionId");

    if (missingFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    const position = await Position.findByPk(positionId, { transaction });
    const nominee = await User.findByPk(userId, { transaction });

    if (!position || !nominee) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
      });
    }

    const candidate = await Candidate.create(
      {
        userId,
        positionId,
        electionId: position.electionId,
        nominated_by: admin.id,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      data: candidate?.toJSON(),
    });

    Promise.all([
      // notify admin
      Notification.create({
        userId: admin.id,
        type: "CANDIDATE_NOMINATED",
        message: `You have successfully nominated ${nominee.name} to position ${position.position}`,
        positionId,
        electionId: position.electionId,
      }),

      sendEmail({
        to: admin.email,
        subject: "Candidate Nomination",
        message: `You have successfully nominated ${nominee.name} to position ${position.position}`,
        html: `
          <p>You have successfully nominated 
            <strong>${nominee.name}</strong> 
            to position <strong>${position.position}</strong>
          </p>
        `,
      }),

      // notify nominee
      Notification.create({
        userId: nominee.id,
        type: "CANDIDATE_NOMINATED",
        message: `You have been nominated to position ${position.position} by ${admin.name}`,
        positionId,
        electionId: position.electionId,
      }),

      sendEmail({
        to: nominee.email,
        subject: "Candidate Nomination",
        message: `You have been nominated to position ${position.position} by ${admin.name}`,
        html: `
          <p>You have been nominated to position 
            <strong>${position.position}</strong> 
            by <strong>${admin.name}</strong>
          </p>
        `,
      }),
    ]).catch((err) =>
      console.error("NominateCandidate side effects failed:", err)
    );
  } catch (error) {
    await transaction.rollback();
    console.error("NominateCandidate Error:", error);
    next(error);
  }
};

//list candidate
export const getCandidates = async (req, res, next) => {
  try {
    const candidates = await Candidate.findAll({
      include: [
        {
          model: User,
          as: "nominated",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: Position,
          as: "position",
          attributes: ["id", "position"],
        },
        {
          model: Election,
          as: "election",
          attributes: ["id", "date_from", "date_to", "groupId"],
        },
        {
          model: User,
          as: "nominator",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: candidates?.map((c) => c?.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

//get one candidate
export const getCandidateById = async (req, res, next) => {
  try {
    const { candidateId } = req.params;

    const candidate = await Candidate.findByPk(candidateId, {
      include: [
        {
          model: User,
          as: "nominated",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: Position,
          as: "position",
          attributes: ["id", "position"],
        },
        {
          model: Election,
          as: "election",
          attributes: ["id", "date_from", "date_to", "groupId"],
        },
        {
          model: User,
          as: "nominator",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      data: candidate?.toJSON(),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
