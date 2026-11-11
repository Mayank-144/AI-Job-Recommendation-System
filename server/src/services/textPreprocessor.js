// Standard English Stopwords set (Clean pure CommonJS for zero-dependency test execution)
const ENGLISH_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while',
  'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll',
  'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Normalizes and cleans raw text extracted from resumes or job descriptions.
 * - Lowercases text
 * - Removes URLs, emails, phone numbers, and arbitrary punctuation noise
 * - Normalizes whitespace
 * - Keeps essential programming symbols (e.g. c++, c#, node.js, .net)
 */
const cleanText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }

  let text = rawText.toLowerCase();

  // Remove URLs
  text = text.replace(/https?:\/\/\S+|www\.\S+/g, ' ');

  // Remove Emails
  text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, ' ');

  // Remove phone numbers
  text = text.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, ' ');

  // Protect specific technical terms before stripping punctuation
  text = text
    .replace(/\bc\+\+\b/g, 'cpp_tech')
    .replace(/\bc#\b/g, 'csharp_tech')
    .replace(/\b\.net\b/g, 'dotnet_tech')
    .replace(/\bnode\.js\b/g, 'nodejs_tech')
    .replace(/\breact\.js\b/g, 'reactjs_tech')
    .replace(/\bvue\.js\b/g, 'vuejs_tech')
    .replace(/\bnext\.js\b/g, 'nextjs_tech');

  // Replace special characters and non-alphanumeric (except underscores and spaces)
  text = text.replace(/[^a-z0-9_\s]/g, ' ');

  // Restore protected terms
  text = text
    .replace(/\bcpp_tech\b/g, 'c++')
    .replace(/\bcsharp_tech\b/g, 'c#')
    .replace(/\bdotnet_tech\b/g, '.net')
    .replace(/\bnodejs_tech\b/g, 'node.js')
    .replace(/\breactjs_tech\b/g, 'react.js')
    .replace(/\bvuejs_tech\b/g, 'vue.js')
    .replace(/\bnextjs_tech\b/g, 'next.js');

  // Replace multiple spaces, newlines, and tabs with single space
  text = text.replace(/\s+/g, ' ').trim();

  return text;
};

/**
 * Tokenizes cleaned text into words and removes standard English stopwords
 */
const tokenizeAndRemoveStopwords = (cleanedText) => {
  if (!cleanedText) return [];

  // Match words of 2 or more characters
  const tokens = cleanedText.toLowerCase().match(/\b[a-z0-9_#+.]+\b/g) || [];

  return tokens.filter((token) => !ENGLISH_STOPWORDS.has(token) && token.length > 1);
};

module.exports = {
  cleanText,
  tokenizeAndRemoveStopwords,
};

