/**
 * Cosine Similarity Calculator
 * Measures the cosine of the angle between two multi-dimensional numerical vectors.
 * Formula: CosineSimilarity(A, B) = (A · B) / (||A|| * ||B||)
 */

/**
 * Computes Cosine Similarity between vector A and vector B
 * @param {number[]} vecA - Array of numerical values
 * @param {number[]} vecB - Array of numerical values
 * @returns {number} - Similarity score between 0.0 and 1.0 (or 0 to 100 percentage)
 */
const calculateCosineSimilarity = (vecA, vecB) => {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }

  const length = Math.min(vecA.length, vecB.length);

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < length; i++) {
    const a = vecA[i];
    const b = vecB[i];

    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);

  if (magnitude === 0) {
    return 0;
  }

  const similarity = dotProduct / magnitude;

  // Clamp within bounds [0, 1] for safety against floating point inaccuracies
  return Math.max(0, Math.min(1, similarity));
};

module.exports = {
  calculateCosineSimilarity,
};
