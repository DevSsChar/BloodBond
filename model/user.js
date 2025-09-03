const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true
  },
//   password: {
//     type: String,
//     required: [true, "Password is required"]
//   },
  lastLoginDate: {
    type: Date,
    default: Date.now
  }
});

// Check if model already exists (for Next.js hot reloading)
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;