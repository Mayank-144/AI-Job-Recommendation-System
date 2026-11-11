const express = require('express');
const router = express.Router();
const {
  uploadResumeHandler,
  getMyResume,
  updateResumeSkills,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const uploadResume = require('../middleware/uploadMiddleware');

router.post('/upload', protect, uploadResume.single('resume'), uploadResumeHandler);
router.get('/me', protect, getMyResume);
router.put('/skills', protect, updateResumeSkills);

module.exports = router;
