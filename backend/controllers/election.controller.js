import {
  Notification,
  Group,
  User,
  Position,
  Election,
} from "../models/index.js";
import sendEmail from "../utils/send-email.js";
import { sequelize } from "../database/db.js";
import { formatDateTime } from "../utils/date-time.format.js";

//create election
export const createElection = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { date_to, date_from, groupId } = req.body;
    const admin = req.user; // from auth middleware (Sequelize user)

    const missingFields = [];
    if (!date_to) missingFields.push("date_to");
    if (!date_from) missingFields.push("date_from");
    if (!groupId) missingFields.push("groupId");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // Create election
    const election = await Election.create(
      {
        date_to,
        date_from,
        groupId,
        created_by: admin.id,
      },
      { transaction }
    );

    await transaction.commit();

    await Promise.all([
      Notification.create({
        userId: admin.id,
        type: "ELECTION_CREATED",
        message: `You have created an election running from ${formatDateTime(
          date_from
        )} to ${formatDateTime(date_to)}`,
        groupId,
        electionId: election.id,
      }),

      sendEmail({
        to: admin.email,
        subject: "New Election Created",
        message: `You have created an election running from ${formatDateTime(
          date_from
        )} to ${formatDateTime(date_to)}`,
        html: `
          <p>
            You have created an election running from
            ${formatDateTime(date_from)} to ${formatDateTime(date_to)}
          </p>
        `,
      }),
    ]);

    res.status(201).json({
      success: true,
      message: "Election created successfully",
      data: election?.toJSON(),
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

//get all elections
export const getElections = async (req, res, next) => {
  try {
    // Fetch all elections with associations
    const elections = await Election.findAll({
      include: [
        {
          model: Group,
          as: "group",
          attributes: ["id", "name", "description"],
        }, // populate group
        { model: User, as: "created_by", attributes: ["id", "name"] }, // populate creator
      ],
    });

    res.status(200).json({
      success: true,
      data: elections?.map((e) => e?.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

export const getElectionById = async (req, res, next) => {
  try {
    const electionId = req.params.electionId;

    // Fetch the election by ID with associated group and creator
    const election = await Election.findByPk(electionId, {
      include: [
        {
          model: Group,
          as: "group",
          attributes: ["id", "name", "description"],
        }, // populate group
        { model: User, as: "created_by", attributes: ["id", "name"] }, // populate creator
      ],
    });

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    res.status(200).json({
      success: true,
      data: election?.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// get all positions for one election(electionId)
export const getElectionPositions = async (req, res, next) => {
  try {
    const electionId = req.params.electionId;

    // Fetch all positions for this election with the creator (User)
    const positions = await Position.findAll({
      where: { electionId },
      include: [{ model: User, as: "created_by", attributes: ["id", "name"] }],
    });

    res.status(200).json({
      success: true,
      data: positions?.map((p) => p?.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

//end elections
export const endElection = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const electionId = req.params.electionId;
    const admin = req.user; // from authentication middleware

    // Find the election first
    const election = await Election.findByPk(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election was not found",
      });
    }

    // Store values before deletion
    const { date_from, date_to, groupId } = election;

    // Delete the election
    await election.destroy({ transaction });
    await transaction.commit();

    // Notify admin and send email
    await Promise.all([
      Notification.create({
        userId: admin?.id,
        type: "ELECTION_DELETED",
        message: `You have successfully deleted an election that ran from ${formatDateTime(
          date_from
        )} to ${formatDateTime(date_to)}`,
        groupId,
        electionId,
      }),

      sendEmail({
        to: admin?.email,
        subject: "Election Deletion",
        message: `You have successfully deleted an election that ran from ${formatDateTime(
          date_from
        )} to ${formatDateTime(date_to)}`,
        html: `
          <p>You have successfully deleted an election that ran from ${formatDateTime(
            date_from
          )} to ${formatDateTime(date_to)}</p>
        `,
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Election was deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
