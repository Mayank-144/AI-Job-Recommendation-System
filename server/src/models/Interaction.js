const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
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
    actionType: {
      type: String,
      enum: ['viewed', 'saved', 'applied', 'dismissed'],
      required: true,
      index: true,
    },
    weight: {
      type: Number,
      required: true,
      default: 1.0, // e.g. viewed: 1, saved: 3, applied: 5, dismissed: -5
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch user interaction history for specific jobs
interactionSchema.index({ userId: 1, jobId: 1, actionType: 1 });

const Interaction = mongoose.model('Interaction', interactionSchema);
module.exports = Interaction;
