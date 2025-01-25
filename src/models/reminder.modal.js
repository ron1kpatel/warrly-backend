import mongoose, { Schema } from "mongoose";

const ReminderSchema = new Schema({
  warranty: {
    type: Schema.Types.ObjectId,
    ref: "Warranty",
    required: true, // Ensure every reminder is linked to a warranty
  },
  type: {
    type: String,
    required: true,
    enum: ["specific_date", "days_before_expiry"], // Allow only these two values
  },
  specific_date: {
    type: Date,
    validate: {
      validator: function (value) {
        // Validate that specific_date is only used when type is 'specific_date'
        return this.type === "specific_date" ? value != null : true;
      },
      message: "specific_date is required when type is 'specific_date'.",
    },
  },
  days_before_expiry: {
    type: Number,
    validate: {
      validator: function (value) {
        // Validate that days_before_expiry is only used when type is 'days_before_expiry'
        return this.type === "days_before_expiry" ? value != null : true;
      },
      message: "days_before_expiry is required when type is 'days_before_expiry'.",
    },
  },
});

// Add a pre-save hook to enforce mutual exclusivity
ReminderSchema.pre("validate", function (next) {
  if (this.type === "specific_date" && this.days_before_expiry != null) {
    return next(
      new Error(
        "Cannot specify both specific_date and days_before_expiry. Use one based on the type."
      )
    );
  }
  if (this.type === "days_before_expiry" && this.specific_date != null) {
    return next(
      new Error(
        "Cannot specify both specific_date and days_before_expiry. Use one based on the type."
      )
    );
  }
  next();
});

export default mongoose.model('Reminder', ReminderSchema);