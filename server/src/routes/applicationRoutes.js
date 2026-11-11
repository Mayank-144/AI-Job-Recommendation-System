const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/apply/:jobId', protect, applyToJob);
router.get('/my-applications', protect, getMyApplications);
router.put('/:id/status', protect, authorize('admin'), updateApplicationStatus);

module.exports = router;
