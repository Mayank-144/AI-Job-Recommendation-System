const { tokenizeAndRemoveStopwords, cleanText } = require('../services/textPreprocessor');

/**
 * In-Memory TF-IDF (Term Frequency - Inverse Document Frequency) Vectorizer
 * Built with pure JavaScript for zero-latency, free, offline execution.
 */
class TFIDFVectorizer {
  constructor() {
    this.vocabulary = new Map(); // word -> index
    this.idfValues = new Map();   // word -> idf float
    this.documentCount = 0;
  }

  /**
   * Fits the vectorizer on a corpus of documents (Candidate Resumes + Job Descriptions)
   * @param {string[]} documents - Array of raw document text strings
   */
  fit(documents) {
    this.documentCount = documents.length;
    this.vocabulary.clear();
    this.idfValues.clear();

    const docFreq = new Map(); // word -> number of documents containing word

    documents.forEach((doc) => {
      const cleaned = cleanText(doc);
      const tokens = tokenizeAndRemoveStopwords(cleaned);
      const uniqueTokensInDoc = new Set(tokens);

      uniqueTokensInDoc.forEach((token) => {
        docFreq.set(token, (docFreq.get(token) || 0) + 1);
        if (!this.vocabulary.has(token)) {
          this.vocabulary.set(token, this.vocabulary.size);
        }
      });
    });

    // Compute Smooth Inverse Document Frequency: IDF(t) = ln((N + 1) / (DF(t) + 1)) + 1
    docFreq.forEach((df, term) => {
      const idf = Math.log((this.documentCount + 1) / (df + 1)) + 1.0;
      this.idfValues.set(term, idf);
    });
  }

  /**
   * Transforms a single document text into a TF-IDF numerical vector
   * @param {string} text - Raw or cleaned document string
   * @returns {number[]} - Normalized TF-IDF vector matching vocabulary size
   */
  transform(text) {
    const vector = new Array(this.vocabulary.size).fill(0);
    const cleaned = cleanText(text);
    const tokens = tokenizeAndRemoveStopwords(cleaned);

    if (tokens.length === 0 || this.vocabulary.size === 0) {
      return vector;
    }

    // Calculate Term Frequency (TF): count(t) / total_tokens
    const termFreq = new Map();
    tokens.forEach((token) => {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    });

    termFreq.forEach((count, term) => {
      if (this.vocabulary.has(term)) {
        const index = this.vocabulary.get(term);
        const tf = count / tokens.length;
        const idf = this.idfValues.get(term) || 1.0;
        vector[index] = tf * idf;
      }
    });

    // L2 Vector Normalization (Unit vector): v / ||v||
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return vector.map((val) => val / magnitude);
    }

    return vector;
  }
}

module.exports = TFIDFVectorizer;

