/**
 * Weighted Recommendation Scoring Engine
 * Combines multi-criteria dimensions into a single explainable 0 - 100 compatibility score.
 *
 * Configurable Weights Model:
 * - Skill Match: 45% (0.45)
 * - TF-IDF Content Similarity: 25% (0.25)
 * - Experience Match: 15% (0.15)
 * - Location Compatibility: 10% (0.10)
 * - Education Compatibility: 5% (0.05)
 * + Feedback Interaction Boost (Dynamic adjustment)
 */

const DEFAULT_WEIGHTS = {
  skillWeight: 0.45,
  tfidfWeight: 0.25,
  experienceWeight: 0.15,
  locationWeight: 0.10,
  educationWeight: 0.05,
};

/**
 * Calculates experience compatibility sub-score (0 to 100)
 */
const calculateExperienceScore = (candidateExp = 0, minExp = 0, maxExp = 10) => {
  if (candidateExp >= minExp && candidateExp <= maxExp) {
    return 100; // Perfect fit
  }

  if (candidateExp > maxExp) {
    // Over-qualified candidate: slight penalty or near-perfect
    return 85;
  }

  // Under-qualified candidate: scaled down proportional to deficit
  const deficit = minExp - candidateExp;
  if (deficit <= 1) return 70;
  if (deficit <= 2) return 50;
  if (deficit <= 3) return 30;
  return 10;
};

/**
 * Calculates location compatibility sub-score (0 to 100)
 */
const calculateLocationScore = (candidateLocation = '', jobLocation = '', jobType = 'Remote') => {
  // Remote jobs fit everyone regardless of location
  if (jobType === 'Remote' || (jobLocation && jobLocation.toLowerCase() === 'remote')) {
    return 100;
  }

  if (!candidateLocation) {
    // If candidate has no location preference specified, neutral fallback
    return 60;
  }

  const candLoc = candidateLocation.toLowerCase().trim();
  const jLoc = (jobLocation || '').toLowerCase().trim();

  if (candLoc === jLoc || jLoc.includes(candLoc) || candLoc.includes(jLoc)) {
    return 100;
  }

  // Onsite/Hybrid with different city
  return 30;
};

/**
 * Calculates education compatibility sub-score (0 to 100)
 */
const calculateEducationScore = (candidateEducation = []) => {
  if (!Array.isArray(candidateEducation) || candidateEducation.length === 0) {
    return 70; // Baseline neutral for candidates with projects/skills but unlisted degrees
  }
  return 100;
};

/**
 * Calculates the overall weighted recommendation score
 * @param {object} params
 * @returns {{ overallScore: number, breakdown: object }}
 */
const calculateWeightedScore = ({
  skillScore = 0,
  tfidfScore = 0, // 0 to 1 float or 0 to 100
  candidateExp = 0,
  minJobExp = 0,
  maxJobExp = 10,
  candidateLocation = '',
  jobLocation = '',
  jobType = 'Remote',
  candidateEducation = [],
  interactionBoost = 0, // e.g. +5 for viewed, +10 for saved, -15 for dismissed
  weights = DEFAULT_WEIGHTS,
}) => {
  // Normalize tfidf to 0 - 100 scale if it is 0 - 1 float
  const normalizedTfidf = tfidfScore <= 1.0 ? tfidfScore * 100 : tfidfScore;

  const experienceScore = calculateExperienceScore(candidateExp, minJobExp, maxJobExp);
  const locationScore = calculateLocationScore(candidateLocation, jobLocation, jobType);
  const educationScore = calculateEducationScore(candidateEducation);

  // Apply weighted linear formula
  const weightedBase =
    skillScore * weights.skillWeight +
    normalizedTfidf * weights.tfidfWeight +
    experienceScore * weights.experienceWeight +
    locationScore * weights.locationWeight +
    educationScore * weights.educationWeight;

  // Add interaction personalization boost
  let finalScore = weightedBase + (interactionBoost || 0);

  // Clamp strictly between 0 and 100
  finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

  return {
    overallScore: finalScore,
    breakdown: {
      skillScore: Math.round(skillScore),
      tfidfScore: Math.round(normalizedTfidf),
      experienceScore: Math.round(experienceScore),
      locationScore: Math.round(locationScore),
      educationScore: Math.round(educationScore),
      interactionBoost: interactionBoost || 0,
    },
  };
};

module.exports = {
  DEFAULT_WEIGHTS,
  calculateExperienceScore,
  calculateLocationScore,
  calculateEducationScore,
  calculateWeightedScore,
};

