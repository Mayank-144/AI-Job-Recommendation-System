const Job = require('../models/Job');
const { normalizeSkills } = require('../services/skillExtractor');

/**
 * @desc    Get all jobs with search, filtering, and pagination
 * @route   GET /api/jobs
 * @access  Public
 */
const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      jobType,
      experience,
      skill,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isActive: true };

    // 1. Text Search (title, company, description, requiredSkills)
    if (search) {
      query.$text = { $search: search };
    }

    // 2. Location Filter (case-insensitive substring)
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // 3. Job Type Filter (Remote, Onsite, Hybrid)
    if (jobType) {
      query.jobType = jobType;
    }

    // 4. Experience Filter (Candidate's experience fits between min & max)
    if (experience !== undefined && experience !== '') {
      const expNum = Number(experience);
      query.minExperience = { $lte: expNum };
    }

    // 5. Skill Filter (matches jobs requiring specific skill)
    if (skill) {
      const canonical = skill.trim().toLowerCase();
      query.requiredSkills = { $in: [canonical] };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('postedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      statusCode: 200,
      count: jobs.length,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limitNum),
      currentPage: pageNum,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'postedBy',
      'name email role'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Job listing not found',
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new job listing
 * @route   POST /api/jobs
 * @access  Private (Admin Only)
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      description,
      requiredSkills,
      minExperience,
      maxExperience,
      location,
      jobType,
      salaryRange,
    } = req.body;

    if (!title || !company || !description || !requiredSkills || !location) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Please provide all mandatory fields: title, company, description, requiredSkills, location',
      });
    }

    // Normalize input skills into standard taxonomy
    const normalizedSkills = Array.isArray(requiredSkills)
      ? normalizeSkills(requiredSkills)
      : normalizeSkills(requiredSkills.split(','));

    const job = await Job.create({
      title,
      company,
      description,
      requiredSkills: normalizedSkills,
      minExperience: minExperience || 0,
      maxExperience: maxExperience || 10,
      location,
      jobType: jobType || 'Remote',
      salaryRange: salaryRange || { min: 0, max: 0, currency: 'INR' },
      postedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Job listing created successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a job listing
 * @route   PUT /api/jobs/:id
 * @access  Private (Admin Only)
 */
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Job listing not found',
      });
    }

    // If requiredSkills updated, normalize them
    if (req.body.requiredSkills) {
      req.body.requiredSkills = Array.isArray(req.body.requiredSkills)
        ? normalizeSkills(req.body.requiredSkills)
        : normalizeSkills(req.body.requiredSkills.split(','));
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Job listing updated successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a job listing (or soft-delete by marking inactive)
 * @route   DELETE /api/jobs/:id
 * @access  Private (Admin Only)
 */
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Job listing not found',
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Job listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};

