import mongoose from "mongoose";

const donationDriveSchema = new mongoose.Schema({
  organizer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // hospital or bloodbank_admin
  organizer_type: { type: String, enum: ["hospital", "bloodbank", "bloodbank_admin"], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  required_blood_types: [{ type: String }], // optional array
  contact_number: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.DonationDrive || mongoose.model("DonationDrive", donationDriveSchema);
