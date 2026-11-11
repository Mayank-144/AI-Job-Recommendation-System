const natural = require('natural');

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
 * using Natural.js stopwords library
 */
const tokenizeAndRemoveStopwords = (cleanedText) => {
  if (!cleanedText) return [];

  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(cleanedText.toLowerCase());

  // Filter English stopwords
  const stopwords = new Set(natural.stopwords);

  return tokens.filter((token) => !stopwords.has(token) && token.length > 1);
};

module.exports = {
  cleanText,
  tokenizeAndRemoveStopwords,
};

