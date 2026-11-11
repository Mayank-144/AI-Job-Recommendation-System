/**
 * Skill Matcher Algorithm
 * Calculates skill compatibility between Candidate Profile and Job Requirements
 * using Set Overlap Ratio and Jaccard Similarity Index.
 */

/**
 * Computes exact skill match metrics
 * @param {string[]} candidateSkills - Normalized candidate skills array
 * @param {string[]} jobSkills - Normalized job required skills array
 * @returns {{ matchScore: number, matchingSkills: string[], missingSkills: string[], jaccardIndex: number }}
 */
const calculateSkillMatch = (candidateSkills = [], jobSkills = []) => {
  if (!Array.isArray(jobSkills) || jobSkills.length === 0) {
    // If a job doesn't specify any required skills, baseline compatibility is 100%
    return {
      matchScore: 100,
      matchingSkills: candidateSkills || [],
      missingSkills: [],
      jaccardIndex: 1.0,
    };
  }

  const candSet = new Set((candidateSkills || []).map((s) => s.toLowerCase().trim()));
  const jobSet = new Set(jobSkills.map((s) => s.toLowerCase().trim()));

  const matchingSkills = [];
  const missingSkills = [];

  jobSet.forEach((skill) => {
    if (candSet.has(skill)) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // 1. Recall Overlap Score (How much of the job's requirement is satisfied)
  const overlapRatio = matchingSkills.length / jobSet.size;

  // 2. Jaccard Similarity Index = |Intersection| / |Union|
  const unionSet = new Set([...candSet, ...jobSet]);
  const jaccardIndex = unionSet.size === 0 ? 0 : matchingSkills.length / unionSet.size;

  // Match score is represented as 0 to 100
  const matchScore = Math.round(overlapRatio * 100 * 100) / 100;

  return {
    matchScore,
    matchingSkills,
    missingSkills,
    jaccardIndex: Math.round(jaccardIndex * 1000) / 1000,
  };
};

module.exports = {
  calculateSkillMatch,
};
