const mongoose = require('mongoose');

const wardCreditsSchema = new mongoose.Schema(
  {
    wardNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    wardName: {
      type: String,
      required: true,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    memberCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WardCredits', wardCreditsSchema);
