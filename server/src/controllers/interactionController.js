const Interaction = require('../models/Interaction');
const Job = require('../models/Job');

const INTERACTION_WEIGHTS = {
  viewed: 1,
  saved: 3,
  applied: 5,
  dismissed: -5,
};

/**
 * @desc    Record candidate interaction with a job (viewed, saved, dismissed)
 * @route   POST /api/interactions
 * @access  Private (Candidate)
 */
const recordInteraction = async (req, res, next) => {
  try {
    const { jobId, actionType } = req.body;
    const userId = req.user._id;

    if (!jobId || !actionType || !INTERACTION_WEIGHTS[actionType]) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid interaction. actionType must be one of: viewed, saved, dismissed',
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Job listing not found',
      });
    }

    const weight = INTERACTION_WEIGHTS[actionType];

    const interaction = await Interaction.findOneAndUpdate(
      { userId, jobId, actionType },
      { userId, jobId, actionType, weight },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Interaction '${actionType}' recorded successfully`,
      data: interaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get candidate's saved jobs
 * @route   GET /api/interactions/saved
 * @access  Private (Candidate)
 */
const getSavedJobs = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const savedInteractions = await Interaction.find({
      userId,
      actionType: 'saved',
    }).populate('jobId');

    const savedJobs = savedInteractions
      .filter((item) => item.jobId && item.jobId.isActive)
      .map((item) => item.jobId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      count: savedJobs.length,
      data: savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordInteraction,
  getSavedJobs,
};

