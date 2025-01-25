import moment from "moment";
import { receiptService } from "../services/receipt.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs/promises";

export const createReceipt = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw new ApiError(401, "Authentication required");
  if (!req.file) throw new ApiError(400, "Receipt file is required");

  // Validate required fields
  const requiredFields = [
    "receiptName",
    "vendor",
    "purchaseDate",
    "totalAmount",
  ];
  const missingFields = requiredFields.filter(
    (field) => !req.body[field]?.trim()
  );
  if (missingFields.length) {
    throw new ApiError(400, `Missing fields: ${missingFields.join(", ")}`);
  }

  // Date validation
  const purchaseDate = moment(req.body.purchaseDate.trim(), "YYYY-MM-DD", true);
  if (!purchaseDate.isValid()) {
    throw new ApiError(400, "Invalid date format (Use YYYY-MM-DD)");
  }

  // File upload
  let cloudinaryResponse;
  try {
    cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse?.secure_url) {
      throw new ApiError(500, "File upload failed");
    }
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }

  // Build receipt data
  const receiptData = {
    receiptName: req.body.receiptName.trim(),
    vendor: req.body.vendor.trim(),
    purchaseDate: purchaseDate.utc().set({ hour: 12 }).toDate(),
    totalAmount: Number(req.body.totalAmount),
    currency: req.body.currency?.trim().toUpperCase() || "INR",
    paymentMethod: req.body.paymentMethod?.trim(),
    file: {
      url: cloudinaryResponse.secure_url,
      type: cloudinaryResponse.resource_type === "image" ? "image" : "pdf",
      size: cloudinaryResponse.bytes,
    },
    userNotes: req.body.userNotes?.trim(),
  };

  // Validate amount
  if (isNaN(receiptData.totalAmount) || receiptData.totalAmount <= 0) {
    throw new ApiError(400, "Invalid total amount");
  }

  try {
    const receipt = await receiptService.createReceipt(
      req.user._id,
      receiptData
    );
    await fs.unlink(req.file.path).catch(() => {});

    return res
      .status(201)
      .json(new ApiResponse(201, receipt, "Receipt created"));
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    throw error;
  }
});

export const getReceipts = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw new ApiError(401, "Authentication required");

  const receipts = await receiptService.getUserReceipts(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, receipts, "Receipts retrieved"));
});

export const getReceiptById = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw new ApiError(401, "Authentication required");

  const receipt = await receiptService.getReceiptById(
    req.user._id,
    req.params.receiptId
  );

  if (!receipt) throw new ApiError(404, "Receipt not found");

  return res
    .status(200)
    .json(new ApiResponse(200, receipt, "Receipt retrieved"));
});

export const updateReceipt = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw new ApiError(401, "Authentication required");

  const updatedReceipt = await receiptService.updateReceipt(
    req.user._id,
    req.params.receiptId,
    req.body
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedReceipt, "Receipt updated"));
});

export const deleteReceipt = asyncHandler(async (req, res) => {
  if (!req.user?._id) throw new ApiError(401, "Authentication required");

  const result = await receiptService.deleteReceipt(
    req.user._id,
    req.params.receiptId
  );

  if (result.deletedCount !== 1) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Unexpected error while deleting receipt"));
  }
  return res
      .status(204)
      .json(new ApiResponse(204, {}, "Receipt deleted"));
  
});

export const searchReceipts = asyncHandler(async (req, res) => {
  // Authentication check
  if (!req.user?._id) {
    throw new ApiError(401, "Authentication required");
  }

  // Extract query parameters
  const { query, startDate, endDate, minAmount, maxAmount } = req.query;

  // Validate date formats
  const validateISODate = (dateStr) =>
    moment(dateStr, moment.ISO_8601, true).isValid();

  if (startDate && !validateISODate(startDate)) {
    throw new ApiError(400, "Invalid startDate format. Use YYYY-MM-DD");
  }

  if (endDate && !validateISODate(endDate)) {
    throw new ApiError(400, "Invalid endDate format. Use YYYY-MM-DD");
  }

  // Validate amount formats
  const validateNumber = (value) => !isNaN(parseFloat(value));

  if (minAmount && !validateNumber(minAmount)) {
    throw new ApiError(400, "minAmount must be a number");
  }

  if (maxAmount && !validateNumber(maxAmount)) {
    throw new ApiError(400, "maxAmount must be a number");
  }

  // Build search criteria
  const searchCriteria = {
    query: query?.trim(),
    startDate: startDate || null,
    endDate: endDate || null,
    minAmount: minAmount ? parseFloat(minAmount) : null,
    maxAmount: maxAmount ? parseFloat(maxAmount) : null,
  };

  try {
    const receipts = await receiptService.searchReceipts(
      req.user._id,
      searchCriteria
    );

    return res
      .status(200)
      .json(new ApiResponse(200, receipts, "Receipts retrieved successfully"));
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to search receipts"
    );
  }
});
