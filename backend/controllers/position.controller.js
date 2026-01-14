import Candidate from "../models/candidate.model.js";
import Position from "../models/position.model.js";
import Notification from "../models/notification.model.js";

// create position
export const createPosition = async (req, res, next) => {
  try {
    //destructure
    const { position, electionId } = req.body;
    const adminId = req.user._id; // from authentication mIddleware

    const missingFields = [];
    if (!electionId) missingFields.push("electionId");
    if (!position) missingFields.push("position");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    //create the election
    const positionCreated = await Position.create({
      position,
      electionId,
      created_by: adminId,
    });

    await Notification.create({
      userId: adminId,
      type: "POSITION_CREATED",
      message: `A new position has been created: ${position}`,
      metadata: { positionId: positionCreated._id,  },
    });

      //return
      res.status(201).json({
        success: true,
        message: "Position created successfully",
        data: positionCreated,
      });

  } catch (error) {
    next(error);
  }
};

// get all position
export const getPositions = async (req, res, next) => {
  try {
    //get all records
    const positions = await Position.find()
      .populate("electionId", "date_to date_from groupId")
      .lean();

    const transformed = positions.map((position) => {
      const { electionId, ...rest } = position;
      return { ...rest, election: electionId };
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

// get one position by Id
export const getPositionById = async (req, res, next) => {
  try {
    const positionId = req.params.positionId;
    const position = await Position.findById(positionId).populate(
      "electionId",
      "date_to date_from groupId"
    );

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position was not found",
      });
    }

    res.status(200).json({
      success: true,
      data: position,
    });
  } catch (error) {
    next(error);
  }
};

// delete position by Id
export const deletePosition = async (req, res, next) => {
  try {
    const positionId = req.params.positionId;
    const position = await Position.findByIdAndDelete(positionId);
    const user = req.user

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position was not found",
      });
    }

    await Notification.create({
      userId: adminId,
      type: "POSITION_DELETED",
      message: `The position ${position.position} has been deleted by ${user.name}`,
      metadata: { positionId: positionCreated._id,  },
    });

    res.status(200).json({
      success: true,
      message: "Position was deleted successfully",
    });


  } catch (error) {
    next(error);
  }
};

//get candidates for a position
export const getPositionCandidates = async (req, res, next) => {
  try {
    const positionId = req.params.positionId;
    const candidates = await Candidate.find({ positionId })
      .populate("userId", "-password")
      .populate("nominated_by", "name")
      .lean();

    if (!candidates) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const transformed = candidates.map((candidate) => {
      const { userId, ...rest } = candidate;
      return { nominated: userId, ...rest };
    });

    res.status(200).json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};
