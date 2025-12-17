import mongoose from 'mongoose';

const hospitalRequestSchema = new mongoose.Schema({
  hospital_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodbank_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request_type: {
    type: String,
    enum: ['patient', 'inventory'],
    required: true
  },
  blood_type: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  units_requested: {
    type: Number,
    required: true,
    min: 1
  },
  urgency_level: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  patient_details: {
    name: String,
    age: Number,
    condition: String
  },
  reason: {
    type: String,
    required: true
  },
  search_radius: {
    type: Number,
    default: 10, // kilometers
    min: 1,
    max: 100
  },
  hospital_location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  available_bloodbanks: [{
    bloodbank_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    distance: Number,
    available_units: Number,
    has_blood_type: Boolean
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  response_message: {
    type: String
  },
  responded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responded_at: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updated_at field before saving
hospitalRequestSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create indexes for better query performance
hospitalRequestSchema.index({ hospital_id: 1, status: 1 });
hospitalRequestSchema.index({ bloodbank_id: 1, status: 1 });
hospitalRequestSchema.index({ created_at: -1 });

const HospitalRequest = mongoose.models.HospitalRequest || mongoose.model('HospitalRequest', hospitalRequestSchema);

export default HospitalRequest;
