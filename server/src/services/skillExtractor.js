/**
 * Comprehensive Technical Skill Taxonomy & Synonyms Mapping
 * Normalizes different variations of skills into standard lowercase canonical keys
 */
const SKILL_SYNONYMS = {
  // Frontend
  react: ['react', 'react.js', 'reactjs'],
  'next.js': ['next.js', 'nextjs', 'next'],
  vue: ['vue', 'vue.js', 'vuejs'],
  angular: ['angular', 'angularjs', 'angular.js'],
  javascript: ['javascript', 'js', 'es6', 'ecmascript'],
  typescript: ['typescript', 'ts'],
  html5: ['html', 'html5'],
  css3: ['css', 'css3', 'scss', 'sass'],
  tailwind: ['tailwind', 'tailwindcss', 'tailwind-css'],
  bootstrap: ['bootstrap', 'bootstrap5'],
  redux: ['redux', 'redux-toolkit', 'rtk'],

  // Backend
  'node.js': ['node', 'node.js', 'nodejs'],
  'express.js': ['express', 'express.js', 'expressjs'],
  nest: ['nest', 'nestjs', 'nest.js'],
  python: ['python', 'python3', 'py'],
  django: ['django', 'drf', 'django rest framework'],
  flask: ['flask'],
  fastapi: ['fastapi'],
  java: ['java', 'core java'],
  'spring boot': ['spring boot', 'springboot', 'spring-boot', 'spring'],
  'c++': ['c++', 'cpp'],
  'c#': ['c#', 'csharp', '.net', 'asp.net'],
  go: ['go', 'golang'],
  php: ['php', 'laravel'],
  rust: ['rust'],

  // Database
  mongodb: ['mongodb', 'mongo', 'mongoose'],
  postgresql: ['postgresql', 'postgres', 'psql'],
  mysql: ['mysql', 'sql'],
  redis: ['redis', 'redis cache'],
  sqlite: ['sqlite', 'sqlite3'],
  elasticsearch: ['elasticsearch', 'elastic search'],

  // Cloud & DevOps
  aws: ['aws', 'amazon web services', 's3', 'ec2', 'lambda'],
  docker: ['docker', 'docker compose', 'containerization'],
  kubernetes: ['kubernetes', 'k8s'],
  git: ['git', 'github', 'gitlab', 'bitbucket'],
  cicd: ['ci/cd', 'cicd', 'jenkins', 'github actions'],
  linux: ['linux', 'ubuntu', 'bash', 'shell scripting'],
  nginx: ['nginx'],

  // AI & Data Science
  machine_learning: ['machine learning', 'ml', 'deep learning', 'dl'],
  nlp: ['nlp', 'natural language processing'],
  tensorflow: ['tensorflow', 'tf'],
  pytorch: ['pytorch'],
  pandas: ['pandas'],
  numpy: ['numpy'],
  scikit_learn: ['scikit-learn', 'sklearn'],

  // Architecture & APIs
  rest_api: ['rest', 'rest api', 'restful', 'restful apis'],
  graphql: ['graphql'],
  microservices: ['microservices', 'microservice architecture'],
  jwt: ['jwt', 'json web tokens'],
  oauth: ['oauth', 'oauth2'],
};

/**
 * Extracts and normalizes technical skills from cleaned text
 * @param {string} cleanedText - Preprocessed lowercase text
 * @returns {string[]} - Array of unique canonical skills
 */
const extractSkills = (cleanedText) => {
  if (!cleanedText) return [];

  const foundSkills = new Set();
  const lowerText = ` ${cleanedText.toLowerCase()} `;

  // Search each canonical skill and its synonyms
  for (const [canonicalSkill, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    for (const synonym of synonyms) {
      // Escape special characters for regex matching
      const escaped = synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Look for whole word boundary match
      const regex = new RegExp(`(^|[^a-z0-9_#+])${escaped}(?=[^a-z0-9_#+]|$)`, 'i');

      if (regex.test(lowerText)) {
        foundSkills.add(canonicalSkill);
        break; // Once matched, no need to check other synonyms for the same skill
      }
    }
  }

  return Array.from(foundSkills);
};

/**
 * Normalizes an array of arbitrary skill strings inputted by candidates/admins
 * @param {string[]} skillsArray
 * @returns {string[]} - Array of canonical skills
 */
const normalizeSkills = (skillsArray) => {
  if (!Array.isArray(skillsArray)) return [];

  const normalized = new Set();

  skillsArray.forEach((rawSkill) => {
    if (!rawSkill || typeof rawSkill !== 'string') return;
    const skillTrimmed = rawSkill.trim().toLowerCase();

    let matched = false;
    for (const [canonicalSkill, synonyms] of Object.entries(SKILL_SYNONYMS)) {
      if (synonyms.includes(skillTrimmed) || canonicalSkill === skillTrimmed) {
        normalized.add(canonicalSkill);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Retain custom skill if not in dictionary
      normalized.add(skillTrimmed);
    }
  });

  return Array.from(normalized);
};

/**
 * Extracts estimated years of experience using regex heuristics
 * @param {string} text - Raw or cleaned resume text
 * @returns {number} - Estimated experience years
 */
const extractExperienceYears = (text) => {
  if (!text) return 0;

  // Patterns like "4 years of experience", "3+ yrs experience", "5.5 years"
  const patterns = [
    /(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/gi,
    /experience\s*:\s*(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/gi,
    /(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s+in\s+software/gi,
  ];

  let maxYears = 0;

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const years = parseFloat(match[1]);
      if (years > maxYears && years <= 40) {
        maxYears = years;
      }
    }
  }

  return maxYears;
};

module.exports = {
  SKILL_SYNONYMS,
  extractSkills,
  normalizeSkills,
  extractExperienceYears,
};
