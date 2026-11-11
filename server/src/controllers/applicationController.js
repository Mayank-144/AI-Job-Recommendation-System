const Application = require('../models/Application');
const Job = require('../models/Job');
const Interaction = require('../models/Interaction');

/**
 * @desc    Apply to a job listing
 * @route   POST /api/applications/apply/:jobId
 * @access  Private (Candidate)
 */
const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { notes } = req.body;
    const userId = req.user._id;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Job listing not found or is no longer active',
      });
    }

    // Check for duplicate application
    const existing = await Application.findOne({ userId, jobId });
    if (existing) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: 'You have already submitted an application for this position',
      });
    }

    // Create Application
    const application = await Application.create({
      userId,
      jobId,
      notes: notes || '',
      status: 'applied',
    });

    // Automatically record interaction signal for feedback personalization (+5 boost)
    await Interaction.findOneAndUpdate(
      { userId, jobId, actionType: 'applied' },
      { userId, jobId, actionType: 'applied', weight: 5 },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications submitted by the current candidate
 * @route   GET /api/applications/my-applications
 * @access  Private (Candidate)
 */
const getMyApplications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const applications = await Application.find({ userId })
      .populate('jobId')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      statusCode: 200,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update candidate application status (Recruiter/Admin action)
 * @route   PUT /api/applications/:id/status
 * @access  Private (Admin Only)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['applied', 'under_review', 'shortlisted', 'rejected'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('jobId', 'title company')
      .populate('userId', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Application record not found',
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Application status updated to ${status}`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  updateApplicationStatus,
};
