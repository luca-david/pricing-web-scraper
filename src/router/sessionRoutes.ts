import { Router } from "express";
import { finishSession, startSession } from "../controllers/sessionController.js";

const router = Router();

router.get('/start-session', startSession);
router.get('/finish-session', finishSession);

export default router;