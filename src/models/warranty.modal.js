import mongoose, { Schema } from "mongoose";

const WarrantySchema = new Schema({
    file: {
      url: { type: String, required: true },
      type: { type: String, enum: ['pdf', 'image'], required: true },
      size: { type: Number, required: true }
    },
  
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
  
    purchaseDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(this, value) {
          return value > this.purchase_date;
        },
        message: 'Expiry must be after purchase date'
      }
    },
  
    receipt: {
      type: Schema.Types.ObjectId,
      ref: 'Receipt'
    },
  
    userNotes: String,
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    }
  });

  export default mongoose.model('Warranty', WarrantySchema);