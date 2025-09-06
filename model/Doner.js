import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  donor_id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // primary key
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // FK → User
  age: { type: Number, required: true }, // Donor's age
  blood_type: { type: String, required: true },
  mobile_number: { type: String, required: true }, // Donor's mobile number
  weight: { type: Number, required: true },
  emergency_contact_mobile: { type: String, required: true },
  total_donations: { type: Number, default: 0 }, // donation count
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Donor || mongoose.model("Donor", donorSchema);
