import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  blood_type: String,
  mobile_number: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ["user", "hospital", "bloodbank_admin"], required: true }
});

export default mongoose.models.User || mongoose.model("User", userSchema);
