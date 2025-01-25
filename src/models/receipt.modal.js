import mongoose, { Schema } from "mongoose";

const ReceiptSchema = new Schema({
  // User ref
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  // File Details
  file: {
    url: { type: String, required: true },
    type: { type: String, enum: ["pdf", "image"], required: true },
    size: { type: Number, required: true }, // In bytes
  },

  receiptName: {
    type: String,
    required: true,
    trim: true,
  },
  vendor: {
    type: String,
    required: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: "INR",
    enum: ["INR", "USD", "EUR", "GBP"],
  },
  paymentMethod: String,

  // Relationships
  warranties: {
    type: Schema.Types.ObjectId,
    ref: "Warranty",
  },

  // User Customization
  userNotes: String,
  uploaded_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Receipt", ReceiptSchema);
