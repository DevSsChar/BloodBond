import mongoose from "mongoose";

const bloodInventorySchema = new mongoose.Schema({
  bloodbank_id: { type: mongoose.Schema.Types.ObjectId, ref: "BloodBank", required: true },
  blood_type: { type: String, required: true },
  units_available: { type: Number, required: true },
  date_of_entry: { type: Date, default: Date.now },
  expiry_date: { type: Date, required: true }
});

export default mongoose.models.BloodInventory || mongoose.model("BloodInventory", bloodInventorySchema);
