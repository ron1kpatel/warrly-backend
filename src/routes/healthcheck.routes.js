import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controller.js";

const healthcheckRoute = Router();

healthcheckRoute.route("/").get(healthcheck)

export default healthcheckRoute;