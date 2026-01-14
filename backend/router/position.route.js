import Router from "express";
import {
  createPosition,
  getPositions,
  getPositionById,
  deletePosition,
  getPositionCandidates,
} from "../controllers/position.controller.js";
import { adminOnlyAuth } from "../middleware/auth.middleware.js";

const positionRouter = Router();

// --> /api/v1/position
// create position
positionRouter.post("/", adminOnlyAuth, createPosition);
// get all position
positionRouter.get("/", getPositions);
// get one position by Id
positionRouter.get("/:positionId", getPositionById);
// delete position by Id
positionRouter.delete("/:positionId", adminOnlyAuth, deletePosition);
//get candidates for a position
positionRouter.get("/candidates/:positionId", getPositionCandidates)

export default positionRouter;

