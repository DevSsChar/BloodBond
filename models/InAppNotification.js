import mongoose from "mongoose";

const inAppNotificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["birthday_reminder", "system"],
    default: "system"
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  send_date: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: null }
}, {
  timestamps: true
});

inAppNotificationSchema.index({ user_id: 1, is_read: 1, send_date: -1 });
inAppNotificationSchema.index({ user_id: 1, type: 1, send_date: 1 });

export default mongoose.models.InAppNotification || mongoose.model("InAppNotification", inAppNotificationSchema);
