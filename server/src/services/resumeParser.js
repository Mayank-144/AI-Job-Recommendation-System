const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

/**
 * Extracts raw textual content from PDF files
 * @param {string} filePath - Absolute or relative path to PDF file
 * @returns {Promise<string>} - Extracted text
 */
const parsePDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Extracts raw textual content from DOCX files
 * @param {string} filePath - Absolute or relative path to DOCX file
 * @returns {Promise<string>} - Extracted text
 */
const parseDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
};

/**
 * Orchestrator function to parse either PDF or DOCX automatically
 * @param {string} filePath - Path to file
 * @returns {Promise<{ rawText: string, fileType: string }>}
 */
const parseResumeFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    const rawText = await parsePDF(filePath);
    return { rawText, fileType: 'pdf' };
  } else if (ext === '.docx' || ext === '.doc') {
    const rawText = await parseDOCX(filePath);
    return { rawText, fileType: 'docx' };
  } else {
    throw new Error(`Unsupported resume extension: ${ext}`);
  }
};

module.exports = {
  parsePDF,
  parseDOCX,
  parseResumeFile,
};
