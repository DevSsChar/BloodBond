import mongoose from "mongoose";

const emergencyAadhaarVerificationSchema = new mongoose.Schema({
  client_state: { type: String, required: true, unique: true, index: true },
  sandbox_session_id: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: ["pending", "verified", "failed", "expired"],
    default: "pending",
  },
  aadhaar_subject_ref: { type: String, default: null, index: true },
  verified_name: { type: String, default: null },
  verified_at: { type: Date, default: null },
  expires_at: { type: Date, default: null },
  used_by_request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodRequest",
    default: null,
  },
  failure_reason: { type: String, default: null },
});

export default mongoose.models.EmergencyAadhaarVerification ||
  mongoose.model("EmergencyAadhaarVerification", emergencyAadhaarVerificationSchema);
