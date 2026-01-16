import {
  Notification,
  Position,
  Candidate,
  User,
  Election,
} from "../models/index.js";
import { sequelize } from "../database/db.js";

// create position
export const createPosition = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { position, electionId } = req.body;
    const adminId = req.user.id; // Sequelize uses 'id' not '_id'

    // check missing fields
    const missingFields = [];
    if (!electionId) missingFields.push("electionId");
    if (!position) missingFields.push("position");

    if (missingFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // create the position
    const positionCreated = await Position.create(
      {
        position,
        electionId,
        created_by: adminId,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Position created successfully",
      data: positionCreated?.toJSON(),
    });

    // create notification
    Notification.create({
      userId: adminId,
      type: "POSITION_CREATED",
      message: `A new position has been created: ${position}`,
      positionId: positionCreated.id,
    }).catch((err) =>
      console.error("CreatePosition notification failed:", err)
    );
  } catch (error) {
    await transaction.rollback();
    console.error("CreatePosition Error:", error);
    next(error);
  }
};

// get all position
export const getPositions = async (req, res, next) => {
  try {
    // fetch all positions with their election
    const positions = await Position.findAll({
      include: [
        {
          model: Election,
          as: "election",
          attributes: ["id", "date_from", "date_to", "groupId"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: positions?.map((p) => p?.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

// get one position by Id
export const getPositionById = async (req, res, next) => {
  try {
    const { positionId } = req.params;

    // fetch position by primary key with election association
    const position = await Position.findByPk(positionId, {
      include: [
        {
          model: Election,
          as: "election",
          attributes: ["id", "date_from", "date_to", "groupId"],
        },
      ],
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position was not found",
      });
    }

    res.status(200).json({
      success: true,
      data: position?.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// delete position by Id
export const deletePosition = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { positionId } = req.params;
    const user = req.user;

    // find the position first
    const position = await Position.findByPk(positionId, { transaction });

    if (!position) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Position was not found",
      });
    }

    // delete the position
    await position.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Position was deleted successfully",
    });

    // create notification
    Notification.create({
      userId: user.id,
      type: "POSITION_DELETED",
      message: `The position ${position.position} has been deleted by ${user.name}`,
      positionId: position.id,
    }).catch((err) =>
      console.error("DeletePosition notification failed:", err)
    );
  } catch (error) {
    await transaction.rollback();
    console.error("DeletePosition Error:", error);
    next(error);
  }
};

//get candidates for a position
export const getPositionCandidates = async (req, res, next) => {
  try {
    const { positionId } = req.params;

    // fetch candidates for this position with associations
    const candidates = await Candidate.findAll({
      where: { positionId },
      include: [
        {
          model: User,
          as: "nominated",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: User,
          as: "nominator",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      data: candidates?.map((c) => c?.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};
