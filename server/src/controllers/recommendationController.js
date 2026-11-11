const Recommendation = require('../models/Recommendation');
const Resume = require('../models/Resume');
const { generateUserRecommendations } = require('../services/recommendationService');

/**
 * @desc    Get personalized job recommendations for authenticated candidate
 * @route   GET /api/recommendations
 * @access  Private (Candidate)
 */
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check if candidate has uploaded a resume
    const resume = await Resume.findOne({ userId });
    if (!resume) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'No resume profile found. Please upload your resume first to view recommendations.',
      });
    }

    // Check if precomputed recommendations exist
    let count = await Recommendation.countDocuments({ userId });

    // If never computed before, trigger recommendation pipeline
    if (count === 0) {
      await generateUserRecommendations(userId);
    }

    const { page = 1, limit = 10, minMatch = 0 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      userId,
      overallMatchPercentage: { $gte: Number(minMatch) },
    };

    const totalRecommendations = await Recommendation.countDocuments(query);
    const recommendations = await Recommendation.find(query)
      .populate('jobId')
      .sort({ rank: 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      statusCode: 200,
      count: recommendations.length,
      totalRecommendations,
      totalPages: Math.ceil(totalRecommendations / limitNum),
      currentPage: pageNum,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Recalculate & refresh personalized job recommendations
 * @route   POST /api/recommendations/refresh
 * @access  Private (Candidate)
 */
const refreshRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const ranked = await generateUserRecommendations(userId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Recommendations refreshed successfully based on your latest profile and active listings',
      totalRecommended: ranked.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  refreshRecommendations,
};

