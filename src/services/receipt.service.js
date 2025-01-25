import mongoose from "mongoose";
import Receipt from "../models/receipt.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import logger from "../logger/index.js";
const createReceipt = async (userId, receiptData) => {
  try {
    return await Receipt.create({ ...receiptData, user: userId });
  } catch (error) {
    throw new Error(error);
  }
};

const getUserReceipts = async (userId) => {
  try {
    const receipts = await Receipt.find({ user: userId }).sort({
      purchaseDate: -1,
    });
    return receipts;
  } catch (error) {
    throw new Error(error);
  }
};

const getReceiptById = async (userId, receiptId) => {
  const receipt = await Receipt.find({ user: userId, _id: receiptId });

  if (!receipt) {
    throw new ApiError(404, "Receipt not found");
  }

  return receipt;
};

const searchReceipts = async (
  userId,
  { query, startDate, endDate, minAmount, maxAmount }
) => {
  try {
    const searchQuery = { user: userId };

    // Text search
    if (query) {
      searchQuery.$or = [
        { receiptName: { $regex: query, $options: "i" } },
        { vendor: { $regex: query, $options: "i" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      searchQuery.purchase_date = {};
      if (startDate) searchQuery.purchase_date.$gte = new Date(startDate);
      if (endDate) searchQuery.purchase_date.$lte = new Date(endDate);
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      searchQuery.total_amount = {};
      if (minAmount) searchQuery.total_amount.$gte = Number(minAmount);
      if (maxAmount) searchQuery.total_amount.$lte = Number(maxAmount);
    }

    return await Receipt.find(searchQuery).sort({ purchase_date: -1 }).lean();
  } catch (error) {
    throw new ApiError(500, "Search failed: " + error.message);
  }
};

const updateReceipt = async (userId, receiptId, updateData) => {
  try {
    //validate receiptId
    if (!mongoose.Types.ObjectId.isValid(receiptId)) {
      throw new ApiError(400, "Invalid receipt ID format");
    }

    //Find and update
    const receipt = await Receipt.findOneAndUpdate(
      {
        _id: receiptId,
        user: userId,
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!receipt) {
      throw new ApiError(404, "Receipt not found");
    }

    return receipt;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to update receipt: ", error.message);
  }
};

const deleteReceipt = async (userId, receiptId) => {
  try {
    //Validate receiptId
    if (!mongoose.Types.ObjectId.isValid(receiptId)) {
      throw new ApiError(400, "Invalid receiptId format");
    }

    //Find receipt
    const receipt = await Receipt.findOne({ user: userId, _id: receiptId });

    if (!receipt) {
      throw new ApiError(404, "Receipt not found");
    }

    //Delete from cloudinary
    if (receipt.file?.publicId) {
      try {
        await deleteFromCloudinary(receipt.file?.publicId);
      } catch (error) {
        throw new ApiError(
          500,
          "Unexpected error while deleting from cloudinary"
        );
      }
    }

    //Delete from database
    const result = await Receipt.deleteOne({ _id: receiptId });
    return result;

  } catch (error) {
    logger.error(error);
    if(error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to delete receipt: ", error.message);
  }
};
export const receiptService = {
  createReceipt,
  getUserReceipts,
  getReceiptById,
  searchReceipts,
  updateReceipt,
  deleteReceipt,
};
