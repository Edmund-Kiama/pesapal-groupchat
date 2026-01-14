import Router from "express";
import { adminOnlyAuth } from "../middleware/auth.middleware.js";
import {
  nominateCandidate,
  getCandidates,
  getCandidateById,
} from "../controllers/candidate.controller.js";

const candidateRouter = Router();

candidateRouter.post("/", adminOnlyAuth, nominateCandidate);
candidateRouter.get("/", getCandidates);
candidateRouter.get("/:candidateId", getCandidateById);

export default candidateRouter;
