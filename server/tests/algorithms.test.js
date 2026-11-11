const { calculateSkillMatch } = require('../src/algorithms/skillMatcher');
const TFIDFVectorizer = require('../src/algorithms/tfidf');
const { calculateCosineSimilarity } = require('../src/algorithms/cosineSimilarity');
const {
  calculateExperienceScore,
  calculateLocationScore,
  calculateWeightedScore,
} = require('../src/algorithms/scoringEngine');
const { analyzeSkillGap } = require('../src/algorithms/skillGapAnalyzer');

describe('AI Recommendation Engine Algorithms Unit Tests', () => {
  describe('Skill Matcher Algorithm', () => {
    test('should calculate 100% match when all required skills are present', () => {
      const cand = ['react', 'node.js', 'mongodb'];
      const job = ['react', 'node.js'];
      const res = calculateSkillMatch(cand, job);
      expect(res.matchScore).toBe(100);
      expect(res.missingSkills).toHaveLength(0);
      expect(res.matchingSkills).toEqual(['react', 'node.js']);
    });

    test('should calculate partial overlap and identify missing skills', () => {
      const cand = ['react', 'javascript'];
      const job = ['react', 'node.js', 'docker', 'mongodb'];
      const res = calculateSkillMatch(cand, job);
      expect(res.matchScore).toBe(25);
      expect(res.matchingSkills).toEqual(['react']);
      expect(res.missingSkills).toEqual(['node.js', 'docker', 'mongodb']);
    });

    test('should handle freshers with empty skills gracefully', () => {
      const cand = [];
      const job = ['react', 'node.js'];
      const res = calculateSkillMatch(cand, job);
      expect(res.matchScore).toBe(0);
      expect(res.matchingSkills).toHaveLength(0);
      expect(res.missingSkills).toEqual(['react', 'node.js']);
    });
  });

  describe('TF-IDF Vectorizer & Cosine Similarity', () => {
    test('should give high cosine similarity for semantically close texts', () => {
      const vectorizer = new TFIDFVectorizer();
      const docA = 'React Node.js full stack web developer';
      const docB = 'Looking for full stack developer with React and Node.js';
      const docC = 'Civil engineer structural concrete modeling';

      vectorizer.fit([docA, docB, docC]);

      const vA = vectorizer.transform(docA);
      const vB = vectorizer.transform(docB);
      const vC = vectorizer.transform(docC);

      const simRelated = calculateCosineSimilarity(vA, vB);
      const simUnrelated = calculateCosineSimilarity(vA, vC);

      expect(simRelated).toBeGreaterThan(0.3);
      expect(simUnrelated).toBe(0); // orthogonal
    });

    test('should return 1.0 similarity for identical documents', () => {
      const vectorizer = new TFIDFVectorizer();
      const doc = 'Senior Python Django PostgreSQL developer';
      vectorizer.fit([doc]);

      const vec = vectorizer.transform(doc);
      const sim = calculateCosineSimilarity(vec, vec);
      expect(sim).toBeCloseTo(1.0, 5);
    });
  });

  describe('Scoring Engine Edge Cases', () => {
    test('should award 100% location score for Remote jobs', () => {
      const locScore = calculateLocationScore('Pune', 'Bangalore', 'Remote');
      expect(locScore).toBe(100);
    });

    test('should award 100% experience score when candidate fits min/max range', () => {
      const expScore = calculateExperienceScore(3, 2, 5);
      expect(expScore).toBe(100);
    });

    test('should compute weighted score within [0, 100] bounds', () => {
      const result = calculateWeightedScore({
        skillScore: 80,
        tfidfScore: 0.65,
        candidateExp: 3,
        minJobExp: 2,
        maxJobExp: 5,
        jobType: 'Remote',
      });

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.breakdown).toBeDefined();
    });
  });

  describe('Skill Gap Analyzer', () => {
    test('should generate explainable reasoning text', () => {
      const gap = analyzeSkillGap(
        ['react', 'node.js'],
        ['docker', 'redis'],
        85,
        { title: 'Software Engineer', company: 'Tech Inc' },
        { experienceYears: 2 }
      );

      expect(gap.explanation).toContain('Tech Inc');
      expect(gap.explanation).toContain('Outstanding Match');
    });
  });
});
