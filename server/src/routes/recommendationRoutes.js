const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  refreshRecommendations,
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRecommendations);
router.post('/refresh', protect, refreshRecommendations);

module.exports = router;

