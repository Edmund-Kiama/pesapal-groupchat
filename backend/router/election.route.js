import Router from "express";
import { adminOnlyAuth } from "../middleware/auth.middleware.js";
import {
  createElection,
  endElection,
  getElectionById,
  getElectionPositions,
  getElections,
} from "../controllers/election.controller.js";

const electionRouter = Router();

// --> /api/v1/election
// create election
electionRouter.post("/", adminOnlyAuth, createElection);
// get all elections
electionRouter.get("/", getElections);
// get election by Id
electionRouter.get("/:electionId", getElectionById);
// get positions for one election
electionRouter.get("/positions/:electionId", getElectionPositions);
// end elections
electionRouter.delete("/:electionId", adminOnlyAuth, endElection);

export default electionRouter;
