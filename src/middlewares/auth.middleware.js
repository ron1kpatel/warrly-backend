import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import config from "../config/config.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  try {
    // 1. Get and validate authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized - Missing or invalid authorization header");
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new ApiError(401, "Unauthorized - Missing token");
    }

    // 3. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT.ACCESS_SECRET);
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, "Token expired");
      }
      if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, "Invalid token");
      }
      throw new ApiError(401, "Unauthorized - Token verification failed");
    }

    // 4. Validate token payload
    if (!decoded?.sub) {
      throw new ApiError(401, "Invalid token payload");
    }

    // 5. Find user
    const user = await User.findById(decoded.sub).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // 6. Attach user to request
    req.user = user;
    next();

  } catch (error) {
    // Handle specific error types
    if (error instanceof ApiError) {
      return next(error);
    }

    // Wrap unexpected errors
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, "Invalid token"));
    }

    return next(
      new ApiError(
        error.statusCode || 500, 
        error.message || "Authentication failed"
      )
    );
  }
});

export { authenticate };