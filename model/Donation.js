import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bloodbank_id: { type: String, required: true },
  blood_type: { type: String, required: true },
  units_donated: { type: Number, required: true },
  donation_date: { type: Date, default: Date.now }
});

export default mongoose.models.Donation || mongoose.model("Donation", donationSchema);
