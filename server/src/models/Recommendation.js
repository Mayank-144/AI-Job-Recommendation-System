const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    overallMatchPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    matchingSkills: [
      {
        type: String,
        lowercase: true,
      },
    ],
    missingSkills: [
      {
        type: String,
        lowercase: true,
      },
    ],
    scoreBreakdown: {
      skillScore: { type: Number, default: 0 },
      tfidfScore: { type: Number, default: 0 },
      experienceScore: { type: Number, default: 0 },
      locationScore: { type: Number, default: 0 },
      educationScore: { type: Number, default: 0 },
      interactionBoost: { type: Number, default: 0 },
    },
    explanation: {
      type: String,
      required: true,
    },
    rank: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so one job recommendation entry exists per user per job run
recommendationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
module.exports = Recommendation;

