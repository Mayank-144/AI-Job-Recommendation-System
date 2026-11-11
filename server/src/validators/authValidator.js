/**
 * Validates user registration payload
 */
const validateRegisterInput = (data) => {
  const errors = [];
  const { name, email, password, role } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters long');
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long');
  }

  if (role && !['candidate', 'admin'].includes(role)) {
    errors.push('Role must be either candidate or admin');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates user login payload
 */
const validateLoginInput = (data) => {
  const errors = [];
  const { email, password } = data;

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
