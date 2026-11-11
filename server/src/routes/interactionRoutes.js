const express = require('express');
const router = express.Router();
const {
  recordInteraction,
  getSavedJobs,
} = require('../controllers/interactionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, recordInteraction);
router.get('/saved', protect, getSavedJobs);

module.exports = router;
