import mongoose from "mongoose";

const hospitalInventoryLogSchema = new mongoose.Schema({
  hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  blood_type: { type: String, required: true, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  action: { 
    type: String, 
    required: true, 
    enum: ["received", "used", "reserved", "unreserved", "expired", "transferred", "adjusted"] 
  },
  units_changed: { type: Number, required: true }, // Positive for additions, negative for removals
  units_before: { type: Number, required: true },
  units_after: { type: Number, required: true },
  patient_id: { type: String }, // For patient-specific usage tracking
  batch_number: { type: String },
  expiry_date: { type: Date },
  notes: { type: String },
  performed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  reference_id: { type: String } // Reference to related documents (e.g., blood request ID)
});

// Create indexes for better performance
hospitalInventoryLogSchema.index({ hospital_id: 1, timestamp: -1 });
hospitalInventoryLogSchema.index({ blood_type: 1 });
hospitalInventoryLogSchema.index({ action: 1 });
hospitalInventoryLogSchema.index({ timestamp: -1 });

export default mongoose.models.HospitalInventoryLog || mongoose.model("HospitalInventoryLog", hospitalInventoryLogSchema);
