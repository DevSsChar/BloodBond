import mongoose from "mongoose";

const bloodBankSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  contact_number: { type: String, required: true }
});

export default mongoose.models.BloodBank || mongoose.model("BloodBank", bloodBankSchema);
