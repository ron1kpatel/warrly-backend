import { Router } from "express";
import passport from "passport";

import { googleAuth, login, register } from "../controllers/auth.controller.js";

const authRouter = Router();

//Local Authentication
authRouter.route("/register").post(register);

authRouter.route("/login").post(passport.authenticate('local', {session: false}), login);

//Google Authentication 
authRouter.route("/google").get(passport.authenticate('google', {session: false}));
authRouter.route("/google/callback").get(passport.authenticate('google', {session: false}), googleAuth)


// //Token Management
// authRouter.route("/refresh-token", asyncHandler());
// authRouter.route("/logout", asyncHandler());

export default authRouter;