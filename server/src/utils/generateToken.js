const jwt = require('jsonwebtoken');

/**
 * Generates a signed JSON Web Token (JWT)
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} role - User role (candidate or admin)
 * @returns {string} - Signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;

