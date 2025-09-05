import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // role = bloodbank_admin
  bloodbank_id: { type: mongoose.Schema.Types.ObjectId, ref: "BloodBank", required: true },
  action: { type: String, enum: ["add", "remove", "update"], required: true },
  blood_type: { type: String, required: true },
  units_changed: { type: Number, required: true },
  log_date: { type: Date, default: Date.now }
});

export default mongoose.models.InventoryLog || mongoose.model("InventoryLog", inventoryLogSchema);
s