import { Router } from "express";
import healthcheckRoute from "./healthcheck.routes.js";
const router = Router();

router.use("/healthcheck", healthcheckRoute );

export default router;