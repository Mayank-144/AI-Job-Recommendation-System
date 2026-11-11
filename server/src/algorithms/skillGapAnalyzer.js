/**
 * Skill Gap Analyzer & Natural Language Explanation Generator
 * Pinpoints missing critical technical competencies and generates
 * transparent explanations for the candidate recommendation dashboard.
 */

/**
 * Analyzes the delta between candidate skills and required job skills
 * @param {string[]} matchingSkills
 * @param {string[]} missingSkills
 * @param {number} overallMatchPercentage
 * @param {object} job
 * @param {object} candidate
 * @returns {{ skillCoverageRatio: number, explanation: string }}
 */
const analyzeSkillGap = (
  matchingSkills = [],
  missingSkills = [],
  overallMatchPercentage = 0,
  job = {},
  candidate = {}
) => {
  const totalRequired = matchingSkills.length + missingSkills.length;
  const skillCoverageRatio = totalRequired === 0 ? 1 : matchingSkills.length / totalRequired;

  let explanation = '';

  if (overallMatchPercentage >= 80) {
    explanation = `Outstanding Match (${overallMatchPercentage}%). Your profile strongly aligns with the core requirements of ${job.title} at ${job.company}. You possess ${matchingSkills.length} of ${totalRequired} required skills.`;
  } else if (overallMatchPercentage >= 60) {
    explanation = `Good Potential Match (${overallMatchPercentage}%). You have a solid foundational skill overlap (${matchingSkills.join(', ')}). Acquiring experience in [${missingSkills.slice(0, 3).join(', ')}] will significantly improve your competitiveness.`;
  } else if (overallMatchPercentage >= 40) {
    explanation = `Moderate Compatibility (${overallMatchPercentage}%). While your background matches skills like ${matchingSkills.join(', ') || 'general IT foundations'}, this position requires key competencies you have not yet listed: [${missingSkills.slice(0, 4).join(', ')}].`;
  } else {
    explanation = `Low Match (${overallMatchPercentage}%). High skill gap identified. The role requires specialized expertise in [${missingSkills.slice(0, 5).join(', ')}].`;
  }

  // Append experience contextual explanation
  const candidateExp = candidate.experienceYears || 0;
  const minJobExp = job.minExperience || 0;

  if (candidateExp < minJobExp) {
    explanation += ` Note: Job requires ${minJobExp}+ years experience, while your profile shows ~${candidateExp} years.`;
  }

  return {
    skillCoverageRatio: Math.round(skillCoverageRatio * 100) / 100,
    explanation,
  };
};

module.exports = {
  analyzeSkillGap,
};
