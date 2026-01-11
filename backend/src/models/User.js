const mongoose = require('mongoose');

// Citizen User Schema
const citizenUserSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    firstName: String,
    lastName: String,
    fullName: String,
    role: {
      type: String,
      enum: ['citizen'],
      default: 'citizen',
    },
    profileImage: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      emailAlerts: {
        type: Boolean,
        default: true,
      },
      preferredWards: [Number], // List of ward IDs
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    metadata: {
      lastLogin: Date,
      loginCount: {
        type: Number,
        default: 0,
      },
      deviceInfo: String,
    },
  },
  {
    timestamps: true,
  }
);

// Authority User Schema
const authorityUserSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    authorityId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    fullName: String,
    role: {
      type: String,
      enum: ['authority'],
      default: 'authority',
    },
    wardId: {
      type: Number,
      required: true,
      index: true,
    },
    wardName: String,
    departmentName: String,
    designation: String,
    phoneNumber: String,
    officeAddress: String,
    profileImage: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: {
      documentType: String,
      documentUrl: String,
      uploadedAt: Date,
      verified: Boolean,
    },
    permissions: {
      canEditAQIData: {
        type: Boolean,
        default: true,
      },
      canManageAlerts: {
        type: Boolean,
        default: true,
      },
      canViewAnalytics: {
        type: Boolean,
        default: true,
      },
      canManageOfficers: {
        type: Boolean,
        default: false,
      },
    },
    metadata: {
      lastLogin: Date,
      loginCount: {
        type: Number,
        default: 0,
      },
      lastDataSubmission: Date,
      totalSubmissions: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  CitizenUser: mongoose.model('CitizenUser', citizenUserSchema),
  AuthorityUser: mongoose.model('AuthorityUser', authorityUserSchema),
};
