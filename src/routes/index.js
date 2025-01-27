import { Router } from "express";
import healthcheckRoute from "./healthcheck.routes.js";
import authRouter from "./auth.routes.js";
import receiptRouter from "./receipt.routes.js";
// import warrantyRouter from "./warranty.routes.js";
const router = Router();

router.use("/healthcheck", healthcheckRoute );
router.use("/auth", authRouter);
router.use("/receipts", receiptRouter);
// router.use("/warranties", warrantyRouter)

export default router;