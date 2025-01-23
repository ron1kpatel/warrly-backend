import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import User from "../models/user.model.js";
import config from "../config/config.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const cookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: config.NODE_ENV === "production" ? "None" : "Lax",
};

const clearAuthCookies = (res) => {
  /**
   *  clearAuthCookies helper function, takes response object as input, have no output
   *
   * 1. clear 'accessToken' cookie
   * 2. clear 'refreshToken' cookie
   */
  res.clearAuthCookies("accessToken", {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
  });
  res.clearAuthCookies("refreshToken", {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
  });
};

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { sub: user._id, email: user.email },
    config.JWT.ACCESS_SECRET,
    { expiresIn: config.JWT.ACCESS_EXPIRY }
  );

  const refreshToken = jwt.sign({ sub: user._id }, config.JWT.REFRESH_SECRET, {
    expiresIn: config.JWT.REFRESH_EXPIRY,
  });

  return { accessToken, refreshToken };
};

const register = asyncHandler(async (req, res) => {
  const { email, password, fullname } = req.body;

  //CLEANUP: console logs
  console.log("req.body:", req.body);

  //Check for existing user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  //Create new user
  const user = await User.create({ email, password, fullname });

  if (!user) {
    throw new ApiError(501, "Something went wrong while registering user");
  }

  //Generate Tokens
  const tokens = generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  //Set secure Cookies
  res.cookie("accessToken", tokens.accessToken, {
    ...cookieOptions,
    maxAge: 100 * 60 * 1000, // 100 mins
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, //7d
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { user }, "Registration successful"));
});

const login = asyncHandler(async (req, res) => {
  const user = req.user;
  const tokens = generateTokens(user);

  //Update refresh token in DB
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  //Set secure cookies
  res.cookie("accessToken", tokens.accessToken, {
    ...cookieOptions,
    maxAge: 100 * 60 * 1000, // 15m
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Login successfull"));
});

const googleAuth = asyncHandler(async (req, res, next) => {
  try {
    const tokens = generateTokens(req.user);
    req.user.refreshToken = tokens.refreshToken;

    res.redirect(
      `${config.CLIENT_URL}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
    );
    res.redirect();
  } catch (error) {
    next(error);
  }
});

const refreshToken = asyncHandler(async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, config.JWT.REFRESH_SECRET);

    const user = await User.findById(decoded.sub);

    if (!user || user.refreshToken != refreshToken) {
      throw new ApiError("Invalid refresh token");
    }

    const newTokens = generateTokens(user);
    user.refreshToken = newTokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, newTokens, "Token refreshed successfully"));
  } catch (error) {
    next(error);
  }
});

const logout = asyncHandler(async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  } catch (error) {
    next(error);
  }
});
export { register, login, googleAuth, refreshToken, logout };
