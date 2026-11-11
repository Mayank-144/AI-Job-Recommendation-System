/**
 * Job Ranking Engine
 * Sorts and ranks job recommendations descending by overall compatibility score,
 * breaking ties using skill match percentage and interaction boosts.
 */

/**
 * Sorts and assigns numerical ranks (1, 2, 3...) to recommendation objects
 * @param {object[]} recommendationList
 * @returns {object[]} - Sorted and ranked recommendation items
 */
const rankJobs = (recommendationList = []) => {
  if (!Array.isArray(recommendationList)) return [];

  const sorted = [...recommendationList].sort((a, b) => {
    // Primary criterion: Overall Match Percentage (Descending)
    if (b.overallMatchPercentage !== a.overallMatchPercentage) {
      return b.overallMatchPercentage - a.overallMatchPercentage;
    }

    // Secondary criterion: Skill Score (Descending)
    const skillA = a.scoreBreakdown?.skillScore || 0;
    const skillB = b.scoreBreakdown?.skillScore || 0;
    if (skillB !== skillA) {
      return skillB - skillA;
    }

    // Tertiary criterion: TF-IDF Content Score (Descending)
    const tfidfA = a.scoreBreakdown?.tfidfScore || 0;
    const tfidfB = b.scoreBreakdown?.tfidfScore || 0;
    return tfidfB - tfidfA;
  });

  // Assign 1-based sequential rank
  return sorted.map((rec, index) => ({
    ...rec,
    rank: index + 1,
  }));
};

module.exports = {
  rankJobs,
};

