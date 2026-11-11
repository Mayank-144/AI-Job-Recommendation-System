const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    requiredSkills: [
      {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    ],
    minExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxExperience: {
      type: Number,
      default: 10,
    },
    location: {
      type: String,
      required: [true, 'Please specify the job location'],
      trim: true,
      index: true,
    },
    jobType: {
      type: String,
      enum: ['Remote', 'Onsite', 'Hybrid'],
      default: 'Remote',
      index: true,
    },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for title, description, and skills for keyword searching
jobSchema.index({
  title: 'text',
  description: 'text',
  requiredSkills: 'text',
  company: 'text',
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
