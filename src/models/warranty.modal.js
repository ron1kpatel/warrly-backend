const WarrantySchema = new Schema({
    // File Details
    file: {
      url: { type: String, required: true },
      type: { type: String, enum: ['pdf', 'image'], required: true },
      size: { type: Number, required: true }
    },
  
    // Product Details
    product_name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0
    },
  
    // Warranty Period
    purchase_date: {
      type: Date,
      required: true
    },
    expiry_date: {
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
    receipts: {
      type: Schema.Types.ObjectId,
      ref: 'Receipt'
    },
  
    // User Customizations
    user_notes: String,
    uploaded_at: { 
      type: Date, 
      default: Date.now 
    }
  });