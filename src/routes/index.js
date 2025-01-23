import { Router } from "express";
import healthcheckRoute from "./healthcheck.routes.js";
import authRouter from "./auth.router.js";
const router = Router();

router.use("/healthcheck", healthcheckRoute );
router.use("/auth", authRouter);

export default router;