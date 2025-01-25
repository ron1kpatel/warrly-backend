import mongoose, { Schema } from "mongoose";

const WarrantySchema = new Schema({
    // File Details
    file: {
      url: { type: String, required: true },
      type: { type: String, enum: ['pdf', 'image'], required: true },
      size: { type: Number, required: true }
    },
  
    // Product Details
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
  
    // Warranty Period
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
  
    // Relationships
    receipt: {
      type: Schema.Types.ObjectId,
      ref: 'Receipt'
    },
  
    // User Customizations
    userNotes: String,
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    }
  });

  export default mongoose.model('Warranty', WarrantySchema);