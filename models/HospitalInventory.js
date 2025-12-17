import mongoose from "mongoose";

const hospitalInventorySchema = new mongoose.Schema({
  hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Hospital is a user with role 'hospital'
  blood_type: { type: String, required: true, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  units_available: { type: Number, required: true, min: 0 },
  units_reserved: { type: Number, default: 0, min: 0 }, // Units reserved for specific patients
  minimum_stock_level: { type: Number, default: 5 }, // Alert threshold
  maximum_capacity: { type: Number, default: 100 }, // Storage capacity
  date_of_entry: { type: Date, default: Date.now },
  expiry_date: { type: Date, required: true },
  batch_number: { type: String }, // For tracking purposes
  temperature: { type: Number, default: 4 }, // Storage temperature in Celsius
  last_updated: { type: Date, default: Date.now },
  status: { type: String, enum: ["available", "reserved", "expired", "used"], default: "available" }
});

// Update last_updated on save
hospitalInventorySchema.pre('save', function(next) {
  this.last_updated = new Date();
  next();
});

// Create indexes for better performance
hospitalInventorySchema.index({ hospital_id: 1, blood_type: 1 });
hospitalInventorySchema.index({ expiry_date: 1 });
hospitalInventorySchema.index({ status: 1 });

export default mongoose.models.HospitalInventory || mongoose.model("HospitalInventory", hospitalInventorySchema);
