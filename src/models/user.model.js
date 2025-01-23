import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'
const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    select: false,
    minlength: [8, 'Password must be at least 8 characters long']
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  refreshToken: {
    type: String,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// userSchema.index({email: 1}, {unique: true})
// userSchema.index({googleId: 1}, {unique: true, sparse: true})
// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

//TODO: Setup Authentication With two strategy email password and google 
//TODO: Add Receipt Schema, Services, Controller, 
//TODO: Add Warranty SChema, Service, Controller, (Handle Reminder creation within)
//TODO: Add Reminders Schema, Service, Controller (For updating, getting, and deleting)
//TODO: Add /receipts/extractfields endpoint
//TODO: Add /warranties/extractfield endpoint
//TODO: Handle attatched Receipt and Warranty 