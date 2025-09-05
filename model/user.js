import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ["user", "hospital", "bloodbank_admin"], default: null }, // Not required initially, set during role selection
  isRegistrationComplete: { type: Boolean, default: false }, // Tracks if user has completed role-specific registration
  lastLoginDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model("User", userSchema);
