import mongoose from 'mongoose';

const donorContactRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor', // Changed from 'Doner' to 'Donor'
    required: true
  },
  bloodType: {
    type: String,
    required: true
  },
  urgencyLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  message: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  responseDate: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
}, {
  timestamps: true
});

// Index for efficient queries
donorContactRequestSchema.index({ donorId: 1, status: 1 });
donorContactRequestSchema.index({ requesterId: 1, status: 1 });
donorContactRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const DonorContactRequest = mongoose.models.DonorContactRequest || 
  mongoose.model('DonorContactRequest', donorContactRequestSchema);

export default DonorContactRequest;