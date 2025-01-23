import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import config from "../config/config.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// TODO: Correct status code
const authenticate = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.Authorization?.split(" ")[1];
    //CLEANUP: Console
    console.log("authorization", req.headers.authorization);
    console.log("Authorization", req.headers.Authorization);

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    const decode = jwt.verify(token, config.JWT.ACCESS_SECRET);
    const user = await User.findById(decode.sub);

    if (!user) {
      throw new ApiError(401, "");
    }

    req.user = user;
    next();
  } catch (error) {
    //CLEANUP: Console
    console.error(error.message);
    throw new ApiError(error.message);
  }
});


export { authenticate}