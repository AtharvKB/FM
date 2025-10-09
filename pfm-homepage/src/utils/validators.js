// src/utils/validators.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} {isValid, message}
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validate number input (positive numbers only)
 * @param {string|number} value - Value to validate
 * @returns {boolean} True if valid number
 */
export const isValidAmount = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate required field
 * @param {string} value - Value to check
 * @returns {boolean} True if not empty
 */
export const isRequired = (value) => {
  return value && value.trim().length > 0;
};

/**
 * Sanitize input (remove special characters)
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  return input.trim().replace(/[<>]/g, '');
};
