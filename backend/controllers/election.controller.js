import Election from "../models/election.model.js";
import Position from "../models/position.model.js";
import Notification from "../models/notification.model.js";
import sendEmail from "../utils/send-email.js";
import { formatDateTime } from "../utils/date-time.format.js";

//create election
export const createElection = async (req, res, next) => {
  try {
    //destructure
    const { date_to, date_from, groupId } = req.body;
    const admin = req.user; // from authentication mIddleware

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

    //create the election
    const election = await Election.create({
      date_to,
      date_from,
      groupId,
      created_by: admin?._id,
    });

    //notify
    await Promise.all([
      //notify creator
      Notification.create({
        userId: admin?._id,
        type: "ELECTION_CREATED",
        message: `You have created an election running from ${formatDateTime(
          date_from
        )} to ${formatDateTime(date_to)}`,
        metadata: { groupId, electionId: election?._id },
      }),

      sendEmail({
        to: admin?.email,
        subject: "New Election Created",
        message: `You have created an election running from ${formatDateTime(
          date_from
        )} to ${formatDateTime(date_to)}`,
        html: `
         <p>You have created an election running from ${formatDateTime(
           date_from
         )} to ${formatDateTime(date_to)}</p>`,
      }),
    ]);

    //return
    res.status(201).json({
      success: true,
      message: "Election created successfully",
      data: election,
    });
  } catch (error) {
    next(error);
  }
};

//get all elections
export const getElections = async (req, res, next) => {
  try {
    //get all records
    const elections = await Election.find()
      .populate("groupId", "name description")
      .populate("created_by", "name")
      .lean();
    const transformed = elections.map((election) => {
      const { groupId, ...rest } = election;
      return { ...rest, group: groupId };
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

//get one election
export const getElectionById = async (req, res, next) => {
  try {
    const electionId = req.params.electionId;
    const election = await Election.findById(electionId)
      .populate("groupId", "name description")
      .populate("created_by", "name")
      .lean();

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // rename groupId → group
    const { groupId, ...rest } = election;
    const transformed = { ...rest, group: groupId };

    res.status(200).json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};

// get all positions for one election(electionId)
export const getElectionPositions = async (req, res, next) => {
  try {
    //get the election Id
    const electionId = req.params.electionId;

    //find all user membership for the group
    const positions = await Position.find({ electionId }).populate(
      "created_by",
      "name"
    );

    //return
    res.status(200).json({
      success: true,
      data: positions,
    });
  } catch (error) {
    next(error);
  }
};

//end elections
export const endElection = async (req, res, next) => {
  try {
    const electionId = req.params.electionId;
    const election = await Election.findByIdAndDelete(electionId);
    const admin = req?.user

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election was not found",
      });
    }

      //notify
      await Promise.all([
        //notify creator
        Notification.create({
          userId: admin?._id,
          type: "ELECTION_DELETED",
          message: `You have successfully deleted an election that ran from ${formatDateTime(
            date_from
          )} to ${formatDateTime(date_to)}`,
          metadata: { groupId, electionId: election?._id },
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
           )} to ${formatDateTime(date_to)}</p>`,
        }),
      ]);

    res.status(200).json({
      success: true,
      message: "Election was deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
