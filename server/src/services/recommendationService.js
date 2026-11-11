const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Recommendation = require('../models/Recommendation');
const Interaction = require('../models/Interaction');
const { calculateSkillMatch } = require('../algorithms/skillMatcher');
const TFIDFVectorizer = require('../algorithms/tfidf');
const { calculateCosineSimilarity } = require('../algorithms/cosineSimilarity');
const { calculateWeightedScore } = require('../algorithms/scoringEngine');
const { analyzeSkillGap } = require('../algorithms/skillGapAnalyzer');
const { rankJobs } = require('../algorithms/rankingEngine');

/**
 * Generates personalized job recommendations for a candidate
 * @param {string} userId - MongoDB ObjectId of the candidate
 * @returns {Promise<object[]>} - Array of ranked recommendation records
 */
const generateUserRecommendations = async (userId) => {
  // 1. Fetch Candidate's Resume Profile
  const resume = await Resume.findOne({ userId });
  if (!resume) {
    throw new Error('Please upload your resume to generate recommendations.');
  }

  // 2. Fetch all Active Jobs
  const activeJobs = await Job.find({ isActive: true });
  if (!activeJobs || activeJobs.length === 0) {
    return [];
  }

  // 3. Fetch Candidate's Interaction History for personalization boosts
  const interactions = await Interaction.find({ userId });
  const interactionMap = new Map();
  interactions.forEach((item) => {
    interactionMap.set(item.jobId.toString(), item.weight);
  });

  // 4. Fit TF-IDF Vectorizer on Resume + Active Job Descriptions
  const documents = [
    resume.cleanedText || resume.rawText || '',
    ...activeJobs.map((j) => `${j.title} ${j.description} ${j.requiredSkills.join(' ')}`),
  ];

  const vectorizer = new TFIDFVectorizer();
  vectorizer.fit(documents);

  const resumeVector = vectorizer.transform(resume.cleanedText || resume.rawText || '');

  // 5. Compute compatibility for each job
  const rawRecommendations = [];

  for (const job of activeJobs) {
    const jobText = `${job.title} ${job.description} ${job.requiredSkills.join(' ')}`;
    const jobVector = vectorizer.transform(jobText);

    // Algorithm A: Skill Overlap & Jaccard Match
    const skillMetrics = calculateSkillMatch(resume.skills || [], job.requiredSkills || []);

    // Algorithm B: Cosine Similarity of TF-IDF vectors
    const cosineSim = calculateCosineSimilarity(resumeVector, jobVector);

    // Personalization boost from user interaction history
    const interactionBoost = interactionMap.get(job._id.toString()) || 0;

    // Algorithm C: Weighted Multi-Criteria Scoring
    const scoringResult = calculateWeightedScore({
      skillScore: skillMetrics.matchScore,
      tfidfScore: cosineSim,
      candidateExp: resume.experienceYears || 0,
      minJobExp: job.minExperience || 0,
      maxJobExp: job.maxExperience || 10,
      candidateLocation: '', // Can be matched against candidate preferences
      jobLocation: job.location,
      jobType: job.jobType,
      candidateEducation: resume.education || [],
      interactionBoost,
    });

    // Algorithm D: Skill Gap & Explainable Reasoning Generator
    const gapAnalysis = analyzeSkillGap(
      skillMetrics.matchingSkills,
      skillMetrics.missingSkills,
      scoringResult.overallScore,
      job,
      resume
    );

    rawRecommendations.push({
      userId,
      jobId: job._id,
      overallMatchPercentage: scoringResult.overallScore,
      matchingSkills: skillMetrics.matchingSkills,
      missingSkills: skillMetrics.missingSkills,
      scoreBreakdown: scoringResult.breakdown,
      explanation: gapAnalysis.explanation,
      job,
    });
  }

  // 6. Rank jobs descending by overall compatibility
  const ranked = rankJobs(rawRecommendations);

  // 7. Store / Upsert recommendations into MongoDB
  const bulkOps = ranked.map((rec) => ({
    updateOne: {
      filter: { userId: rec.userId, jobId: rec.jobId },
      update: {
        $set: {
          overallMatchPercentage: rec.overallMatchPercentage,
          matchingSkills: rec.matchingSkills,
          missingSkills: rec.missingSkills,
          scoreBreakdown: rec.scoreBreakdown,
          explanation: rec.explanation,
          rank: rec.rank,
        },
      },
      upsert: true,
    },
  }));

  if (bulkOps.length > 0) {
    await Recommendation.bulkWrite(bulkOps);
  }

  return ranked;
};

module.exports = {
  generateUserRecommendations,
};
