import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema({
  requested_by_user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  requested_by_hospital: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // hospital is also a user
  bloodbank_id: { type: mongoose.Schema.Types.ObjectId, ref: "BloodBank", required: true },
  blood_type: { type: String, required: true },
  units_required: { type: Number, required: true },
  request_type: { type: String, enum: ["normal", "emergency"], default: "emergency" },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  requested_date: { type: Date, default: Date.now },
  fulfilled_date: { type: Date, default: null },
  rejection_reason: { type: String, default: null },
  emergency_contact_name: { type: String, default: null },
  emergency_contact_mobile: { type: String, default: null },
  // Additional fields for emergency requests
  emergency_details: { type: String, default: null },
  hospital_location: { type: String, default: null },
  user_latitude: { type: Number, default: null },
  user_longitude: { type: Number, default: null },
  // Fields for non-logged-in emergency requests
  emergency_requester_name: { type: String, default: null },
  emergency_requester_email: { type: String, default: null },
  relation_to_patient: { type: String, default: null }
});

export default mongoose.models.BloodRequest || mongoose.model("BloodRequest", bloodRequestSchema);
    