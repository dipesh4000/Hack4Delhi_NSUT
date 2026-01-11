const mongoose = require('mongoose');

const creditRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    activity: {
      type: String,
      required: true,
      enum: ['public_transport', 'carpool', 'report', 'tree'],
    },
    credits: {
      type: Number,
      required: true,
    },
    proofImage: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    wardNumber: {
      type: String,
      required: true,
      index: true,
    },
    approvedBy: String,
    rejectionReason: String,
    processedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('CreditRequest', creditRequestSchema);
