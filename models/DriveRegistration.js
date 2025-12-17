import mongoose from "mongoose";

const driveRegistrationSchema = new mongoose.Schema({
  donor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  drive_id: { type: mongoose.Schema.Types.ObjectId, ref: "DonationDrive", required: true },
  status: { 
    type: String, 
    enum: ["registered", "attended", "cancelled"], 
    default: "registered" 
  },
  registration_date: { type: Date, default: Date.now },
  attendance_date: { type: Date },
  notes: { type: String }
});

// Create compound index to prevent duplicate registrations
driveRegistrationSchema.index({ donor_id: 1, drive_id: 1 }, { unique: true });

// Force model recompilation if it exists
if (mongoose.models.DriveRegistration) {
  delete mongoose.models.DriveRegistration;
}

export default mongoose.model("DriveRegistration", driveRegistrationSchema);