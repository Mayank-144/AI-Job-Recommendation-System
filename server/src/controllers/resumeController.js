const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { parseResumeFile } = require('../services/resumeParser');
const { cleanText } = require('../services/textPreprocessor');
const {
  extractSkills,
  normalizeSkills,
  extractExperienceYears,
} = require('../services/skillExtractor');

/**
 * @desc    Upload and parse candidate resume (PDF/DOCX)
 * @route   POST /api/resumes/upload
 * @access  Private (Candidate)
 */
const uploadResumeHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Please upload a resume file (PDF or DOCX)',
      });
    }

    const filePath = req.file.path;
    const originalFileName = req.file.originalname;

    // 1. Extract raw text from file
    const { rawText, fileType } = await parseResumeFile(filePath);

    if (!rawText || rawText.trim().length === 0) {
      // Cleanup file if empty
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(422).json({
        success: false,
        statusCode: 422,
        message: 'Could not extract readable text from the uploaded file. Please verify it is not scanned/empty.',
      });
    }

    // 2. Preprocess text (lower, noise removal)
    const cleaned = cleanText(rawText);

    // 3. Extract skills and experience heuristically
    const extractedSkills = extractSkills(cleaned);
    const experienceYears = extractExperienceYears(rawText);

    // 4. Upsert Resume profile in MongoDB
    let resume = await Resume.findOne({ userId: req.user._id });

    if (resume) {
      // Remove old file from disk if path changed
      if (resume.filePath && fs.existsSync(resume.filePath) && resume.filePath !== filePath) {
        try { fs.unlinkSync(resume.filePath); } catch (e) { /* silent */ }
      }

      resume.originalFileName = originalFileName;
      resume.fileType = fileType;
      resume.filePath = filePath;
      resume.rawText = rawText;
      resume.cleanedText = cleaned;
      resume.skills = extractedSkills;
      resume.experienceYears = experienceYears;
      resume.isManuallyEdited = false;
      await resume.save();
    } else {
      resume = await Resume.create({
        userId: req.user._id,
        originalFileName,
        fileType,
        filePath,
        rawText,
        cleanedText: cleaned,
        skills: extractedSkills,
        experienceYears,
        isManuallyEdited: false,
      });

      // Link resume to User document
      await User.findByIdAndUpdate(req.user._id, { resumeId: resume._id });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Resume parsed and profile updated successfully',
      data: {
        _id: resume._id,
        originalFileName: resume.originalFileName,
        fileType: resume.fileType,
        skills: resume.skills,
        experienceYears: resume.experienceYears,
        isManuallyEdited: resume.isManuallyEdited,
        textSnippet: resume.cleanedText.substring(0, 300) + '...',
      },
    });
  } catch (error) {
    // Cleanup temporary file in case of error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* silent */ }
    }
    next(error);
  }
};

/**
 * @desc    Get currently authenticated candidate's resume profile
 * @route   GET /api/resumes/me
 * @access  Private (Candidate)
 */
const getMyResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'No resume profile found. Please upload your resume first.',
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Allow candidate to review and manually update extracted skills & experience
 * @route   PUT /api/resumes/skills
 * @access  Private (Candidate)
 */
const updateResumeSkills = async (req, res, next) => {
  try {
    const { skills, experienceYears } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Skills must be provided as an array of strings',
      });
    }

    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Resume profile not found. Please upload a resume first.',
      });
    }

    // Normalize user-edited skills
    const normalized = normalizeSkills(skills);

    resume.skills = normalized;
    if (typeof experienceYears === 'number' && experienceYears >= 0) {
      resume.experienceYears = experienceYears;
    }
    resume.isManuallyEdited = true;
    await resume.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Resume skills and profile updated successfully',
      data: {
        _id: resume._id,
        skills: resume.skills,
        experienceYears: resume.experienceYears,
        isManuallyEdited: resume.isManuallyEdited,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResumeHandler,
  getMyResume,
  updateResumeSkills,
};

