const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    cleanedText: {
      type: String,
      required: true,
    },
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
      },
    ],
    isManuallyEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index skills for fast search and aggregation
resumeSchema.index({ skills: 1 });

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
