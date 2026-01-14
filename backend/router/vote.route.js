import {
  castVote,
  getVotesByCandidate,
  getVotesByElection,
} from "../controllers/vote.controller.js";
import Router from "express";


const voteRouter = Router();

// --> /api/v1/vote
voteRouter.post("/", castVote);
voteRouter.get("/candidate/:candidateId", getVotesByCandidate);
voteRouter.get("/election/:electionId", getVotesByElection);

export default voteRouter;
